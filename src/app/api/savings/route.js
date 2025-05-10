import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const savings = await prisma.saving.findMany({
    where: { userId },
  });

  const total = savings.reduce((acc, curr) => acc + curr.amount, 0);

  return NextResponse.json({
    totalSaved: total.toFixed(2),
    entries: savings,
  });
}
