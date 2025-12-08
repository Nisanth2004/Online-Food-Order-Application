// src/components/GpsTracker.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

/**
 * GpsTracker:
 * - Controlled by parent via `enabled` prop.
 * - Sends location to POST /api/partner/location { lat, lng, timestamp } every intervalSec
 * - Uses your existing api instance
 */
export default function GpsTracker({ enabled, intervalSec = 30 }) {
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const [status, setStatus] = useState("stopped"); // stopped | running | no-permission

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

const sendLocation = async (coords) => {
  try {
    await api.post(
      `/api/partner/location?orderId=${currentOrderId}`,
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "X-Partner-Id": partnerId, 
        },
      }
    );
    if (!currentOrderId) return; // no active order → don't send

  } catch (err) {
    console.error("gps push failed", err);
  }
};


  const start = async () => {
    if (!("geolocation" in navigator)) {
      setStatus("no-permission");
      toast.error("Geolocation unavailable in this browser.");
      return;
    }
    setStatus("running");

    // immediate single push
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendLocation(pos.coords);
      },
      (err) => {
        console.error(err);
        setStatus("no-permission");
        toast.error("Please allow location access.");
      },
      { enableHighAccuracy: true }
    );

    // periodic push using watchPosition (more real-time)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        sendLocation(pos.coords);
      },
      (err) => {
        console.error("watch error", err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    // fallback interval (ensures periodic even if watch position not supported)
    timerRef.current = setInterval(async () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords),
        (err) => console.error("interval geo err", err)
      );
    }, intervalSec * 1000);
  };

  const stop = () => {
    setStatus("stopped");
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <div
        className={`inline-block w-2.5 h-2.5 rounded-full ${status === "running" ? "bg-emerald-500" : status === "no-permission" ? "bg-red-400" : "bg-gray-300"}`}
        title={status}
      />
      <span className="text-xs text-slate-600">{status === "running" ? "Tracking" : status === "no-permission" ? "Location blocked" : "Tracking off"}</span>
    </div>
  );
}
