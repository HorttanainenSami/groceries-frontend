import { useContext, createContext, useState } from 'react';
import { loginResponse } from '../types';

type authContextProps = {
  user: loginResponse | undefined;
  setUser: React.Dispatch<React.SetStateAction<loginResponse | undefined>>;
};
const AuthContext = createContext<authContextProps>({
  user: undefined,
  setUser: () => {},
});

export const AuthContextProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<loginResponse>();

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
