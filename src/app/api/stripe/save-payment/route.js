import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  const { userId, amount } = await req.json();

  if (!userId || !amount) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

 const savedAmount = parseFloat((amount * 0.05).toFixed(2)); // 5% savings

  const lockedUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

  try {
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        savedAmount,
      },
    });

    await prisma.saving.create({
      data: {
        userId,
        amount: savedAmount,
        lockedUntil,
      },
    });

    return NextResponse.json({ message: 'Saved', savedAmount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
