/**
 * PayOS Integration — Mind Sales Lab
 * Docs: https://payos.vn/docs/
 *
 * Hỗ trợ Vietcombank + tất cả ngân hàng Việt Nam
 */

import crypto from 'crypto'

const PAYOS_BASE_URL = 'https://api-merchant.payos.vn'

export interface PayOSPaymentData {
  bin: string
  accountNumber: string
  accountName: string
  amount: number
  description: string
  orderCode: number
  paymentLinkId: string
  status: string
  checkoutUrl: string
  qrCode: string
}

export interface PayOSWebhookData {
  orderCode: number
  amount: number
  description: string
  accountNumber: string
  reference: string
  transactionDateTime: string
  paymentLinkId: string
  code: string
  desc: string
  counterAccountBankId?: string
  counterAccountBankName?: string
  counterAccountName?: string
  counterAccountNumber?: string
  virtualAccountName?: string
  virtualAccountNumber?: string
}

/**
 * Tạo chữ ký HMAC SHA256 cho PayOS
 * Sort keys → key=value&key=value → HMAC SHA256
 */
function createSignature(data: Record<string, unknown>, checksumKey: string): string {
  const sortedKeys = Object.keys(data).sort()
  const signStr = sortedKeys
    .filter(k => data[k] !== null && data[k] !== undefined)
    .map(k => `${k}=${data[k]}`)
    .join('&')
  return crypto.createHmac('sha256', checksumKey).update(signStr).digest('hex')
}

/**
 * Xác thực webhook signature từ PayOS
 */
export function verifyPayOSWebhook(
  webhookData: PayOSWebhookData,
  signature: string,
  checksumKey: string
): boolean {
  const expected = createSignature(webhookData as unknown as Record<string, unknown>, checksumKey)
  return expected === signature
}

/**
 * Tạo PayOS payment link
 */
export async function createPayOSPayment(params: {
  orderCode: number
  amount: number
  description: string           // max 25 ký tự
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  returnUrl: string
  cancelUrl: string
}): Promise<PayOSPaymentData> {
  const clientId  = process.env.PAYOS_CLIENT_ID
  const apiKey    = process.env.PAYOS_API_KEY
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error('PayOS chưa được cấu hình. Cần: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY')
  }

  // Tạo signature cho request
  const signData = {
    amount: params.amount,
    cancelUrl: params.cancelUrl,
    description: params.description,
    orderCode: params.orderCode,
    returnUrl: params.returnUrl,
  }
  const signature = createSignature(signData as unknown as Record<string, unknown>, checksumKey)

  const body = {
    orderCode: params.orderCode,
    amount: params.amount,
    description: params.description,
    buyerName: params.buyerName,
    buyerEmail: params.buyerEmail,
    buyerPhone: params.buyerPhone,
    items: [
      {
        name: 'Mind Sales Lab — 1 tháng',
        quantity: 1,
        price: params.amount,
      },
    ],
    returnUrl: params.returnUrl,
    cancelUrl: params.cancelUrl,
    signature,
  }

  const res = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': clientId,
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (json.code !== '00') {
    throw new Error(`PayOS lỗi: ${json.desc || JSON.stringify(json)}`)
  }

  return json.data as PayOSPaymentData
}

/**
 * Lấy thông tin payment link (kiểm tra trạng thái)
 */
export async function getPayOSPaymentInfo(paymentLinkId: string): Promise<{
  status: string
  amount: number
  orderCode: number
}> {
  const clientId = process.env.PAYOS_CLIENT_ID
  const apiKey   = process.env.PAYOS_API_KEY

  const res = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests/${paymentLinkId}`, {
    headers: {
      'x-client-id': clientId!,
      'x-api-key': apiKey!,
    },
  })

  const json = await res.json()
  return json.data
}
