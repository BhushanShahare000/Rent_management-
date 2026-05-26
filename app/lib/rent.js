export const STORAGE_KEY = "kiraydar-management-v1";
export const UNIT_RATE = 10;

export const defaultTenants = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  name: `Kiraydar ${index + 1}`,
  phone: "",
  baseRent: 2200,
  previousUnit: 0
}));

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function rupees(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

export function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortBills(first, second) {
  const monthCompare = second.month.localeCompare(first.month);
  if (monthCompare !== 0) return monthCompare;
  return second.createdAt.localeCompare(first.createdAt);
}

export function latestBillForTenant(bills, tenantId) {
  return bills.filter((bill) => bill.tenantId === tenantId).sort(sortBills)[0];
}
