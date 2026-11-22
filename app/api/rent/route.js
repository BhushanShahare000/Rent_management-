import { NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { defaultTenants } from "../../lib/rent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function tenantFromRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    phone: row.phone ?? "",
    baseRent: Number(row.base_rent ?? 2200),
    previousUnit: Number(row.previous_unit ?? 0),
    dueDay: Number(row.due_day ?? 5)
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
    balance: Number(row.balance || 0),
    paidAmount: Number(row.paid_amount || 0),
    dueDate: row.due_date ? String(row.due_date) : "",
    totalAmount: Number(row.total_amount),
    paid: Boolean(row.paid),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at)
  };
}

async function ensureSchema(sql) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        base_rent NUMERIC(10, 2) DEFAULT 2200,
        previous_unit INT DEFAULT 0,
        due_day INT DEFAULT 5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS due_day INT DEFAULT 5`;

    await sql`
      CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id INT NOT NULL,
        tenant_name VARCHAR(255) NOT NULL,
        month VARCHAR(20) NOT NULL,
        previous_unit INT NOT NULL,
        current_unit INT NOT NULL,
        used_unit INT NOT NULL,
        unit_rate NUMERIC(10, 2) NOT NULL,
        electricity_amount NUMERIC(10, 2) NOT NULL,
        base_rent NUMERIC(10, 2) NOT NULL,
        balance NUMERIC(10, 2) DEFAULT 0,
        paid_amount NUMERIC(10, 2) DEFAULT 0,
        due_date VARCHAR(50) DEFAULT '',
        total_amount NUMERIC(10, 2) NOT NULL,
        paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS balance NUMERIC(10, 2) DEFAULT 0`;
    await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10, 2) DEFAULT 0`;
    await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS due_date VARCHAR(50) DEFAULT ''`;
  } catch (err) {
    console.warn("Schema ensure warning:", err.message);
  }
}

export async function GET() {
  try {
    const sql = getDb();
    await ensureSchema(sql);

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
        INSERT INTO tenants (name, phone, base_rent, previous_unit, due_day)
        VALUES (${t.name}, ${t.phone || ""}, ${t.baseRent}, ${t.previousUnit}, ${t.dueDay || 5})
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
    await ensureSchema(sql);
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "createTenant": {
        const tenant = body.tenant || {};
        const name = tenant.name || "New Kiraydar";
        const phone = tenant.phone ?? "";
        const baseRent = Number(tenant.baseRent ?? 2200);
        const previousUnit = Number(tenant.previousUnit ?? 0);
        const dueDay = Number(tenant.dueDay ?? 5);

        const [row] = await sql`
          INSERT INTO tenants (name, phone, base_rent, previous_unit, due_day)
          VALUES (${name}, ${phone}, ${baseRent}, ${previousUnit}, ${dueDay})
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
        const dueDay =
          changes.dueDay !== undefined
            ? Number(changes.dueDay)
            : Number(existing.due_day ?? 5);

        const [updated] = await sql`
          UPDATE tenants
          SET
            name = ${name},
            phone = ${phone},
            base_rent = ${baseRent},
            previous_unit = ${previousUnit},
            due_day = ${dueDay}
          WHERE id = ${id}
          RETURNING *
        `;
        return NextResponse.json(tenantFromRow(updated));
      }

      case "deleteTenant": {
        const id = Number(body.tenantId);
        await sql`DELETE FROM bills WHERE tenant_id = ${id}`;
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
        const balance = Number(bill.balance || 0);
        const paidAmount = Number(bill.paidAmount || 0);
        const dueDate = bill.dueDate || "";
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
            balance,
            paid_amount,
            due_date,
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
            ${balance},
            ${paidAmount},
            ${dueDate},
            ${totalAmount},
            ${paid}
          )
          RETURNING *
        `;
        return NextResponse.json(billFromRow(row));
      }

      case "updateBill": {
        const billId = String(body.billId || "");
        const changes = body.changes || {};

        const [existing] = await sql`SELECT * FROM bills WHERE id = ${billId}`;
        if (!existing) {
          return NextResponse.json({ error: "Bill not found." }, { status: 404 });
        }

        const previousUnit =
          changes.previousUnit !== undefined
            ? Number(changes.previousUnit)
            : existing.previous_unit;
        const currentUnit =
          changes.currentUnit !== undefined
            ? Number(changes.currentUnit)
            : existing.current_unit;
        const usedUnit = Math.max(currentUnit - previousUnit, 0);
        const unitRate =
          changes.unitRate !== undefined
            ? Number(changes.unitRate)
            : existing.unit_rate;
        const electricityAmount = usedUnit * unitRate;
        const baseRent =
          changes.baseRent !== undefined
            ? Number(changes.baseRent)
            : existing.base_rent;
        const totalAmount = baseRent + electricityAmount;
        const paidAmount =
          changes.paidAmount !== undefined
            ? Number(changes.paidAmount)
            : Number(existing.paid_amount || 0);
        const balance =
          changes.balance !== undefined
            ? Number(changes.balance)
            : Math.max(totalAmount - paidAmount, 0);
        const paid =
          changes.paid !== undefined
            ? Boolean(changes.paid)
            : balance <= 0;
        const dueDate =
          changes.dueDate !== undefined
            ? String(changes.dueDate)
            : String(existing.due_date || "");

        const [updated] = await sql`
          UPDATE bills
          SET
            previous_unit = ${previousUnit},
            current_unit = ${currentUnit},
            used_unit = ${usedUnit},
            unit_rate = ${unitRate},
            electricity_amount = ${electricityAmount},
            base_rent = ${baseRent},
            total_amount = ${totalAmount},
            paid_amount = ${paidAmount},
            balance = ${balance},
            paid = ${paid},
            due_date = ${dueDate}
          WHERE id = ${billId}
          RETURNING *
        `;
        return NextResponse.json(billFromRow(updated));
      }

      case "markAllPaidForTenant": {
        const tenantId = Number(body.tenantId);
        const updatedRows = await sql`
          UPDATE bills
          SET paid = true, balance = 0, paid_amount = total_amount
          WHERE tenant_id = ${tenantId} AND paid = false
          RETURNING *
        `;
        return NextResponse.json(updatedRows.map(billFromRow));
      }

      case "updateBillPaid": {
        const billId = String(body.billId || "");
        const paid = Boolean(body.paid);

        const [existing] = await sql`SELECT * FROM bills WHERE id = ${billId}`;
        const paidAmount = paid ? (existing ? existing.total_amount : 0) : 0;
        const balance = paid ? 0 : (existing ? existing.total_amount : 0);

        const [updated] = await sql`
          UPDATE bills
          SET paid = ${paid}, paid_amount = ${paidAmount}, balance = ${balance}
          WHERE id = ${billId}
          RETURNING *
        `;
        if (!updated) {
          return NextResponse.json({ error: "Bill not found." }, { status: 404 });
        }
        return NextResponse.json(billFromRow(updated));
      }

      case "deleteBill": {
        const billId = String(body.billId || "");
        await sql`DELETE FROM bills WHERE id = ${billId}`;
        return NextResponse.json({ success: true });
      }

      case "deleteBillsForTenant":
      case "clearTenantBills": {
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
