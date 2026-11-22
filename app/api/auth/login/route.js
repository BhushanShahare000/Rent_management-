import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const cleanEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const cleanPassword = typeof body.password === "string" ? body.password.trim() : "";

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Check if owner already exists with this email
    const existingOwners = await sql`
      SELECT id, email, password
      FROM owners
      WHERE lower(email) = ${cleanEmail}
    `;

    if (existingOwners.length === 0) {
      // Check total count of owners
      const allOwners = await sql`SELECT count(*) FROM owners`;
      const count = parseInt(allOwners[0].count, 10);

      // If fewer than 5 accounts exist, register this new owner account automatically
      if (count < 5) {
        const [newOwner] = await sql`
          INSERT INTO owners (email, password)
          VALUES (${cleanEmail}, ${cleanPassword})
          RETURNING id, email
        `;
        return NextResponse.json({
          user: { id: newOwner.id, email: newOwner.email },
          token: `${newOwner.id}:${Date.now()}`
        });
      }

      return NextResponse.json(
        { error: "Owner not found with this email. Please check your credentials." },
        { status: 401 }
      );
    }

    const owner = existingOwners[0];
    if (owner.password !== cleanPassword) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: { id: owner.id, email: owner.email },
      token: `${owner.id}:${Date.now()}`
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
