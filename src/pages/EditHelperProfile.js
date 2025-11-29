import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function EditHelperProfile() {
  const { id } = useParams();
  const [helper, setHelper] = useState(null);

  const [form, setForm] = useState({
    name: "",
    serviceName: "",
    pricePerHour: "",
    bio: "",
    photo: "",
  });

  // Load helper data
  useEffect(() => {
    const loadHelper = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/helpers");
        const found = res.data.find((h) => h._id === id);

        if (found) {
          setHelper(found);
          setForm({
            name: found.name || "",
            serviceName: found.serviceName || "",
            pricePerHour: found.pricePerHour || "",
            bio: found.bio || "",
            photo: found.photo || "",
          });
        }
      } catch (err) {
        console.error("Error loading helper:", err);
      }
    };

    loadHelper();
  }, [id]);

  const saveProfile = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/update-profile/${id}`,
        form
      );
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Could not update profile.");
    }
  };

  if (!helper) return <p>Loading helper...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Edit Profile — {helper.name}</h1>

      {/* Name */}
      <label><strong>Name</strong></label>
      <br />
      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={{ width: "100%", padding: "8px" }}
      />
      <br /><br />

      {/* Service Name */}
      <label><strong>Service Name</strong></label>
      <br />
      <input
        type="text"
        value={form.serviceName}
        onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
        style={{ width: "100%", padding: "8px" }}
      />
      <br /><br />

      {/* Price */}
      <label><strong>Price Per Hour ($)</strong></label>
      <br />
      <input
        type="number"
        value={form.pricePerHour}
        onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
        style={{ width: "100%", padding: "8px" }}
      />
      <br /><br />

      {/* Bio */}
      <label><strong>Bio</strong></label>
      <br />
      <textarea
        rows="5"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        style={{ width: "100%", padding: "8px" }}
      />
      <br /><br />

      {/* Photo URL */}
      <label><strong>Photo URL</strong></label>
      <br />
      <input
        type="text"
        value={form.photo}
        onChange={(e) => setForm({ ...form, photo: e.target.value })}
        style={{ width: "100%", padding: "8px" }}
      />
      <br /><br />

      {/* Preview */}
      {form.photo && (
        <img
          src={form.photo}
          alt="Preview"
          style={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "20px"
          }}
        />
      )}

      {/* Save Button */}
      <button
        onClick={saveProfile}
        style={{
          padding: "10px 20px",
          background: "blue",
          color: "white",
          borderRadius: "5px",
          border: "none",
          fontSize: "16px",
        }}
      >
        Save Changes
      </button>
    </div>
  );
}
