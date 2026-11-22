import { NextResponse } from "next/server";

export async function GET() {
  const isConfigured = Boolean(
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL
  );

  return NextResponse.json({ isDatabaseConfigured: isConfigured });
}
