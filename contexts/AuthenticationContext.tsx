import { useContext, createContext, useState } from 'react';
import { LoginResponse } from '../types';

type AuthContextProps = {
  user: LoginResponse | undefined;
  setUser: React.Dispatch<React.SetStateAction<LoginResponse | undefined>>;
};
const AuthContext = createContext<AuthContextProps>({
  user: undefined,
  setUser: () => {},
});

export const AuthContextProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<LoginResponse>();

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
