import { createContext, useState } from "react";

export const HubContext = createContext();

export default function HubProvider({ children }) {
  const [hub, setHub] = useState(
    JSON.parse(localStorage.getItem("hub") || "null")
  );
  return (
    <HubContext.Provider value={{ hub, setHub }}>
      {children}
    </HubContext.Provider>
  );
}
