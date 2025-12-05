import React, { useEffect, useState } from "react";
import api from "../../services/CustomAxiosInstance";
import { toast } from "react-toastify";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    awsAccess: "",
    awsSecret: "",
    awsRegion: "",
    awsBucket: "",
    razorpayKey: "",
    razorpaySecret: "",
    twilioSid: "",
    twilioAuth: "",
    twilioPhone: ""
  });

  const [editable, setEditable] = useState(false);

  // Load settings from DB
  const loadSettings = async () => {
    try {
      const res = await api.get("api/admin/settings");
      if (res.data) setSettings(res.data);
    } catch (err) {
      toast.error("Failed to load settings");
    }
  };

  // Save settings to DB
  const saveSettings = async () => {
    try {
      await api.put("/api/admin/settings", settings);
      toast.success("Settings updated successfully");
      setEditable(false); // Disable editing after save
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">⚙️ System Settings</h3>
        <button 
          className={`btn ${editable ? "btn-success" : "btn-primary"}`} 
          onClick={editable ? saveSettings : () => setEditable(true)}
        >
          {editable ? "💾 Save Changes" : "✏️ Edit Settings"}
        </button>
      </div>
      <p className="text-muted mb-4">Manage AWS, Payment, and SMS configurations dynamically</p>

      <div className="row g-4">

        {/* AWS SETTINGS */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">🗄️ AWS S3 Configuration</h5>


              <label className="form-label">Access Key</label>
              <input
                className="form-control mb-2"
                name="awsAccess"
                value={settings.awsAccess}
                onChange={handleChange}
                disabled={!editable}
              />

              <label className="form-label">Secret Key</label>
              <input
                className="form-control mb-2"
                name="awsSecret"
                value={settings.awsSecret}
                onChange={handleChange}
                disabled={!editable}
              />

              <label className="form-label">Region</label>
              <input
                className="form-control mb-2"
                name="awsRegion"
                value={settings.awsRegion}
                onChange={handleChange}
                disabled={!editable}
              />

              <label className="form-label">Bucket Name</label>
              <input
                className="form-control mb-2"
                name="awsBucket"
                value={settings.awsBucket}
                onChange={handleChange}
                disabled={!editable}
              />
            </div>
          </div>
        </div>

        {/* RAZORPAY SETTINGS */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">💳 Razorpay Settings</h5>

              <label className="form-label">Key</label>
              <input
                className="form-control mb-2"
                name="razorpayKey"
                value={settings.razorpayKey}
                onChange={handleChange}
                disabled={!editable}
              />

              <label className="form-label">Secret</label>
              <input
                className="form-control mb-2"
                name="razorpaySecret"
                value={settings.razorpaySecret}
                onChange={handleChange}
                disabled={!editable}
              />
            </div>
          </div>
        </div>

        {/* TWILIO SETTINGS */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">📞 Twilio Configuration</h5>

              <label className="form-label">Account SID</label>
              <input
                className="form-control mb-2"
                name="twilioSid"
                value={settings.twilioSid}
                onChange={handleChange}
                disabled={!editable}
              />

              <label className="form-label">Auth Token</label>
              <input
                className="form-control mb-2"
                name="twilioAuth"
                value={settings.twilioAuth}
                onChange={handleChange}
                disabled={!editable}
              />

              <label className="form-label">Phone Number</label>
              <input
                className="form-control mb-2"
                name="twilioPhone"
                value={settings.twilioPhone}
                onChange={handleChange}
                disabled={!editable}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
