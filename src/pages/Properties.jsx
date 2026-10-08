import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../services/propertyService";
import "./Properties.css";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProperties();

        setProperties(response.data?.data?.properties || []);
      } catch (error) {
        console.error("Error fetching properties:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load properties. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="properties-page">
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="properties-page">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <div className="properties-header">
        <h1>Find Your Perfect Home</h1>
        <p>
          Browse our available properties and find a place
          that feels like home.
        </p>
      </div>

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

                <Link
                  to={`/properties/${property._id}`}
                  className="secondary-button"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;