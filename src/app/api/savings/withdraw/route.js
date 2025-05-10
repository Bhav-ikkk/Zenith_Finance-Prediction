import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userId, savingId } = await req.json();

  try {
    const saving = await prisma.saving.findUnique({ where: { id: savingId } });

    if (!saving || saving.userId !== userId) {
      return NextResponse.json({ error: 'Invalid saving entry' }, { status: 404 });
    }

    if (saving.isWithdrawn) {
      return NextResponse.json({ error: 'Already withdrawn' }, { status: 400 });
    }

    if (new Date(saving.lockedUntil) > new Date()) {
      return NextResponse.json({ error: 'Still locked' }, { status: 403 });
    }

    await prisma.saving.update({
      where: { id: savingId },
      data: { isWithdrawn: true },
    });

    return NextResponse.json({ message: 'Withdrawn (mock bank transfer)' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
