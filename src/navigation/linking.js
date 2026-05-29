/** Deep linking + navigation depuis notifications push */

export const linking = {
  prefixes: ['eventspace://'],
  config: {
    screens: {
      Accueil: {
        screens: {
          HomeMain: 'home',
          VenueDetail: 'venue/:venueId',
        },
      },
      Reservations: 'reservations',
      Favoris: 'favorites',
      Messages: {
        screens: {
          ConversationsList: 'messages',
          ChatRoom: 'chat/:convId',
        },
      },
      Profil: 'profile',
      Dashboard: {
        screens: {
          Dashboard: 'dashboard',
          AddVenue: 'add-venue',
          EditVenue: 'edit-venue/:venueId',
          VenueAvailability: 'availability/:venueId',
        },
      },
    },
  },
};

/**
 * Route une notification tapée vers le bon écran.
 * @param {object} navigation - ref.current de NavigationContainer
 * @param {object} data - payload data de la notification
 * @param {object} user - utilisateur connecté
 */
export function navigateFromNotification(navigation, data, user) {
  if (!navigation || !data) return;

  const screen = data.screen;
  const reservationId = data.reservationId;

  if (user?.role === 'annonceur') {
    if (screen === 'OwnerReservations' || screen === 'Reservations' || screen === 'Dashboard') {
      navigation.navigate('Dashboard', { tab: 'requests', reservationId });
      return;
    }
  }

  if (screen === 'Reservations') {
    navigation.navigate('Reservations', { reservationId, action: data.action });
    return;
  }

  if (screen === 'Messages' || screen === 'Chat') {
    navigation.navigate('Messages');
    return;
  }

  navigation.navigate('Accueil');
}
