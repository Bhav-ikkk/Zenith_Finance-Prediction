import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const API_KEY = 'C13B7E5E81047CA91177A8BC82FB3E';
const MERCHANT_ID = 'SG2129';
const PAYMENT_PAGE_CLIENT_ID = 'hdfcmaster';
const BASE_URL = 'https://smartgatewayuat.hdfcbank.com';
const REDIRECT_URL = 'http://localhost:3000/api/callback'; // update for prod if needed

function generateChecksum(dataString, apiKey) {
  return CryptoJS.HmacSHA256(dataString, apiKey).toString();
}

export async function POST(req) {
  const { userId, amount } = await req.json();

  const orderId = `ORDER_${Date.now()}`;
  const txnAmount = amount.toString();

  const data = {
    merchantId: MERCHANT_ID,
    clientId: PAYMENT_PAGE_CLIENT_ID,
    orderId,
    transactionAmount: txnAmount,
    redirectUrl: REDIRECT_URL,
    txnType: 'SALE',
    paymentMode: 'ALL',
    currency: 'INR',
    userDefinedField1: userId,
  };

  const dataString = `${data.merchantId}|${data.clientId}|${data.orderId}|${data.transactionAmount}|${data.redirectUrl}|${data.txnType}|${data.paymentMode}|${data.currency}|${data.userDefinedField1}`;
  const checksum = generateChecksum(dataString, API_KEY);

  const form = `
    <form id="paymentForm" action="${BASE_URL}/SmartGateway/payment/form" method="post">
      ${Object.entries(data).map(([key, value]) => `<input type="hidden" name="${key}" value="${value}"/>`).join('\n')}
      <input type="hidden" name="checksum" value="${checksum}"/>
    </form>
    <script>document.getElementById('paymentForm').submit();</script>
  `;

  return new NextResponse(form, {
    headers: { 'Content-Type': 'text/html' },
  });
}
