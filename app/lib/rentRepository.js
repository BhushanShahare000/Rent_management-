export async function loadRentData() {
  const res = await fetch("/api/rent");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to load rent data (${res.status})`);
  }
  return res.json();
}

export async function createTenant(tenant) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "createTenant", tenant })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create tenant");
  }
  return res.json();
}

export async function updateTenantRow(tenantId, changes) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateTenant", tenantId, changes })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update tenant");
  }
  return res.json();
}

export async function deleteTenantRow(tenantId) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteTenant", tenantId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete tenant");
  }
}

export async function createBill(bill) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "createBill", bill })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create bill");
  }
  return res.json();
}

export async function updateBillPaidRow(billId, paid) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateBillPaid", billId, paid })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update bill paid status");
  }
  return res.json();
}

export async function deleteBillRow(billId) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteBill", billId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete bill");
  }
}

export async function deleteBillsForTenant(tenantId) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteBillsForTenant", tenantId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete bills for tenant");
  }
}

export async function markAllPaidForTenant(tenantId) {
  const res = await fetch("/api/rent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "markAllPaidForTenant", tenantId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to mark all bills paid");
  }
  return res.json();
}
