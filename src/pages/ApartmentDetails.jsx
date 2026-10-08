import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApartmentById } from "../services/apartmentService";
import "./ApartmentDetails.css";

const ApartmentDetails = () => {
  const { id } = useParams();

  const [apartment, setApartment] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getApartmentById(id);

        const apartmentData = response.data?.data || null;

        setApartment(apartmentData);

        if (apartmentData?.images?.length > 0) {
          setSelectedImage(apartmentData.images[0]);
        }
      } catch (error) {
        console.error("Error fetching apartment:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load apartment. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  if (loading) {
    return (
      <div className="apartment-details-page">
        <div className="apartment-details-loading">
          <p>Loading apartment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apartment-details-page">
        <div className="apartment-details-error">
          <p>{error}</p>

          <Link
            to="/properties"
            className="apartment-details-back-button"
          >
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="apartment-details-page">
        <div className="apartment-details-error">
          <p>Apartment not found.</p>

          <Link
            to="/properties"
            className="apartment-details-back-button"
          >
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const property = apartment.property;

  const statusClass =
    apartment.status?.toLowerCase() || "unknown";

  return (
    <div className="apartment-details-page">
      {/* Back navigation */}
      <div className="apartment-details-top">
        <Link
          to={
            property?._id
              ? `/properties/${property._id}`
              : "/properties"
          }
          className="apartment-details-back-button"
        >
          ← Back to Property
        </Link>
      </div>

      {/* Header */}
      <div className="apartment-details-header">
        <div>
          <span className="apartment-details-label">
            Apartment
          </span>

          <h1>{apartment.apartmentNumber}</h1>

          {property && (
            <p className="apartment-details-property">
              {property.name}
              {property.city ? `, ${property.city}` : ""}
            </p>
          )}
        </div>

        <span
          className={`apartment-details-status apartment-details-status-${statusClass}`}
        >
          {apartment.status}
        </span>
      </div>

      {/* Image Gallery */}
      <section className="apartment-gallery">
        <div className="apartment-main-image">
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt={`${apartment.apartmentNumber}`}
            />
          ) : (
            <img
              src="https://placehold.co/1200x800?text=No+Image"
              alt="No apartment available"
            />
          )}
        </div>

        {apartment.images?.length > 0 && (
          <div className="apartment-thumbnail-list">
            {apartment.images.map((image) => (
              <button
                type="button"
                key={
                  image._id ||
                  image.publicId ||
                  image.url
                }
                className={`apartment-thumbnail ${
                  selectedImage?.url === image.url
                    ? "apartment-thumbnail-active"
                    : ""
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={`${apartment.apartmentNumber} thumbnail`}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Apartment Information */}
      <section className="apartment-information">
        <div className="apartment-information-card">
          <div className="apartment-section-heading">
            <h2>Apartment Information</h2>
            <p>
              Details about this apartment and its current
              availability.
            </p>
          </div>

          <div className="apartment-information-grid">
            <div className="apartment-information-item">
              <span>Apartment Number</span>
              <strong>
                {apartment.apartmentNumber || "—"}
              </strong>
            </div>

            <div className="apartment-information-item">
              <span>Apartment Type</span>
              <strong>{apartment.type || "—"}</strong>
            </div>

            <div className="apartment-information-item">
              <span>Annual Rent</span>
              <strong>
                {apartment.rentAmount !== undefined
                  ? `₦${Number(
                      apartment.rentAmount
                    ).toLocaleString()}`
                  : "—"}
              </strong>
            </div>

            <div className="apartment-information-item">
              <span>Status</span>
              <strong>{apartment.status || "—"}</strong>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="apartment-description-card">
          <h2>About This Apartment</h2>

          <p>
            {apartment.description ||
              "No description available for this apartment."}
          </p>
        </div>

        {/* Property Information */}
        {property && (
          <div className="apartment-property-card">
            <div>
              <h2>Property</h2>

              <h3>{property.name}</h3>

              <p>
                {property.address}
                {property.city
                  ? `, ${property.city}`
                  : ""}
              </p>
            </div>

            {property._id && (
              <Link
                to={`/properties/${property._id}`}
                className="apartment-property-button"
              >
                View Property
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ApartmentDetails;