/** @jest-environment node */
/**
 * Tests des flux financiers — stripeService.
 * De l'argent réel est en jeu : tout changement de calcul de commission,
 * de conversion centimes/euros ou de capture doit faire échouer ces tests.
 */

const mockInvoke = jest.fn();
const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));

jest.mock('../src/services/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import {
  calcCommission,
  calculateFees,
  computePricing,
  createPaymentIntent,
  processPayment,
  capturePayment,
  refundPayment,
  updateReservationPaymentStatus,
  COMMISSION_RATE,
} from '../src/services/stripeService';

beforeEach(() => {
  mockInvoke.mockReset();
  mockUpdateEq.mockReset();
  mockUpdate.mockClear();
  mockFrom.mockClear();
});

describe('COMMISSION_RATE', () => {
  it('est de 12% (source unique : constants/app)', () => {
    expect(COMMISSION_RATE).toBe(0.12);
  });
});

describe('calcCommission', () => {
  it('calcule commission et net annonceur sur un montant rond', () => {
    expect(calcCommission(1000)).toEqual({ total: 1000, commission: 120, net: 880 });
  });

  it('arrondit au centime près', () => {
    const { total, commission, net } = calcCommission(99.99);
    expect(total).toBe(99.99);
    expect(commission).toBe(12);
    expect(net).toBe(87.99);
    expect(Math.round((commission + net) * 100) / 100).toBe(total);
  });

  it('retourne 0 pour des montants invalides', () => {
    expect(calcCommission('abc')).toEqual({ total: 0, commission: 0, net: 0 });
    expect(calcCommission(undefined)).toEqual({ total: 0, commission: 0, net: 0 });
  });

  it('expose un alias calculateFees identique', () => {
    expect(calculateFees).toBe(calcCommission);
  });
});

describe('computePricing', () => {
  it('calcule les heures et le sous-total', () => {
    expect(computePricing({ pricePerHour: 150, startTime: '14:00', endTime: '18:00' }))
      .toEqual({ hours: 4, subtotal: 600, total: 600 });
  });

  it('gère les demi-heures', () => {
    const { hours, subtotal } = computePricing({ pricePerHour: 100, startTime: '10:00', endTime: '11:30' });
    expect(hours).toBe(1.5);
    expect(subtotal).toBe(150);
  });

  it('borne une durée négative à 0 (pas de total négatif)', () => {
    expect(computePricing({ pricePerHour: 200, startTime: '18:00', endTime: '14:00' }).total).toBe(0);
  });
});

describe('createPaymentIntent', () => {
  it('appelle l’Edge Function avec un montant en centimes arrondi', async () => {
    mockInvoke.mockResolvedValue({ data: { clientSecret: 'cs_123', paymentIntentId: 'pi_123' }, error: null });

    const result = await createPaymentIntent(15000.4, 'res-1');

    expect(mockInvoke).toHaveBeenCalledWith('create-payment-intent', {
      body: expect.objectContaining({
        amount: 15000,
        currency: 'eur',
        reservation_id: 'res-1',
      }),
    });
    expect(result).toEqual({ clientSecret: 'cs_123', paymentIntentId: 'pi_123' });
  });

  it('jette une erreur si l’Edge Function échoue', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(createPaymentIntent(1000, 'res-1')).rejects.toThrow('boom');
  });

  it('jette une erreur si la réponse ne contient pas de clientSecret', async () => {
    mockInvoke.mockResolvedValue({ data: { paymentIntentId: 'pi_123' }, error: null });
    await expect(createPaymentIntent(1000, 'res-1')).rejects.toThrow('Réponse invalide');
  });
});

describe('processPayment', () => {
  it('convertit les euros en centimes avant l’appel Stripe', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true, paymentIntentId: 'pi_9', clientSecret: 'cs_9' },
      error: null,
    });

    const result = await processPayment({ amount: '123.45', reservationId: 'res-9', venueName: 'Loft' });

    expect(mockInvoke).toHaveBeenCalledWith('stripe-create-payment', {
      body: { amount: 12345, reservationId: 'res-9', venueName: 'Loft' },
    });
    expect(result.success).toBe(true);
    expect(result.amount).toBe(123.45);
  });

  it('refuse un montant invalide ou nul sans appeler Stripe', async () => {
    expect(await processPayment({ amount: 0, reservationId: 'r' })).toEqual({ success: false, error: 'Montant invalide' });
    expect(await processPayment({ amount: 'abc', reservationId: 'r' })).toEqual({ success: false, error: 'Montant invalide' });
    expect(await processPayment({ amount: -50, reservationId: 'r' })).toEqual({ success: false, error: 'Montant invalide' });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('retourne success:false si Stripe répond en erreur', async () => {
    mockInvoke.mockResolvedValue({ data: { success: false, error: 'carte refusée' }, error: null });
    const result = await processPayment({ amount: 100, reservationId: 'r' });
    expect(result).toEqual({ success: false, error: 'carte refusée' });
  });
});

describe('capturePayment (acceptation annonceur)', () => {
  it('refuse sans paymentIntentId', async () => {
    expect(await capturePayment(null)).toEqual({ success: false, error: 'Pas de paymentIntentId' });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('capture le paiement via l’Edge Function', async () => {
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
    expect(await capturePayment('pi_42')).toEqual({ success: true, paymentIntentId: 'pi_42' });
    expect(mockInvoke).toHaveBeenCalledWith('stripe-capture', { body: { paymentIntentId: 'pi_42' } });
  });

  it('remonte les erreurs de capture sans throw', async () => {
    mockInvoke.mockResolvedValue({ data: { success: false, error: 'capture failed' }, error: null });
    expect(await capturePayment('pi_42')).toEqual({ success: false, error: 'capture failed' });
  });
});

describe('refundPayment (annulation)', () => {
  it('refuse sans paymentIntentId', async () => {
    expect(await refundPayment(undefined)).toEqual({ success: false, error: 'Pas de paymentIntentId' });
  });

  it('rembourse via l’Edge Function', async () => {
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
    expect(await refundPayment('pi_7')).toEqual({ success: true, paymentIntentId: 'pi_7' });
    expect(mockInvoke).toHaveBeenCalledWith('stripe-refund', { body: { paymentIntentId: 'pi_7' } });
  });
});

describe('updateReservationPaymentStatus', () => {
  it('enregistre paid_at quand le statut passe à paid', async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    await updateReservationPaymentStatus('res-1', 'pi_1', 'paid');

    expect(mockFrom).toHaveBeenCalledWith('reservations');
    const payload = mockUpdate.mock.calls[0][0];
    expect(payload.payment_status).toBe('paid');
    expect(payload.payment_intent_id).toBe('pi_1');
    expect(typeof payload.paid_at).toBe('string');
  });

  it('ne définit pas paid_at pour les autres statuts', async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    await updateReservationPaymentStatus('res-1', 'pi_1', 'refunded');

    const payload = mockUpdate.mock.calls[0][0];
    expect(payload.paid_at).toBeUndefined();
  });

  it('jette une erreur si la mise à jour échoue', async () => {
    mockUpdateEq.mockResolvedValue({ error: { message: 'db down' } });
    await expect(updateReservationPaymentStatus('res-1', 'pi_1', 'paid')).rejects.toThrow('db down');
  });
});
