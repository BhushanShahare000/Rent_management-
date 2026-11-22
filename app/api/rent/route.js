import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { defaultTenants } from "../../lib/rent";

function tenantFromRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    phone: row.phone ?? "",
    baseRent: Number(row.base_rent ?? 2200),
    previousUnit: Number(row.previous_unit ?? 0)
  };
}

function billFromRow(row) {
  return {
    id: String(row.id),
    tenantId: Number(row.tenant_id),
    tenantName: row.tenant_name,
    month: row.month,
    previousUnit: Number(row.previous_unit),
    currentUnit: Number(row.current_unit),
    usedUnit: Number(row.used_unit),
    unitRate: Number(row.unit_rate),
    electricityAmount: Number(row.electricity_amount),
    baseRent: Number(row.base_rent),
    totalAmount: Number(row.total_amount),
    paid: Boolean(row.paid),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at)
  };
}

export async function GET() {
  try {
    const sql = getDb();

    const [tenantRows, billRows] = await Promise.all([
      sql`SELECT * FROM tenants ORDER BY id ASC`,
      sql`SELECT * FROM bills ORDER BY created_at DESC`
    ]);

    if (tenantRows.length > 0) {
      return NextResponse.json({
        tenants: tenantRows.map(tenantFromRow),
        bills: billRows.map(billFromRow)
      });
    }

    // Seed default tenants if table is completely empty
    for (const t of defaultTenants) {
      await sql`
        INSERT INTO tenants (name, phone, base_rent, previous_unit)
        VALUES (${t.name}, ${t.phone || ""}, ${t.baseRent}, ${t.previousUnit})
      `;
    }

    const seededRows = await sql`SELECT * FROM tenants ORDER BY id ASC`;

    return NextResponse.json({
      tenants: seededRows.map(tenantFromRow),
      bills: []
    });
  } catch (error) {
    console.error("GET /api/rent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load rent data." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "createTenant": {
        const tenant = body.tenant || {};
        const name = tenant.name || "New Kiraydar";
        const phone = tenant.phone ?? "";
        const baseRent = Number(tenant.baseRent ?? 2200);
        const previousUnit = Number(tenant.previousUnit ?? 0);

        const [row] = await sql`
          INSERT INTO tenants (name, phone, base_rent, previous_unit)
          VALUES (${name}, ${phone}, ${baseRent}, ${previousUnit})
          RETURNING *
        `;
        return NextResponse.json(tenantFromRow(row));
      }

      case "updateTenant": {
        const id = Number(body.tenantId);
        const changes = body.changes || {};

        const [existing] = await sql`SELECT * FROM tenants WHERE id = ${id}`;
        if (!existing) {
          return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
        }

        const name = changes.name !== undefined ? changes.name : existing.name;
        const phone = changes.phone !== undefined ? changes.phone : existing.phone;
        const baseRent =
          changes.baseRent !== undefined ? Number(changes.baseRent) : existing.base_rent;
        const previousUnit =
          changes.previousUnit !== undefined
            ? Number(changes.previousUnit)
            : existing.previous_unit;

        const [updated] = await sql`
          UPDATE tenants
          SET
            name = ${name},
            phone = ${phone},
            base_rent = ${baseRent},
            previous_unit = ${previousUnit}
          WHERE id = ${id}
          RETURNING *
        `;
        return NextResponse.json(tenantFromRow(updated));
      }

      case "deleteTenant": {
        const id = Number(body.tenantId);
        await sql`DELETE FROM tenants WHERE id = ${id}`;
        return NextResponse.json({ success: true });
      }

      case "createBill": {
        const bill = body.bill || {};
        const tenantId = Number(bill.tenantId);
        const tenantName = bill.tenantName || "";
        const month = bill.month || "";
        const previousUnit = Number(bill.previousUnit || 0);
        const currentUnit = Number(bill.currentUnit || 0);
        const usedUnit = Number(bill.usedUnit || 0);
        const unitRate = Number(bill.unitRate || 10);
        const electricityAmount = Number(bill.electricityAmount || 0);
        const baseRent = Number(bill.baseRent || 2200);
        const totalAmount = Number(bill.totalAmount || 0);
        const paid = Boolean(bill.paid);

        const [row] = await sql`
          INSERT INTO bills (
            tenant_id,
            tenant_name,
            month,
            previous_unit,
            current_unit,
            used_unit,
            unit_rate,
            electricity_amount,
            base_rent,
            total_amount,
            paid
          )
          VALUES (
            ${tenantId},
            ${tenantName},
            ${month},
            ${previousUnit},
            ${currentUnit},
            ${usedUnit},
            ${unitRate},
            ${electricityAmount},
            ${baseRent},
            ${totalAmount},
            ${paid}
          )
          RETURNING *
        `;
        return NextResponse.json(billFromRow(row));
      }

      case "updateBillPaid": {
        const billId = body.billId;
        const paid = Boolean(body.paid);

        const [updated] = await sql`
          UPDATE bills
          SET paid = ${paid}
          WHERE id = ${billId}
          RETURNING *
        `;
        if (!updated) {
          return NextResponse.json({ error: "Bill not found." }, { status: 404 });
        }
        return NextResponse.json(billFromRow(updated));
      }

      case "deleteBill": {
        const billId = body.billId;
        await sql`DELETE FROM bills WHERE id = ${billId}`;
        return NextResponse.json({ success: true });
      }

      case "deleteBillsForTenant": {
        const tenantId = Number(body.tenantId);
        await sql`DELETE FROM bills WHERE tenant_id = ${tenantId}`;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/rent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process database mutation." },
      { status: 500 }
    );
  }
}
