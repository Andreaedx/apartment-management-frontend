import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyById } from "../services/propertyService";
import { getApartments } from "../services/apartmentService";
import "../styles/public.css";

const PublicProperty = () => {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);

        const [propertyResponse, apartmentsResponse] =
          await Promise.all([
            getPropertyById(id),
            getApartments(),
          ]);

        const propertyData = propertyResponse.data.data;
        const apartmentsData =
          apartmentsResponse.data.data || [];

        setProperty(propertyData);

        // Only show apartments belonging to this property
        const propertyApartments = apartmentsData.filter(
          (apartment) =>
            apartment.property?._id === id ||
            apartment.property === id
        );

        setApartments(propertyApartments);
      } catch (err) {
        console.error(err);
        setError("Unable to load this property.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="public-page">
        <div className="public-loading">
          Loading property...
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="public-page">
        <div className="public-error-page">
          <h2>Property not found</h2>
          <p>{error || "This property could not be found."}</p>

          <Link to="/" className="hero-button">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <header className="public-navbar">
        <Link to="/" className="public-logo">
          RENT A HOME
        </Link>

        <nav>
          <Link to="/login" className="public-nav-link">
            Login
          </Link>

          <Link to="/register" className="public-nav-button">
            Register
          </Link>
        </nav>
      </header>

      <main className="property-details-page">
        <Link to="/" className="back-link">
          ← Back to Properties
        </Link>

        <section className="property-details">
          <div className="property-details-image">
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

          <div className="property-details-content">
            <span className="section-label">
              PROPERTY
            </span>

            <h1>{property.name}</h1>

            <p className="property-location">
              {property.city}
            </p>

            <p className="property-address">
              {property.address}
            </p>

            {property.description && (
              <div className="property-about">
                <h3>About this property</h3>
                <p>{property.description}</p>
              </div>
            )}
          </div>
        </section>

        <section className="apartments-section">
          <div className="public-section-header">
            <div>
              <span className="section-label">
                AVAILABLE UNITS
              </span>

              <h2>Apartments</h2>
            </div>

            <p>
              Choose an apartment that suits your needs.
            </p>
          </div>

          {apartments.length === 0 ? (
            <div className="public-message">
              No apartments are currently available
              in this property.
            </div>
          ) : (
            <div className="apartment-grid">
              {apartments.map((apartment) => (
                <div
                  className="public-apartment-card"
                  key={apartment._id}
                >
                  <div className="apartment-image">
                    {apartment.images?.length > 0 ? (
                      <img
                        src={apartment.images[0].url}
                        alt={apartment.apartmentNumber}
                      />
                    ) : (
                      <div className="no-image">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="apartment-card-content">
                    <div className="apartment-card-top">
                      <h3>
                        Apartment {apartment.apartmentNumber}
                      </h3>

                      <span
                        className={`apartment-status ${apartment.status?.toLowerCase()}`}
                      >
                        {apartment.status}
                      </span>
                    </div>

                    <p className="apartment-type">
                      {apartment.type}
                    </p>

                    {apartment.description && (
                      <p className="apartment-description">
                        {apartment.description}
                      </p>
                    )}

                    <div className="apartment-price">
                      ₦
                      {Number(
                        apartment.rentAmount || 0
                      ).toLocaleString()}
                      <span>/ rent</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="public-footer">
        <strong>RENT A HOME</strong>

        <p>
          © {new Date().getFullYear()} RENT A HOME
        </p>
      </footer>
    </div>
  );
};

export default PublicProperty;