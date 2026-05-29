/** @jest-environment node */

jest.mock('../src/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(),
    functions: { invoke: jest.fn() },
  },
}));

const { isUUID, normalizeVenue, normalizeReservation } = require('../src/utils/store');

describe('Store helpers', () => {
  describe('isUUID', () => {
    it('accepte un UUID v4 valide', () => {
      expect(isUUID('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
    });

    it('rejette les entiers et chaînes invalides', () => {
      expect(isUUID(1)).toBe(false);
      expect(isUUID('123')).toBe(false);
      expect(isUUID(null)).toBe(false);
      expect(isUUID(undefined)).toBe(false);
    });
  });

  describe('normalizeVenue', () => {
    it('mappe les champs snake_case vers camelCase', () => {
      const v = normalizeVenue({
        id: 'uuid-1',
        owner_id: 'owner-1',
        name: 'Loft',
        cover_url: 'https://example.com/img.jpg',
        gallery_urls: ['a.jpg'],
        review_count: 5,
        price: 150,
        capacity: 50,
        published: true,
      });

      expect(v.ownerId).toBe('owner-1');
      expect(v.img).toBe('https://example.com/img.jpg');
      expect(v.gallery).toEqual(['a.jpg']);
      expect(v.reviewCount).toBe(5);
    });
  });

  describe('normalizeReservation', () => {
    it('mappe payment_intent_id et statuts', () => {
      const r = normalizeReservation({
        id: 'res-1',
        venue_id: 'v-1',
        user_id: 'u-1',
        owner_id: 'o-1',
        venue_name: 'Château',
        payment_status: 'authorized',
        payment_intent_id: 'pi_123',
        start_time: '14:00',
        end_time: '18:00',
        total: 600,
        status: 'pending',
      });

      expect(r.paymentIntentId).toBe('pi_123');
      expect(r.paymentStatus).toBe('authorized');
      expect(r.start).toBe('14:00');
      expect(r.end).toBe('18:00');
    });
  });
});
