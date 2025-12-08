import React, { useEffect, useState } from "react";
import api from "../../service/CustomAxiosInstance";

export default function LiveMap({ orderId }) {
  const [location, setLocation] = useState(null);

  const load = async () => {
    try {
      const res = await api.get(`/api/partner/location/latest?orderId=${orderId}`);
      setLocation(res.data);
    } catch (e) {
      console.error("map fetch error", e);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (!location) return <p>Waiting for live location…</p>;

  const { latitude, longitude } = location;

  return (
    <div>
      <h2 className="section-header">Live Delivery Location</h2>

      <iframe
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: "12px" }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`}
      />
    </div>
  );
}
