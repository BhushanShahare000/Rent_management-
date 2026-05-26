import { defaultTenants } from "./rent";
import { isSupabaseConfigured, supabase } from "./supabase";

export function tenantFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    baseRent: row.base_rent ?? 2200,
    previousUnit: row.previous_unit ?? 0
  };
}

export function billFromRow(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    month: row.month,
    previousUnit: row.previous_unit,
    currentUnit: row.current_unit,
    usedUnit: row.used_unit,
    unitRate: row.unit_rate,
    electricityAmount: row.electricity_amount,
    baseRent: row.base_rent,
    totalAmount: row.total_amount,
    paid: row.paid,
    createdAt: row.created_at
  };
}

export function tenantToRow(tenant) {
  const row = {};
  if (tenant.name !== undefined) row.name = tenant.name;
  if (tenant.phone !== undefined) row.phone = tenant.phone;
  if (tenant.baseRent !== undefined) row.base_rent = tenant.baseRent;
  if (tenant.previousUnit !== undefined) row.previous_unit = tenant.previousUnit;
  return row;
}

export function billToRow(bill) {
  return {
    id: bill.id,
    tenant_id: bill.tenantId,
    tenant_name: bill.tenantName,
    month: bill.month,
    previous_unit: bill.previousUnit,
    current_unit: bill.currentUnit,
    used_unit: bill.usedUnit,
    unit_rate: bill.unitRate,
    electricity_amount: bill.electricityAmount,
    base_rent: bill.baseRent,
    total_amount: bill.totalAmount,
    paid: bill.paid,
    created_at: bill.createdAt
  };
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function loadRentData() {
  const client = requireSupabase();

  const [{ data: tenantRows, error: tenantsError }, { data: billRows, error: billsError }] =
    await Promise.all([
      client.from("tenants").select("*").order("id", { ascending: true }),
      client.from("bills").select("*").order("created_at", { ascending: false })
    ]);

  if (tenantsError) throw tenantsError;
  if (billsError) throw billsError;

  if (tenantRows.length > 0) {
    return {
      tenants: tenantRows.map(tenantFromRow),
      bills: billRows.map(billFromRow)
    };
  }

  const { data: seededRows, error: seedError } = await client
    .from("tenants")
    .insert(defaultTenants.map(tenantToRow))
    .select("*")
    .order("id", { ascending: true });

  if (seedError) throw seedError;

  return {
    tenants: seededRows.map(tenantFromRow),
    bills: []
  };
}

export async function createTenant(tenant) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("tenants")
    .insert(tenantToRow(tenant))
    .select("*")
    .single();

  if (error) throw error;
  return tenantFromRow(data);
}

export async function updateTenantRow(tenantId, changes) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("tenants")
    .update(tenantToRow(changes))
    .eq("id", tenantId)
    .select("*")
    .single();

  if (error) throw error;
  return tenantFromRow(data);
}

export async function deleteTenantRow(tenantId) {
  const client = requireSupabase();
  const { error } = await client.from("tenants").delete().eq("id", tenantId);
  if (error) throw error;
}

export async function createBill(bill) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("bills")
    .insert(billToRow(bill))
    .select("*")
    .single();

  if (error) throw error;
  return billFromRow(data);
}

export async function updateBillPaidRow(billId, paid) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("bills")
    .update({ paid })
    .eq("id", billId)
    .select("*")
    .single();

  if (error) throw error;
  return billFromRow(data);
}

export async function deleteBillRow(billId) {
  const client = requireSupabase();
  const { error } = await client.from("bills").delete().eq("id", billId);
  if (error) throw error;
}

export async function deleteBillsForTenant(tenantId) {
  const client = requireSupabase();
  const { error } = await client.from("bills").delete().eq("tenant_id", tenantId);
  if (error) throw error;
}
