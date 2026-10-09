import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../services/propertyService";
import "./Properties.css";

const emptyForm = {
  name: "",
  address: "",
  city: "",
  description: "",
};

const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  // Bumped after a save or delete to fetch the list again
  const [reloadKey, setReloadKey] = useState(0);

  const canCreate = user?.role === "manager" || user?.role === "admin";
  const userId = user?._id || user?.id;

  // Admins can manage any property; managers only their own
  const canManage = (property) =>
    user?.role === "admin" ||
    (user?.role === "manager" &&
      (property.manager?._id || property.manager) === userId);

  useEffect(() => {
    let cancelled = false;

    const fetchProperties = async () => {
      try {
        const response = await getProperties();
        if (cancelled) return;
        setProperties(response.data?.data?.properties || []);
        setError("");
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Unable to load properties. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperties();

    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (property) => {
    setEditing(property);
    setForm({
      name: property.name || "",
      address: property.address || "",
      city: property.city || "",
      description: property.description || "",
    });
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editing) {
        await updateProperty(editing._id, form);
      } else {
        await createProperty(form);
      }

      setShowForm(false);
      reload();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to save property."
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (property) => {
    if (!window.confirm(`Delete ${property.name} and all its apartments?`)) return;

    try {
      setError("");
      await deleteProperty(property._id);
      reload();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete property."
      );
    }
  };

  if (loading) {
    return (
      <div className="properties-page">
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <div className="properties-header page-header">
        <div>
          <h1>Find Your Perfect Home</h1>
          <p>
            Browse our available properties and find a place
            that feels like home.
          </p>
        </div>

        {canCreate && (
          <button className="primary-button" onClick={openCreate}>
            Add Property
          </button>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      {properties.length === 0 ? (
        <p>No properties available at the moment.</p>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div className="property-card" key={property._id}>
              <div className="property-image">
                <img
                  src={
                    property.images?.[0]?.url ||
                    "https://placehold.co/600x400?text=No+Image"
                  }
                  alt={property.name}
                />
              </div>

              <div className="property-content">
                <h2>{property.name}</h2>

                <p className="property-location">
                  {property.address}, {property.city}
                </p>

                <p className="property-description">
                  {property.description}
                </p>

                <div className="actions">
                  <Link
                    to={`/properties/${property._id}`}
                    className="secondary-button"
                  >
                    View
                  </Link>

                  {canManage(property) && (
                    <>
                      <button
                        className="secondary-button"
                        onClick={() => openEdit(property)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => remove(property)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? "Edit Property" : "Add Property"}
          onClose={() => setShowForm(false)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label className="full">
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label>
              Address
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>

            <label>
              City
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>

            <label className="full">
              Description
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <div className="form-actions full">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button className="primary-button" disabled={saving}>
                {saving ? "Saving..." : "Save Property"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Properties;
