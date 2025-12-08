import { createContext, useState } from "react";

export const GpsContext = createContext();

export function GpsProvider({ children }) {
  const [activeOrderId, setActiveOrderId] = useState(null);

  return (
    <GpsContext.Provider value={{ activeOrderId, setActiveOrderId }}>
      {children}
    </GpsContext.Provider>
  );
}
