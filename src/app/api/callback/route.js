import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import CryptoJS from 'crypto-js';

const RESPONSE_KEY = '4CA66926C9A4D81AD182FD307C8F58';

function verifyChecksum(dataString, receivedChecksum, key) {
  const expected = CryptoJS.HmacSHA256(dataString, key).toString();
  return expected === receivedChecksum;
}

export async function POST(req) {
  const formData = await req.formData();

  const merchantId = formData.get('merchantId');
  const clientId = formData.get('clientId');
  const orderId = formData.get('orderId');
  const txnAmount = formData.get('transactionAmount');
  const status = formData.get('status');
  const userId = formData.get('userDefinedField1');
  const checksum = formData.get('checksum');

  const dataString = `${merchantId}|${clientId}|${orderId}|${txnAmount}|${status}|${userId}`;
  const isValid = verifyChecksum(dataString, checksum, RESPONSE_KEY);

  if (!isValid || status !== 'SUCCESS') {
    console.error('❌ Invalid checksum or failed payment');
    return new NextResponse('Invalid request', { status: 400 });
  }

  const amount = parseFloat(txnAmount);
  const savedAmount = Math.ceil(amount) - amount;
  const lockUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90-day lock

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
        lockedUntil: lockUntil,
      },
    });

    return new NextResponse(`
      <html><body>
        <h2>✅ Payment Successful</h2>
        <p>Saved ₹${savedAmount.toFixed(2)} to your savings account (locked until ${lockUntil.toDateString()})</p>
        <a href="/dashboard">Go to Dashboard</a>
      </body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('❌ DB Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
