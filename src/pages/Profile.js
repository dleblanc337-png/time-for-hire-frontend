import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { suggestServices } from "../data/serviceKeywords";

function safeParse(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function Profile() {
  // Predictive suggestions for the LAST comma-separated token
  const serviceToken = (helper.services || "").split(",").pop()?.trim() || "";
  const serviceSuggestions = suggestServices(serviceToken);

  function applyServiceSuggestion(suggestion) {
    const parts = (helper.services || "").split(",");
    // replace last token with the suggestion
    parts[parts.length - 1] = ` ${suggestion}`;
    // normalize spacing and commas
    const next = parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .join(", ");

    setHelper((p) => ({ ...p, services: next + ", " })); // add trailing comma+space for easy next entry
  }

  const account = useMemo(() => safeParse("user", null), []);
  const [base, setBase] = useState(() => safeParse("tfh_profile", {
    publicName: "",
    city: "",
    photoUrl: "",
  }));

  const [offerServices, setOfferServices] = useState(false);

  const [helper, setHelper] = useState(() =>
    safeParse("helperProfile", {
      offerServices: false,
      displayName: "",
      city: "",
      photoUrl: "",
      bio: "",
      services: "",
      serviceTags: [],
    })
  );

  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!account) return;

    // Initialize publicName from account.name if not set
    if (!base.publicName) {
      const full = (account.name || "").trim();
      if (full) {
        const parts = full.split(" ").filter(Boolean);
        const first = parts[0] || "";
        const last = parts.length > 1 ? parts[parts.length - 1] : "";
        const publicNameGuess = last ? `${first} ${last[0].toUpperCase()}.` : first;
        setBase((p) => ({ ...p, publicName: publicNameGuess }));
      }
    }

    // Keep Offer Services toggle synced with helperProfile
    setOfferServices(!!helper.offerServices);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!account) {
    return (
      <DashboardLayout>
        <h1>My Profile</h1>
        <p>Not logged in.</p>
      </DashboardLayout>
    );
  }

  const helperComplete =
    offerServices &&
    (helper.services || "").trim().length > 0 &&
    (helper.city || base.city || "").trim().length > 0;

  function saveBase() {
    const toSave = { ...base };
    localStorage.setItem("tfh_profile", JSON.stringify(toSave));

    // Also mirror a couple fields into `user` so other parts of the app can use them
    try {
      const userObj = safeParse("user", {});
      const updatedUser = {
        ...userObj,
        displayName: toSave.publicName,
        city: toSave.city,
        photoUrl: toSave.photoUrl,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch {}

    setMsg("Saved profile.");
    setTimeout(() => setMsg(""), 2500);
  }

  function saveHelper() {
    const rawServices = helper.services || "";
    const tags = rawServices
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const toSave = {
      ...helper,
      offerServices: !!offerServices,
      displayName: base.publicName || helper.displayName || account.name || "",
      city: helper.city || base.city || "",
      photoUrl: base.photoUrl || helper.photoUrl || "",
      serviceTags: tags,
    };

    localStorage.setItem("helperProfile", JSON.stringify(toSave));

    // Update global helpers list (used by marketplace/search pages)
    try {
      const helperId = account?.email || "unknown";
      const existing = safeParse("tfh_helpers", []);
      const others = existing.filter((h) => h.id !== helperId);

      const helperRecord = {
        id: helperId,
        email: account?.email || "",
        name: account?.name || toSave.displayName || "",
        profile: toSave,
      };

      localStorage.setItem("tfh_helpers", JSON.stringify([...others, helperRecord]));
    } catch {}

    setHelper(toSave);
    setMsg(helperComplete ? "Offer services enabled." : "Saved. Complete the section to enable helper features.");
    setTimeout(() => setMsg(""), 3000);
  }

  function onToggleOffer(e) {
    const checked = e.target.checked;
    setOfferServices(checked);

    const updated = { ...helper, offerServices: checked };
    setHelper(updated);
    localStorage.setItem("helperProfile", JSON.stringify(updated));
  }

  return (
    <DashboardLayout>
      <h1>My Profile</h1>

      {msg && <p style={{ color: "green", marginTop: 8 }}>{msg}</p>}

      {/* ACCOUNT (always visible) */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          border: "1px solid #ddd",
          maxWidth: 860,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Account</h3>

        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Photo */}
          <div>
            {base.photoUrl ? (
              <img
                src={base.photoUrl}
                alt="Profile"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #003f63",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  color: "#999",
                }}
              >
                ?
              </div>
            )}
          </div>

          {/* Fields */}
          <div style={{ flex: "1 1 360px", minWidth: 280 }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
              <div style={labelStyle}>Full name (private)</div>
              <div style={{ paddingTop: 6 }}>{account.name || "Not set"}</div>

              <div style={labelStyle}>Email (private)</div>
              <div style={{ paddingTop: 6 }}>{account.email}</div>

              <div style={labelStyle}>Public name</div>
              <input
                value={base.publicName}
                onChange={(e) => setBase((p) => ({ ...p, publicName: e.target.value }))}
                style={inputStyle}
                placeholder="Example: Dan L."
              />

              <div style={labelStyle}>City / area</div>
              <input
                value={base.city}
                onChange={(e) => setBase((p) => ({ ...p, city: e.target.value }))}
                style={inputStyle}
                placeholder="Victoria, BC"
              />

              <div style={labelStyle}>Photo URL</div>
              <input
                value={base.photoUrl}
                onChange={(e) => setBase((p) => ({ ...p, photoUrl: e.target.value }))}
                style={inputStyle}
                placeholder="Paste an image link (optional)"
              />
            </div>

            <button onClick={saveBase} style={primaryBtn}>
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* OFFER SERVICES (optional) */}
      <div
        style={{
          marginTop: 18,
          background: offerServices ? "#fff" : "#f3f3f3",
          padding: 20,
          borderRadius: 10,
          border: "1px solid #ddd",
          maxWidth: 860,
          opacity: offerServices ? 1 : 0.9,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Offer services</h3>

          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700 }}>
            <input type="checkbox" checked={offerServices} onChange={onToggleOffer} />
            I want to offer services
          </label>
        </div>

        {!offerServices && (
          <p style={{ marginTop: 10, color: "#444", fontSize: 13 }}>
            Turn this on if you want to appear in search results and post availability.
          </p>
        )}

        {offerServices && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
              <div style={labelStyle}>Service keywords *</div>

<div style={{ position: "relative" }}>
  <input
    value={helper.services}
    onChange={(e) => setHelper((p) => ({ ...p, services: e.target.value }))}
    style={inputStyle}
    placeholder="Example: carpenter, lawn care, snow removal"
  />

  {serviceSuggestions.length > 0 && serviceToken.length > 0 && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 6,
        zIndex: 9999,
        maxHeight: 180,
        overflowY: "auto",
      }}
    >
      {serviceSuggestions.map((s) => (
        <div
          key={s}
          onClick={() => applyServiceSuggestion(s)}
          style={{
            padding: "8px 10px",
            cursor: "pointer",
            borderBottom: "1px solid #eee",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          {s}
        </div>
      ))}
    </div>
  )}
</div>

              <div style={labelStyle}>City / area *</div>
              <input
                value={helper.city}
                onChange={(e) => setHelper((p) => ({ ...p, city: e.target.value }))}
                style={inputStyle}
                placeholder={base.city || "Victoria, BC"}
              />

              <div style={labelStyle}>Short bio</div>
              <textarea
                value={helper.bio}
                onChange={(e) => setHelper((p) => ({ ...p, bio: e.target.value }))}
                style={{ ...inputStyle, height: 90, resize: "vertical" }}
                placeholder="A short intro about your experience (optional)."
              />
            </div>

            <button onClick={saveHelper} style={primaryBtn}>
              Save Offer Services
            </button>

            {!helperComplete && (
              <p style={{ marginTop: 10, color: "#8a5a00", fontSize: 13 }}>
                To unlock **My Availability** and **My Earnings**, add at least a City and Service keywords, then save.
              </p>
            )}

            {/* Preview (public view) */}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
              }}
            >
              <h4 style={{ marginTop: 0 }}>Public preview</h4>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div>
                  {base.photoUrl ? (
                    <img
                      src={base.photoUrl}
                      alt="Preview"
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #003f63",
                      }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: "50%",
                        background: "#eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        color: "#999",
                      }}
                    >
                      ?
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>
                    {base.publicName || "Your Public Name"}
                  </div>
                  <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
                    {helper.city || base.city || "City / Area"}
                  </div>

                  {(helper.services || "").trim() && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#003f63" }}>
                      <strong>Services:</strong> {helper.services}
                    </div>
                  )}

                  {(helper.bio || "").trim() && (
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      {helper.bio}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
              Pricing is entered when posting availability (not here).
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const labelStyle = {
  fontSize: 13,
  paddingTop: 6,
  color: "#222",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 14,
};

const primaryBtn = {
  marginTop: 14,
  padding: "10px 16px",
  background: "#003f63",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
};

export default Profile;
