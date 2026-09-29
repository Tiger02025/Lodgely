export type RootStackParamList = {
  Login: undefined;
  RegisterStudent: undefined;
  RegisterLandlord: undefined;
  Main: undefined;
  PropertyDetail: { id: string };
  Booking: { propertyId: string };
  Home: undefined;
  SavedProperties: undefined;
  Profile: undefined;
  Notifications: undefined;
  Matchmaking: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  SavedTab: undefined;
  MatchmakingTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};
