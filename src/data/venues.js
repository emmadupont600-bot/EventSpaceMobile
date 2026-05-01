export const VENUES = [
  {
    id: 1,
    name: 'Espace Lumière',
    city: 'Paris',
    address: '12 rue de la Paix, 75001 Paris',
    price: 120,
    capacity: 80,
    rating: 4.8,
    reviewCount: 42,
    type: 'Salle de réception',
    published: true,
    ownerId: 2,
    img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
    description: 'Un espace élégant au cœur de Paris, idéal pour vos réceptions, mariages et événements d\'entreprise. Lumière naturelle, décoration moderne.',
    amenities: ['Sono & éclairage', 'Cuisine équipée', 'Wi-Fi', 'Climatisation', 'Parking', 'Accès PMR'],
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
      'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600',
    ]
  },
  {
    id: 2,
    name: 'Rooftop Panorama',
    city: 'Lyon',
    address: '8 place Bellecour, 69002 Lyon',
    price: 200,
    capacity: 120,
    rating: 4.9,
    reviewCount: 67,
    type: 'Rooftop',
    published: true,
    ownerId: 2,
    img: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600',
    description: 'Vue panoramique sur Lyon depuis ce rooftop exceptionnel. Parfait pour cocktails, soirées privées et lancements de produits.',
    amenities: ['Bar équipé', 'Vue 360°', 'Service traiteur', 'Wi-Fi', 'Chauffage extérieur', 'Scène'],
    gallery: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600',
    ]
  },
  {
    id: 3,
    name: 'Le Loft Industriel',
    city: 'Bordeaux',
    address: '45 quai des Chartrons, 33000 Bordeaux',
    price: 90,
    capacity: 60,
    rating: 4.7,
    reviewCount: 28,
    type: 'Loft',
    published: true,
    ownerId: 2,
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    description: 'Ancien entrepôt réhabilité avec cachet industriel. Briques apparentées, poutres métalliques, esprit loft new-yorkais.',
    amenities: ['Projecteur 4K', 'Sound system', 'Lumière réglable', 'Wi-Fi', 'Vestiaire', 'Terrasse'],
    gallery: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    ]
  },
  {
    id: 4,
    name: 'Château des Roses',
    city: 'Bordeaux',
    address: 'Route des Châteaux, 33250 Pauillac',
    price: 450,
    capacity: 200,
    rating: 5.0,
    reviewCount: 19,
    type: 'Château',
    published: true,
    ownerId: 2,
    img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
    description: 'Château du XVIIIe siècle au milieu des vignes. Le cadre idéal pour un mariage de prestige ou un gala d\'entreprise.',
    amenities: ['Parc 5 hectares', 'Suite nuptiale', 'Cuisine professionnelle', 'Hébergement', 'Parking 100 véhicules', 'Décoration florale'],
    gallery: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
    ]
  },
  {
    id: 5,
    name: 'Studio Lumia',
    city: 'Paris',
    address: '22 rue Oberkampf, 75011 Paris',
    price: 75,
    capacity: 20,
    rating: 4.6,
    reviewCount: 54,
    type: 'Studio photo',
    published: true,
    ownerId: 2,
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    description: 'Studio photo professionnel équipé cyclorama, fonds multiples et éclairage studio. Idéal pour shootings mode, corporate et publicité.',
    amenities: ['Cyclorama blanc', 'Flash de studio', 'Fond papier 10 couleurs', 'Loge maquillage', 'Wi-Fi', 'Vestiaire'],
    gallery: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    ]
  },
  {
    id: 6,
    name: 'Jardin Secret',
    city: 'Marseille',
    address: '3 traverse du Moulin, 13008 Marseille',
    price: 110,
    capacity: 100,
    rating: 4.8,
    reviewCount: 33,
    type: 'Jardin',
    published: true,
    ownerId: 2,
    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    description: 'Jardin méditerranéen de 1500m² avec piscine et pergola. Vue sur la mer. L\'endroit rêvé pour vos événements en plein air.',
    amenities: ['Piscine', 'Pergola', 'BBQ professionnel', 'Sono extérieure', 'Parking', 'Vue mer'],
    gallery: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    ]
  }
];

export const DEMO_USERS = [
  { id: 1, role: 'particulier', email: 'user@demo.fr', password: 'demo1234', firstName: 'Sophie', lastName: 'Martin', phone: '0612345678' },
  { id: 2, role: 'annonceur', email: 'annonceur@demo.fr', password: 'demo5678', firstName: 'Marc', lastName: 'Dupont', phone: '0698765432', venueName: 'EventPro Agency' },
];

export const DEMO_REVIEWS = [
  { id: 1, venueId: 1, author: 'Julie R.', rating: 5, text: 'Lieu magnifique, service impeccable. Notre mariage était parfait !', date: '2026-04-15' },
  { id: 2, venueId: 1, author: 'Thomas B.', rating: 4, text: 'Très bel espace pour notre séminaire. Excellent accueil.', date: '2026-03-22' },
  { id: 3, venueId: 2, author: 'Claire M.', rating: 5, text: 'Vue incroyable ! Soirée inoubliable pour nos 30 ans de mariage.', date: '2026-04-01' },
  { id: 4, venueId: 3, author: 'Antoine D.', rating: 5, text: 'Cadre industriel super stylish. Parfait pour notre after work.', date: '2026-02-18' },
];

export const DEMO_RESERVATIONS = [
  { id: 101, venueId: 1, venueName: 'Espace Lumière', userId: 1, ownerId: 2, date: '2026-06-14', start: '18:00', end: '23:00', guests: 50, eventType: 'Anniversaire', status: 'confirmed', total: 728, createdAt: '2026-05-01T10:00:00Z' },
  { id: 102, venueId: 2, venueName: 'Rooftop Panorama', userId: 1, ownerId: 2, date: '2026-07-20', start: '20:00', end: '02:00', guests: 80, eventType: 'Soirée privée', status: 'pending', total: 1568, createdAt: '2026-05-02T14:00:00Z' },
];
