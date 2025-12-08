import { createContext, useState } from "react";

export const DeliveryContext = createContext();

export default function DeliveryProvider({ children }) {
  const [deliveryBoy, setDeliveryBoy] = useState(
    JSON.parse(localStorage.getItem("deliveryBoy") || "null")
  );
  return (
    <DeliveryContext.Provider value={{ deliveryBoy, setDeliveryBoy }}>
      {children}
    </DeliveryContext.Provider>
  );
}
