export interface HeaderProps {
  onMenuPress?: () => void;
  currentUser: {
    id: string;       // unique identifier for the device/session
    token?: string;   // optional if you want auth
    isPWD: boolean;
  };
  setCurrentUser: (user: { id: string; token?: string; isPWD: boolean }) => void;
}
