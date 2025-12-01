import React, { useContext, useState } from "react";
import { PartnerContext } from "../context/PartnerContext";
import toast from "react-hot-toast";

export default function Settings() {
  const { partnerName, savePartnerName } = useContext(PartnerContext);
  const [name, setName] = useState(partnerName || "");

  const save = () => {
    if (!name.trim()) {
      toast.error("Enter your assigned courier name (provided by admin)");
      return;
    }
    savePartnerName(name.trim());
    toast.success("Partner name saved");
  };

  return (
    <div className="container page">
      <h2>Settings</h2>
      <p>Enter your assigned courier name (exactly as admin uses in orders)</p>
      <div className="form-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Courier name (e.g., DELHIVERY)" />
        <button onClick={save}>Save</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Current: </strong> {partnerName || <em>Not set</em>}
      </div>
    </div>
  );
}
