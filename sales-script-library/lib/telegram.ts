/**
 * Telegram notification helper
 * Gửi thông báo đến admin khi có đăng ký mới / thanh toán xác nhận
 */

const TELEGRAM_API = 'https://api.telegram.org'

async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[Telegram] BOT_TOKEN hoặc CHAT_ID chưa được cấu hình')
    return
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      console.error('[Telegram] Lỗi gửi tin:', err)
    }
  } catch (e) {
    console.error('[Telegram] Lỗi kết nối:', e)
  }
}

/** Thông báo khi có người đăng ký mới (chờ thanh toán) */
export async function notifyNewRegistration(data: {
  name: string
  email: string
  phone?: string
}) {
  const text = [
    '🔔 <b>Đăng ký mới — Chờ thanh toán</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    data.phone ? `📞 <b>SĐT:</b> ${data.phone}` : '',
    '',
    `💳 <b>Nội dung CK cần khớp:</b> <code>MSL ${data.email.toLowerCase().replace(/[@.]/g, '')}</code>`,
    `💰 <b>Số tiền:</b> 99.000đ`,
    '',
    '⏳ Chờ xác nhận chuyển khoản...',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

/** Thông báo khi thanh toán xác nhận & tài khoản được kích hoạt */
export async function notifyPaymentConfirmed(data: {
  name: string
  email: string
  amount: number
  transferContent: string
  referenceCode?: string
}) {
  const text = [
    '✅ <b>Thanh toán xác nhận — Tài khoản đã kích hoạt!</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    `💰 <b>Số tiền:</b> ${data.amount.toLocaleString('vi-VN')}đ`,
    `📝 <b>Nội dung CK:</b> ${data.transferContent}`,
    data.referenceCode ? `🔑 <b>Mã GD:</b> <code>${data.referenceCode}</code>` : '',
    '',
    '🚀 Tài khoản đã được kích hoạt tự động.',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

/** Thông báo khi admin kích hoạt thủ công */
export async function notifyManualActivation(data: {
  name: string
  email: string
}) {
  const text = [
    '🔑 <b>Kích hoạt thủ công bởi Admin</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    '',
    '✅ Tài khoản đã được kích hoạt.',
  ].join('\n')

  await sendTelegramMessage(text)
}

/** Thông báo khi có người đăng ký PRO Bootcamp */
export async function notifyBootcampLead(data: {
  name: string
  email: string
  phone: string
  industry: string
  note?: string
}) {
  const text = [
    '🎓 <b>Đăng ký PRO Bootcamp mới!</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📞 <b>SĐT:</b> <code>${data.phone}</code>`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    `🏷️ <b>Ngành:</b> ${data.industry}`,
    data.note ? `📝 <b>Vấn đề:</b> ${data.note}` : '',
    '',
    '💳 <b>Hướng dẫn thanh toán:</b>',
    `MB Bank · 0984899999 · HAN VAN SON`,
    `Số tiền: <b>1.497.000đ</b>`,
    `Nội dung CK: <code>PRO ${data.email.toLowerCase().replace(/[@.]/g, '')}</code>`,
    '',
    '⚡ Liên hệ xác nhận suất qua Zalo/điện thoại trong 2 tiếng!',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

/** Thông báo khi PRO Bootcamp thanh toán xác nhận */
export async function notifyBootcampPaid(data: {
  name: string
  email: string
  phone: string
  industry: string
  amount: number
  transferContent: string
  referenceCode?: string
}) {
  const text = [
    '✅ <b>PRO Bootcamp — Đã thanh toán!</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📞 <b>SĐT:</b> <code>${data.phone}</code>`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    `🏷️ <b>Ngành:</b> ${data.industry}`,
    `💰 <b>Số tiền:</b> ${data.amount.toLocaleString('vi-VN')}đ`,
    `📝 <b>Nội dung CK:</b> ${data.transferContent}`,
    data.referenceCode ? `🔑 <b>Mã GD:</b> <code>${data.referenceCode}</code>` : '',
    '',
    '🎓 Xác nhận suất và gửi thông tin Zoom cho học viên!',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

/** Thông báo khi 1:1 Mentoring thanh toán xác nhận */
export async function notifyMentoringPaid(data: {
  name: string
  email: string
  phone: string
  industry: string
  amount: number
  transferContent: string
  referenceCode?: string
}) {
  const text = [
    '✅ <b>1:1 Mentoring — Đã thanh toán!</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📞 <b>SĐT:</b> <code>${data.phone}</code>`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    `🏷️ <b>Ngành:</b> ${data.industry}`,
    `💰 <b>Số tiền:</b> ${data.amount.toLocaleString('vi-VN')}đ`,
    `📝 <b>Nội dung CK:</b> ${data.transferContent}`,
    data.referenceCode ? `🔑 <b>Mã GD:</b> <code>${data.referenceCode}</code>` : '',
    '',
    '🏆 Liên hệ mentee để đặt lịch buổi đầu tiên trong 24h!',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

/** Thông báo khi có người tải lead magnet miễn phí */
export async function notifyFreeLead(data: {
  name: string
  email: string
  phone?: string
}) {
  const text = [
    '🎁 <b>Lead Magnet mới — "3 Kịch Bản Chốt Đơn"</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    data.phone ? `📞 <b>SĐT:</b> ${data.phone}` : '',
    '',
    '⚡ Liên hệ trong 24h để nurture → upsell gói 99k!',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

/** Thông báo khi có người ứng tuyển 1:1 Mentoring */
export async function notifyMentoringApplication(data: {
  name: string
  email: string
  phone: string
  industry: string
  experience?: string
  currentProblem: string
  goal: string
}) {
  const text = [
    '🏆 <b>Đơn ứng tuyển 1:1 Mentoring mới!</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📞 <b>SĐT:</b> <code>${data.phone}</code>`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    `🏷️ <b>Ngành:</b> ${data.industry}`,
    data.experience ? `⏳ <b>Kinh nghiệm:</b> ${data.experience}` : '',
    '',
    `❗ <b>Vấn đề hiện tại:</b>`,
    data.currentProblem,
    '',
    `🎯 <b>Mục tiêu 90 ngày:</b>`,
    data.goal,
    '',
    '👉 Liên hệ trong 24h để trao đổi 15 phút và xác nhận fit!',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}
