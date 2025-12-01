import React, { createContext, useState } from "react";

export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [partnerName, setPartnerName] = useState(
    localStorage.getItem("partnerName") || ""
  );

  const savePartnerName = (name) => {
    setPartnerName(name);
    localStorage.setItem("partnerName", name);
  };

  return (
    <PartnerContext.Provider value={{ partnerName, savePartnerName }}>
      {children}
    </PartnerContext.Provider>
  );
};
