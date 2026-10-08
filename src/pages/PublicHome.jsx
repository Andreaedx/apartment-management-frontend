import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../services/propertyService";
import "../styles/public.css";

const PublicHome = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getProperties();

        setProperties(response.data.data.properties || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load properties.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="public-page">
      <header className="public-navbar">
        <div className="public-logo">
          RENT A HOME
        </div>

        <nav>
          <Link to="/login" className="public-nav-link">
            Login
          </Link>

          <Link to="/register" className="public-nav-button">
            Register
          </Link>
        </nav>
      </header>

      <section className="public-hero">
        <div className="public-hero-content">
          <span className="hero-label">FIND YOUR NEXT HOME</span>

          <h1>
            Find a place
            <br />
            you can call home.
          </h1>

          <p>
            Explore available properties and apartments
            that match your lifestyle and budget.
          </p>

          <a href="#properties" className="hero-button">
            Explore Properties
          </a>
        </div>
      </section>

      <section className="public-properties" id="properties">
        <div className="public-section-header">
          <div>
            <span className="section-label">AVAILABLE HOMES</span>
            <h2>Explore Our Properties</h2>
          </div>

          <p>
            Browse through our properties and discover
            available apartments.
          </p>
        </div>

        {loading && (
          <div className="public-message">
            Loading properties...
          </div>
        )}

        {error && (
          <div className="public-error">
            {error}
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="public-message">
            No properties are currently available.
          </div>
        )}

        {!loading && properties.length > 0 && (
          <div className="property-grid">
            {properties.map((property) => (
              <Link
                to={`/property/${property._id}`}
                className="public-property-card"
                key={property._id}
              >
                <div className="property-image">
                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0].url}
                      alt={property.name}
                    />
                  ) : (
                    <div className="no-image">
                      No Image
                    </div>
                  )}
                </div>

                <div className="property-card-content">
                  <h3>{property.name}</h3>

                  <p className="property-location">
                    {property.city}
                  </p>

                  <p className="property-address">
                    {property.address}
                  </p>

                  {property.description && (
                    <p className="property-description">
                      {property.description}
                    </p>
                  )}

                  <span className="view-property">
                    View Property →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="public-footer">
        <div>
          <strong>RENT A HOME</strong>
          <p>
            Find comfortable and affordable apartments.
          </p>
        </div>

        <p>© {new Date().getFullYear()} RENT A HOME</p>
      </footer>
    </div>
  );
};

export default PublicHome;