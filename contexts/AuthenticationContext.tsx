import { useContext, createContext, useState} from 'react';

type authContextProps = {
  user?: string,
};
export const AuthContext = createContext<authContextProps|null>(null);


export const AuthContextProvider = ({children} : React.PropsWithChildren) => {
  const [user, setUser] = useState<authContextProps|null>(null);
  const login = () => {
    //TODO
    //connect to backend and check if credentials match
  };
  const logout = () => {
    //TODO
    //remove replace context with null
  };

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );

};


export const useAuth = () => useContext(AuthContext);
