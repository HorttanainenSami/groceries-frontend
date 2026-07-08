import { useContext, createContext, useState } from 'react';
import { LoginResponseType } from '@groceries/shared_types';

type AuthContextProps = {
  user: LoginResponseType | undefined;
  setUser: React.Dispatch<React.SetStateAction<LoginResponseType | undefined>>;
};
export const AuthContext = createContext<AuthContextProps>({
  user: undefined,
  setUser: () => {},
});

export const AuthContextProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<LoginResponseType>();

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
