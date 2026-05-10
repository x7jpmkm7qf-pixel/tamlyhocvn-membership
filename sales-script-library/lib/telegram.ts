/**
 * Telegram notification helper
 * Gửi thông báo đến admin khi có đăng ký mới / thanh toán xác nhận
 */

const TELEGRAM_API = 'https://api.telegram.org'

interface InlineButton {
  text: string
  url: string
}

interface SendOptions {
  /** Inline keyboard buttons hiện dưới tin nhắn — mỗi sub-array là 1 hàng */
  inline_keyboard?: InlineButton[][]
  /** Disable web preview để tin gọn hơn */
  disable_web_page_preview?: boolean
}

async function sendTelegramMessage(
  text: string,
  options: SendOptions = {}
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[Telegram] BOT_TOKEN hoặc CHAT_ID chưa được cấu hình')
    return
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: options.disable_web_page_preview ?? true,
  }

  if (options.inline_keyboard) {
    body.reply_markup = { inline_keyboard: options.inline_keyboard }
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      console.error('[Telegram] Lỗi gửi tin:', err)
    }
  } catch (e) {
    console.error('[Telegram] Lỗi kết nối:', e)
  }
}

/** Chuẩn hóa SĐT VN — strip non-digits, đảm bảo có '0' đầu */
function normalizeVnPhone(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^0-9]/g, '')
  if (!digits) return null
  // Nếu đã có 84 đầu → bỏ 84, thêm 0
  if (digits.startsWith('84') && digits.length >= 11) return '0' + digits.slice(2)
  // Nếu chưa có 0 đầu (vd: 858181950) → thêm 0
  if (!digits.startsWith('0') && digits.length === 9) return '0' + digits
  return digits
}

/** Tạo Zalo deep link để mở chat trực tiếp với số đó */
function buildZaloLink(phone?: string | null): string | null {
  const normalized = normalizeVnPhone(phone)
  if (!normalized) return null
  return `https://zalo.me/${normalized}`
}

/** Escape HTML cho Telegram parse_mode=HTML */
function escapeTelegramHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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

/** Thông báo danh sách thành viên sắp hết hạn (dùng bởi cron) */
export async function notifyExpiringMembers(members: Array<{
  name: string
  email: string
  phone?: string
  expiresAt: string
  daysLeft: number
}>) {
  if (members.length === 0) return

  const lines = [
    `⏰ <b>Nhắc gia hạn — ${new Date().toLocaleDateString('vi-VN')}</b>`,
    `Có <b>${members.length} thành viên</b> sắp hết hạn trong 3 ngày:`,
    '',
  ]

  members.forEach((m, i) => {
    const expDate = new Date(m.expiresAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    lines.push(`${i + 1}. <b>${m.name}</b>`)
    lines.push(`   📧 <code>${m.email}</code>${m.phone ? ` · 📞 ${m.phone}` : ''}`)
    lines.push(`   📅 Hết hạn: <b>${expDate}</b> (còn ${m.daysLeft} ngày)`)
    lines.push('')
  })

  lines.push('👉 Liên hệ qua Zalo để nhắc gia hạn!')

  await sendTelegramMessage(lines.join('\n'))
}

/** Thông báo khi có người tải lead magnet miễn phí */
export async function notifyFreeLead(data: {
  name: string
  email: string
  phone?: string
}) {
  const firstName = data.name.trim().split(/\s+/).pop() || data.name
  const zaloUrl = buildZaloLink(data.phone)

  // Tin mẫu T+0 — anh long-press vào <code> block để copy nhanh
  const template = `Chào anh ${firstName}!

Em là Sơn — admin tamlyhocvn.club. Em vừa thấy anh tải tài liệu "3 Kịch Bản Chốt Đơn" của em 🙏

Anh đang sales ngành gì vậy ạ? Em hỏi để có thể giới thiệu đúng kịch bản phù hợp nhất với anh.`

  const text = [
    '🎁 <b>Lead Magnet mới — "3 Kịch Bản Chốt Đơn"</b>',
    '',
    `👤 <b>Tên:</b> ${data.name}`,
    `📧 <b>Email:</b> <code>${data.email}</code>`,
    data.phone ? `📞 <b>SĐT:</b> <code>${data.phone}</code>` : '',
    '',
    '⚡ <b>Liên hệ trong 24h</b> để nurture → upsell gói 99k!',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━',
    '<b>💬 Tin mẫu</b> (long-press để copy):',
    '',
    `<code>${escapeTelegramHtml(template)}</code>`,
  ].filter(Boolean).join('\n')

  // Inline buttons — chỉ thêm Zalo button nếu có SĐT hợp lệ
  const inline_keyboard: InlineButton[][] = []
  if (zaloUrl) {
    inline_keyboard.push([
      { text: '💬 Mở Zalo chat ngay', url: zaloUrl },
    ])
  }

  await sendTelegramMessage(text, {
    inline_keyboard: inline_keyboard.length > 0 ? inline_keyboard : undefined,
  })
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

// ═══════════════════════════════════════════════════════════════════════════
// LEAD NURTURE — admin notifications
// ═══════════════════════════════════════════════════════════════════════════

/** Nhắc admin khi 1 lead còn ở status `new` quá X giờ */
export async function notifyLeadNudge(opts: {
  name: string
  email: string
  phone?: string
  ageHours: number
  source: string
}) {
  const firstName = opts.name.trim().split(/\s+/).pop() || opts.name
  const zaloUrl = buildZaloLink(opts.phone)
  const isStillFresh = opts.ageHours < 48

  // Tin mẫu khác nhau theo độ "nóng" của lead
  const template = isStillFresh
    ? `Chào anh ${firstName}!

Em là Sơn — admin tamlyhocvn.club. Em vừa thấy anh tải bộ "3 Kịch Bản Chốt Đơn" hôm qua. Anh đã có dịp đọc qua chưa ạ?

Có gì khúc mắc cứ nhắn em — em sẵn sàng tư vấn miễn phí, không bán gì hết 🙏`
    : `Chào anh ${firstName}!

Em là Sơn — em thấy anh tải bộ "3 Kịch Bản Chốt Đơn" mấy hôm trước rồi mà chưa có cơ hội nói chuyện.

Em chỉ muốn hỏi nhanh: có kịch bản nào trong bộ chưa cover được tình huống cụ thể anh đang gặp không? Reply em một dòng thôi cũng được.`

  const text = [
    '⏰ <b>Lead chưa contact!</b>',
    '',
    `👤 <b>Tên:</b> ${opts.name}`,
    `📧 <b>Email:</b> <code>${opts.email}</code>`,
    opts.phone ? `📞 <b>SĐT:</b> <code>${opts.phone}</code>` : '',
    `📍 <b>Nguồn:</b> ${opts.source}`,
    `🕐 <b>Đã ${Math.round(opts.ageHours)}h kể từ khi tải</b>`,
    '',
    isStillFresh
      ? '🔥 Còn cơ hội cao — anh chat Zalo ngay!'
      : '⚠️ Lead đang nguội — last chance trước khi auto-archive.',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━',
    '<b>💬 Tin mẫu</b> (long-press để copy):',
    '',
    `<code>${escapeTelegramHtml(template)}</code>`,
  ].filter(Boolean).join('\n')

  const inline_keyboard: InlineButton[][] = []
  if (zaloUrl) {
    inline_keyboard.push([
      { text: '💬 Mở Zalo chat ngay', url: zaloUrl },
    ])
  }

  await sendTelegramMessage(text, {
    inline_keyboard: inline_keyboard.length > 0 ? inline_keyboard : undefined,
  })
}

/** Báo cáo summary auto-archive */
export async function notifyLeadAutoArchived(opts: {
  count: number
  emails: string[]
}) {
  if (opts.count === 0) return

  const text = [
    '📦 <b>Đã auto-archive lead nguội</b>',
    '',
    `Có <b>${opts.count}</b> lead không phản hồi sau 14 ngày, đã chuyển sang trạng thái "lost":`,
    '',
    ...opts.emails.slice(0, 10).map((e) => `• <code>${e}</code>`),
    opts.count > 10 ? `... và ${opts.count - 10} lead khác` : '',
    '',
    '💡 Vào /admin → tab Leads → filter "Mất lead" để xem.',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

/** Báo cáo cron run summary (gửi nếu có activity) */
export async function notifyLeadCronSummary(opts: {
  emailsSent: { welcome: number; checkin: number; pitch: number; lastcall: number }
  nudgesSent: number
  archived: number
  errors: number
}) {
  const total =
    opts.emailsSent.welcome +
    opts.emailsSent.checkin +
    opts.emailsSent.pitch +
    opts.emailsSent.lastcall
  if (total === 0 && opts.nudgesSent === 0 && opts.archived === 0) return

  const text = [
    '🤖 <b>Lead nurture cron đã chạy</b>',
    '',
    `📧 Email gửi: <b>${total}</b>`,
    `   • Welcome (T+0): ${opts.emailsSent.welcome}`,
    `   • Check-in (T+24h): ${opts.emailsSent.checkin}`,
    `   • Pitch (T+72h): ${opts.emailsSent.pitch}`,
    `   • Last call (T+5d): ${opts.emailsSent.lastcall}`,
    `🔔 Telegram nudge: <b>${opts.nudgesSent}</b>`,
    `📦 Auto-archived: <b>${opts.archived}</b>`,
    opts.errors > 0 ? `⚠️ Lỗi: <b>${opts.errors}</b>` : '',
  ].filter(Boolean).join('\n')

  await sendTelegramMessage(text)
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN SECURITY — login alerts + lockout notifications
// ═══════════════════════════════════════════════════════════════════════════

function shortUserAgent(ua: string): string {
  // Lấy browser + OS rút gọn từ User-Agent
  let browser = 'unknown'
  if (/Chrome\/[\d.]+/.test(ua) && !/Edg\//.test(ua)) browser = 'Chrome'
  else if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari'

  let os = 'unknown'
  if (/iPhone|iPad/.test(ua)) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/Linux/.test(ua)) os = 'Linux'

  return `${browser} / ${os}`
}

/** Báo anh khi có người login admin thành công */
export async function notifyAdminLoginSuccess(opts: {
  ip: string
  userAgent: string
}) {
  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
  const text = [
    '🔐 <b>Admin login thành công</b>',
    '',
    `🌐 <b>IP:</b> <code>${opts.ip}</code>`,
    `📱 <b>Trình duyệt:</b> ${shortUserAgent(opts.userAgent)}`,
    `🕐 <b>Lúc:</b> ${time}`,
    '',
    '⚠️ <b>Nếu KHÔNG phải anh</b> → đổi mật khẩu ngay tại /admin → tab Cài đặt!',
  ].join('\n')

  const inline_keyboard: InlineButton[][] = [
    [{ text: '🔒 Đổi mật khẩu ngay', url: 'https://www.tamlyhocvn.club/admin' }],
  ]

  await sendTelegramMessage(text, { inline_keyboard })
}

/** Báo anh khi có IP brute-force bị block do quá nhiều lần sai */
export async function notifyAdminLoginFailedLockout(opts: {
  ip: string
  userAgent: string
  failCount: number
  blockMinutes: number
}) {
  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
  const text = [
    '🚨 <b>CẢNH BÁO BẢO MẬT — IP bị khóa do brute-force!</b>',
    '',
    `🌐 <b>IP:</b> <code>${opts.ip}</code>`,
    `📱 <b>Trình duyệt:</b> ${shortUserAgent(opts.userAgent)}`,
    `❌ <b>Số lần sai:</b> ${opts.failCount}`,
    `🔒 <b>Bị khóa:</b> ${opts.blockMinutes} phút`,
    `🕐 <b>Phát hiện lúc:</b> ${time}`,
    '',
    '⚠️ Có người đang thử đoán mật khẩu admin. Anh nên đổi password ngay nếu mật khẩu đang dùng có thể đoán được!',
  ].join('\n')

  await sendTelegramMessage(text)
}
