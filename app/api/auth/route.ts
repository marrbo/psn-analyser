// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Auth API working' });
}

export async function POST() {
  return NextResponse.json({ message: 'Auth POST working' });
}