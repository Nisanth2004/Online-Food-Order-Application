import React, { useState } from "react";

const SecretInput = ({ value, onChange, name, disabled }) => {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="input-group mb-2">
      <input
        type={hidden ? "password" : "text"}
        className="form-control"
        value={value}
        name={name}
        onChange={onChange}
        disabled={disabled}
        style={{ letterSpacing: hidden ? "4px" : "normal" }}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setHidden(!hidden)}
      >
        {hidden ? "👁️ " : "🙈 "}
      </button>
    </div>
  );
};

export default SecretInput;
