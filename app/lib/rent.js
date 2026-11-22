export const STORAGE_KEY = "kiraydar-management-v1";
export const UNIT_RATE = 10;

export const defaultTenants = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  name: `Kiraydar ${index + 1}`,
  phone: "",
  baseRent: 2200,
  previousUnit: 0,
  dueDay: 5
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

export function getTenantReminder(tenant, tenantPendingBalance = 0, targetDate = new Date()) {
  const dueDay = Number(tenant?.dueDay) || 5;
  const currentDay = targetDate.getDate();
  const daysDiff = dueDay - currentDay;

  if (daysDiff === 0) {
    return {
      status: "today",
      dueDay,
      label: "🔔 Due Today",
      color: "bg-[#eaf5ef] text-[#0f5e3f] border-[#8fd8b7] dark:bg-[#1b3327] dark:text-[#8fd8b7]"
    };
  }

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      status: "overdue",
      dueDay,
      label: tenantPendingBalance > 0 ? `⚠️ Overdue ${overdueDays}d` : `Due was ${dueDay}th`,
      color: tenantPendingBalance > 0
        ? "bg-[#fff2ee] text-[#b7472a] border-[#f2a899] dark:bg-[#321712] dark:text-[#ff9f87]"
        : "bg-[#f8faf9] text-[#66736c] dark:bg-[#121b17] dark:text-[#b7c8bf]"
    };
  }

  return {
    status: "upcoming",
    dueDay,
    label: `Due in ${daysDiff}d (${dueDay}th)`,
    color: "bg-[#f0f6ff] text-[#285799] border-[#b0cbef] dark:bg-[#152438] dark:text-[#9bc2f5]"
  };
}
