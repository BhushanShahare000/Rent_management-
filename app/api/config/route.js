import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const isConfigured = Boolean(
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL
  );

  return NextResponse.json(
    { isDatabaseConfigured: isConfigured },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

