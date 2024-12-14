import React, { createContext } from "react";

const UserContext = createContext(null);

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
    
  return <UserContext.Provider>{{ children }}</UserContext.Provider>;
};
