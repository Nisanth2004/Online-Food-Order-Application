import React from "react";
export default function Navbar({ title }) {
  return (
    <div className="bg-white shadow p-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="font-bold">{title}</div>
        </div>
      </div>
    </div>
  );
}
