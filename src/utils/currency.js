/** Utilitaires multi-devise EventSpace */

export const SUPPORTED_CURRENCIES = [
  { code: 'eur', symbol: '€', label: 'Euro', locale: 'fr-FR' },
  { code: 'usd', symbol: '$', label: 'Dollar US', locale: 'en-US' },
  { code: 'gbp', symbol: '£', label: 'Livre sterling', locale: 'en-GB' },
  { code: 'chf', symbol: 'CHF', label: 'Franc suisse', locale: 'de-CH' },
];

const CURRENCY_MAP = Object.fromEntries(SUPPORTED_CURRENCIES.map(c => [c.code, c]));

export function getCurrency(code = 'eur') {
  return CURRENCY_MAP[(code || 'eur').toLowerCase()] || CURRENCY_MAP.eur;
}

export function formatMoney(amount, currencyCode = 'eur') {
  const c = getCurrency(currencyCode);
  const value = parseFloat(amount) || 0;
  return `${value.toLocaleString(c.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${c.symbol}`;
}

export function formatMoneyPerHour(amount, currencyCode = 'eur') {
  const c = getCurrency(currencyCode);
  const value = parseFloat(amount) || 0;
  return `${value.toLocaleString(c.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${c.symbol}/h`;
}

/** Montant euros → centimes pour Stripe */
export function toStripeCents(amountEuros) {
  return Math.round((parseFloat(amountEuros) || 0) * 100);
}

/** Applique une réduction promo */
export function applyDiscount(total, { discount_type, discount_value }) {
  const base = parseFloat(total) || 0;
  if (!discount_type || !discount_value) return { total: base, discount: 0 };
  const discount = discount_type === 'percent'
    ? Math.round(base * (discount_value / 100) * 100) / 100
    : Math.min(base, parseFloat(discount_value));
  return {
    total: Math.max(0, Math.round((base - discount) * 100) / 100),
    discount: Math.round(discount * 100) / 100,
  };
}
