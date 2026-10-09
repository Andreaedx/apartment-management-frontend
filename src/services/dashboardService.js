import { getApartments } from "./apartmentService";
import { getProperties } from "./propertyService";
import { getTenancies } from "./tenancyService";
import { getInvoices } from "./invoiceService";
import { getPayments } from "./paymentService";
import { getMaintenanceRequests } from "./maintenanceService";
import { getUsers } from "./userService";

/**
 * Extract apartment statistics
 */
const getApartmentStats = (apartments) => {
  return {
    total: apartments.length,

    vacant: apartments.filter(
      (apartment) => apartment.status === "VACANT"
    ).length,

    occupied: apartments.filter(
      (apartment) => apartment.status === "OCCUPIED"
    ).length,

    maintenance: apartments.filter(
      (apartment) => apartment.status === "MAINTENANCE"
    ).length,
  };
};

/**
 * Extract tenancy statistics
 */
const getTenancyStats = (tenancies, total = tenancies.length) => {
  return {
    total,

    active: tenancies.filter(
      (tenancy) => tenancy.status === "ACTIVE"
    ).length,

    pending: tenancies.filter(
      (tenancy) => tenancy.status === "PENDING"
    ).length,

    ended: tenancies.filter(
      (tenancy) => tenancy.status === "ENDED"
    ).length,

    cancelled: tenancies.filter(
      (tenancy) => tenancy.status === "CANCELLED"
    ).length,
  };
};

/**
 * Extract invoice statistics
 */
const getInvoiceStats = (invoices) => {
  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "PAID"
  );

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status === "UNPAID"
  );

  const partiallyPaidInvoices = invoices.filter(
    (invoice) => invoice.status === "PARTIALLY_PAID"
  );

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "OVERDUE"
  );

  return {
    total: invoices.length,
    totalAmount,

    paid: paidInvoices.length,
    unpaid: unpaidInvoices.length,
    partiallyPaid: partiallyPaidInvoices.length,
    overdue: overdueInvoices.length,
  };
};

/**
 * Extract payment statistics
 */
const getPaymentStats = (payments) => {
  const successfulPayments = payments.filter(
    (payment) => payment.status === "SUCCESSFUL"
  );

  const totalAmount = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  return {
    total: payments.length,
    successful: successfulPayments.length,
    totalAmount,
  };
};

/**
 * Extract maintenance statistics
 */
const getMaintenanceStats = (requests) => {
  return {
    total: requests.length,

    open: requests.filter(
      (request) => request.status === "OPEN"
    ).length,

    inProgress: requests.filter(
      (request) => request.status === "IN_PROGRESS"
    ).length,

    resolved: requests.filter(
      (request) => request.status === "RESOLVED"
    ).length,

    urgent: requests.filter(
      (request) => request.priority === "URGENT"
    ).length,

    high: requests.filter(
      (request) => request.priority === "HIGH"
    ).length,
  };
};

/**
 * Get complete dashboard data
 */
export const getDashboardData = async (role, userId) => {
  /*
   * APARTMENTS
   *
   * Available to all dashboard roles.
   */
  const apartmentResponse = await getApartments();

  const apartments = apartmentResponse.data?.data || [];

  const apartmentStats = getApartmentStats(apartments);

  /*
   * ADMIN DASHBOARD
   *
   * Admin cannot access tenancy routes because
   * the backend authorizes only manager/tenant.
   */
  if (role === "admin") {
    const [
      propertyResponse,
      maintenanceResponse,
      userResponse,
    ] = await Promise.all([
      getProperties(),
      getMaintenanceRequests(),
      getUsers(),
    ]);

    const properties =
      propertyResponse.data?.data?.properties || [];

    const maintenanceRequests =
      maintenanceResponse.data?.data || [];

    const users =
      userResponse.data?.users || [];

    return {
      role,

      apartments,

      apartmentStats,

      properties,

      propertyStats: {
        total:
          propertyResponse.data?.data?.pagination?.total ||
          properties.length,
      },

      maintenanceRequests,

      maintenanceStats:
        getMaintenanceStats(maintenanceRequests),

      users,

      userStats: {
        loaded: users.length,
      },
    };
  }

  /*
   * MANAGER / TENANT
   *
   * These roles can access tenancy,
   * invoice, payment and maintenance data.
   */

  const [
    propertyResponse,
    tenancyResponse,
    invoiceResponse,
    paymentResponse,
    maintenanceResponse,
  ] = await Promise.all([
    getProperties(),

    getTenancies({
      page: 1,
      limit: 100,
    }),

    getInvoices(),

    getPayments(),

    getMaintenanceRequests(),
  ]);

  const allProperties =
    propertyResponse.data?.data?.properties || [];

  // The property list is public, so a manager's stats only count their own
  const properties =
    role === "manager"
      ? allProperties.filter(
          (property) => (property.manager?._id || property.manager) === userId
        )
      : allProperties;

  const tenancies =
    tenancyResponse.data?.data || [];

  const invoices =
    invoiceResponse.data?.data || [];

  const payments =
    paymentResponse.data?.data || [];

  const maintenanceRequests =
    maintenanceResponse.data?.data || [];

  const tenancyTotal =
    tenancyResponse.data?.pagination?.total ||
    tenancies.length;

  return {
    role,

    apartments,

    apartmentStats,

    properties,

    propertyStats: {
      total:
        role === "manager"
          ? properties.length
          : propertyResponse.data?.data?.pagination?.total ||
            properties.length,
    },

    tenancies,

    tenancyStats: getTenancyStats(
      tenancies,
      tenancyTotal
    ),

    invoices,

    invoiceStats:
      getInvoiceStats(invoices),

    payments,

    paymentStats:
      getPaymentStats(payments),

    maintenanceRequests,

    maintenanceStats:
      getMaintenanceStats(maintenanceRequests),
  };
};