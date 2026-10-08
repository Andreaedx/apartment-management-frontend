import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyById } from "../services/propertyService";
import { getApartments } from "../services/apartmentService";
import "./PropertyDetails.css";

const PropertyDetails = () => {
    const { id } = useParams();

    const [property, setProperty] = useState(null);
    const [apartments, setApartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [apartmentsLoading, setApartmentsLoading] = useState(true);

    const [error, setError] = useState("");
    const [apartmentsError, setApartmentsError] = useState("");

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getPropertyById(id);

                setProperty(response.data?.data || null);
            } catch (error) {
                console.error("Error fetching property:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load property. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                setApartmentsLoading(true);
                setApartmentsError("");

                const response = await getApartments({
                    propertyId: id,
                });

                setApartments(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching apartments:", error);

                setApartmentsError(
                    error.response?.data?.message ||
                    "Unable to load apartments for this property."
                );
            } finally {
                setApartmentsLoading(false);
            }
        };

        fetchApartments();
    }, [id]);

    if (loading) {
        return (
            <div className="property-details-page">
                <div className="property-details-loading">
                    <p>Loading property...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="property-details-page">
                <div className="property-error">
                    <p>{error}</p>

                    <Link to="/properties" className="property-back-button">
                        ← Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="property-details-page">
                <div className="property-error">
                    <p>Property not found.</p>

                    <Link to="/properties" className="property-back-button">
                        ← Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="property-details-page">
            <div className="property-details-top">
                <Link to="/properties" className="property-back-button">
                    ← Back to Properties
                </Link>
            </div>

            <div className="property-details-header">
                <div>
                    <h1>{property.name}</h1>

                    <p className="property-details-location">
                        {property.address}, {property.city}
                    </p>
                </div>
            </div>

            {/* Property Images */}
            <div className="property-details-gallery">
                {property.images?.length > 0 ? (
                    property.images.map((image) => (
                        <div
                            className="property-details-image"
                            key={image._id || image.publicId || image.url}
                        >
                            <img src={image.url} alt={property.name} />
                        </div>
                    ))
                ) : (
                    <div className="property-details-no-image">
                        <img
                            src="https://placehold.co/1200x700?text=No+Image"
                            alt="No property available"
                        />
                    </div>
                )}
            </div>

            {/* Property Information */}
            <div className="property-details-content">
                <div className="property-details-info">
                    <h2>Property Information</h2>

                    <div className="property-details-grid">
                        <div className="property-detail-item">
                            <span>Property Name</span>
                            <p>{property.name || "—"}</p>
                        </div>

                        <div className="property-detail-item">
                            <span>Address</span>
                            <p>{property.address || "—"}</p>
                        </div>

                        <div className="property-detail-item">
                            <span>City</span>
                            <p>{property.city || "—"}</p>
                        </div>

                        <div className="property-detail-item">
                            <span>Property Manager</span>
                            <p>{property.manager?.name || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="property-details-description">
                    <h2>About This Property</h2>

                    <p>
                        {property.description || "No description available."}
                    </p>
                </div>
            </div>

            {/* Apartments */}
            <section className="property-apartments-section">
                <div className="property-apartments-header">
                    <div>
                        <h2>Available Apartments</h2>
                        <p>
                            Explore the apartments available in this property.
                        </p>
                    </div>

                    <span className="property-apartment-count">
                        {apartments.length}{" "}
                        {apartments.length === 1 ? "Apartment" : "Apartments"}
                    </span>
                </div>

                {apartmentsLoading ? (
                    <div className="apartments-loading">
                        <p>Loading apartments...</p>
                    </div>
                ) : apartmentsError ? (
                    <div className="apartments-error">
                        <p>{apartmentsError}</p>
                    </div>
                ) : apartments.length === 0 ? (
                    <div className="apartments-empty">
                        <h3>No apartments available</h3>
                        <p>
                            There are currently no apartments listed for this property.
                        </p>
                    </div>
                ) : (
                    <div className="apartments-grid">
                        {apartments.map((apartment) => (
                            <div className="apartment-card" key={apartment._id}>
                                <div className="apartment-card-content">
                                    <div className="apartment-card-header">
                                        <div>
                                            <span className="apartment-label">Apartment</span>
                                            <h3>{apartment.apartmentNumber}</h3>
                                        </div>

                                        <span
                                            className={`apartment-status apartment-status-${apartment.status?.toLowerCase()}`}
                                        >
                                            {apartment.status}
                                        </span>
                                    </div>

                                    <div className="apartment-details">
                                        <div className="apartment-detail">
                                            <span>Type</span>
                                            <strong>{apartment.type || "—"}</strong>
                                        </div>

                                        <div className="apartment-detail">
                                            <span>Rent</span>
                                            <strong>
                                                {apartment.rentAmount !== undefined
                                                    ? `₦${Number(apartment.rentAmount).toLocaleString()}`
                                                    : "—"}
                                            </strong>
                                        </div>
                                    </div>

                                    <p className="apartment-description">
                                        {apartment.description || "No description available."}
                                    </p>

                                    <Link
                                        to={`/apartments/${apartment._id}`}
                                        className="apartment-view-button"
                                    >
                                        View Apartment
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default PropertyDetails;