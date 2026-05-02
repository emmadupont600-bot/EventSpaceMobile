/**
 * Assistant IA de recherche en langage naturel
 * Parse une requête texte libre et retourne des critères de filtre + les lieux correspondants
 */

const KEYWORDS = {
  // Types d'événements → type de lieu
  mariage:      { types: ['Château'],              eventLabel: '💍 Mariage' },
  mariages:     { types: ['Château'],              eventLabel: '💍 Mariage' },
  anniversaire: { types: ['Salle de réception', 'Rooftop', 'Loft', 'Péniche'], eventLabel: '🎂 Anniversaire' },
  soirée:       { types: ['Rooftop', 'Loft', 'Péniche', 'Cave'],               eventLabel: '🎉 Soirée' },
  soiree:       { types: ['Rooftop', 'Loft', 'Péniche', 'Cave'],               eventLabel: '🎉 Soirée' },
  séminaire:    { types: ['Loft'],                 eventLabel: '💼 Séminaire' },
  seminaire:    { types: ['Loft'],                 eventLabel: '💼 Séminaire' },
  conférence:   { types: ['Loft'],                 eventLabel: '💼 Conférence' },
  shooting:     { types: ['Studio photo'],         eventLabel: '📸 Shooting' },
  photo:        { types: ['Studio photo'],         eventLabel: '📸 Photo' },
  jardin:       { types: ['Jardin'],               eventLabel: '🌿 Plein air' },
  plein:        { types: ['Jardin'],               eventLabel: '🌿 Plein air' },
  péniche:      { types: ['Péniche'],              eventLabel: '⚓ Péniche' },
  peniche:      { types: ['Péniche'],              eventLabel: '⚓ Péniche' },
  cave:         { types: ['Cave'],                 eventLabel: '🍷 Cave' },
  rooftop:      { types: ['Rooftop'],              eventLabel: '🌙 Rooftop' },
  atypique:     { types: ['Péniche', 'Cave', 'Studio photo', 'Jardin', 'Loft'], eventLabel: null },
  original:     { types: ['Péniche', 'Cave', 'Studio photo', 'Jardin'],         eventLabel: null },
};

const CITIES = ['paris', 'lyon', 'bordeaux', 'marseille', 'aix', 'provence', 'beauvais', 'lille', 'nantes', 'toulouse'];

const CITY_MAP = {
  aix: 'Aix-en-Provence',
  provence: 'Aix-en-Provence',
  paris: 'Paris',
  lyon: 'Lyon',
  bordeaux: 'Bordeaux',
};

/**
 * Extrait un nombre de la phrase au contexte donné
 * Ex: "40 personnes" → 40, "budget 600€" → 600
 */
function extractNumber(text, contextWords) {
  for (const ctx of contextWords) {
    // Cherche NOMBRE avant le mot contexte
    const beforeRegex = new RegExp(`(\\d+)\\s*(?:€|euros?|pers(?:onnes?)?)?\\s*(?:de\\s+)?${ctx}`, 'i');
    // Cherche NOMBRE après le mot contexte
    const afterRegex = new RegExp(`${ctx}\\s*(?:de\\s+)?(?::|à)?\\s*(\\d+)`, 'i');
    let m = text.match(beforeRegex) || text.match(afterRegex);
    if (m) return parseInt(m[1] || m[2], 10);
  }
  // Cherche un nombre isolé suivi de "personnes" ou "€"
  const personMatch = text.match(/(\d+)\s*(?:personnes?|pers\b|guests?)/i);
  if (personMatch) return parseInt(personMatch[1], 10);
  return null;
}

function extractBudget(text) {
  const m = text.match(/(\d+)\s*(?:€|euros?|e\b)/i)
    || text.match(/budget\s*(?:de\s*)?(\d+)/i)
    || text.match(/maximum?\s*(\d+)/i)
    || text.match(/moins\s+de\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractCity(text) {
  const lower = text.toLowerCase();
  for (const city of CITIES) {
    if (lower.includes(city)) return CITY_MAP[city] || (city.charAt(0).toUpperCase() + city.slice(1));
  }
  // Cherche "à XX km de VILLE" - prend la ville
  const kmMatch = lower.match(/km\s+de\s+(\w+)/);
  if (kmMatch) {
    const c = kmMatch[1];
    return CITY_MAP[c] || null;
  }
  return null;
}

function extractCapacity(text) {
  return extractNumber(text, ['personnes', 'personne', 'pers', 'invités', 'guests', 'participants', 'convives']);
}

/**
 * Fonction principale : parse le texte et filtre les lieux
 * @param {string} query - Texte libre de l'utilisateur
 * @param {Array} venues - Liste complète des lieux
 * @returns {{ results: Array, criteria: Object, summary: string }}
 */
export function aiSearchVenues(query, venues) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);

  // Extraction des critères
  const city = extractCity(lower);
  const capacity = extractCapacity(lower);
  const budget = extractBudget(lower);

  // Détection du type d'événement
  let matchedTypes = [];
  let eventLabel = null;
  for (const word of words) {
    const clean = word.replace(/[^a-zéèêàâîïôùûç]/gi, '');
    if (KEYWORDS[clean]) {
      matchedTypes = [...matchedTypes, ...KEYWORDS[clean].types];
      if (KEYWORDS[clean].eventLabel && !eventLabel) {
        eventLabel = KEYWORDS[clean].eventLabel;
      }
    }
  }
  matchedTypes = [...new Set(matchedTypes)];

  // Filtrage
  let results = venues.filter(v => {
    if (matchedTypes.length > 0 && !matchedTypes.includes(v.type)) return false;
    if (city && !(v.city || '').toLowerCase().includes(city.toLowerCase())) return false;
    if (capacity && (v.capacity || 0) < capacity) return false;
    if (budget && (v.price || 0) > budget) return false;
    return true;
  });

  // Si aucun résultat strict, on assouplit (retire le filtre ville)
  if (results.length === 0 && city) {
    results = venues.filter(v => {
      if (matchedTypes.length > 0 && !matchedTypes.includes(v.type)) return false;
      if (capacity && (v.capacity || 0) < capacity) return false;
      if (budget && (v.price || 0) > budget) return false;
      return true;
    });
  }

  // Tri : coup de cœur en premier, puis par note
  results = results.sort((a, b) => {
    if (b.coupDeCoeur && !a.coupDeCoeur) return 1;
    if (a.coupDeCoeur && !b.coupDeCoeur) return -1;
    return (b.rating || 0) - (a.rating || 0);
  });

  // Limite à 5 résultats
  const top = results.slice(0, 5);

  // Résumé lisible
  const parts = [];
  if (eventLabel) parts.push(eventLabel);
  if (capacity)   parts.push(`${capacity} personnes`);
  if (city)       parts.push(`à ${city}`);
  if (budget)     parts.push(`max ${budget}€/h`);

  const summary = parts.length > 0
    ? `✨ ${top.length} lieu${top.length > 1 ? 'x' : ''} trouvé${top.length > 1 ? 's' : ''} · ${parts.join(' · ')}`
    : `✨ ${top.length} lieu${top.length > 1 ? 'x' : ''} trouvé${top.length > 1 ? 's' : ''}`;

  return {
    results: top,
    criteria: { city, capacity, budget, types: matchedTypes, eventLabel },
    summary,
    hasResults: top.length > 0,
  };
}
