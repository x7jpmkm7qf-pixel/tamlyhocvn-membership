import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mind Sales Lab <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function sendVerificationEmail(opts: {
  to: string
  name: string
  token: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY chưa cấu hình — bỏ qua gửi email')
    console.log(`[email][DEV] Verify URL: ${APP_URL}/verify-email?token=${opts.token}`)
    return { ok: true }
  }

  const verifyUrl = `${APP_URL}/verify-email?token=${opts.token}`
  const firstName = opts.name.split(' ').pop() || opts.name

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: 'Xác minh email — Mind Sales Lab',
      html: buildHtml({ name: firstName, verifyUrl }),
      text: buildText({ name: firstName, verifyUrl }),
    })
    if (error) {
      console.error('[email] Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[email] send failed:', e)
    return { ok: false, error: msg }
  }
}

function buildHtml({ name, verifyUrl }: { name: string; verifyUrl: string }) {
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:28px;">🧠</span>
      <span style="font-size:18px;font-weight:800;background:linear-gradient(90deg,#7c3aed,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Mind Sales Lab</span>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 12px;color:#0f172a;">Xác minh email của bạn</h1>
      <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 16px;">
        Chào <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 24px;">
        Cảm ơn bạn đã đăng ký tài khoản tại <strong>Mind Sales Lab</strong>. Vui lòng nhấn nút bên dưới để xác minh email — việc này giúp bạn nhận được thông báo, hóa đơn, và khôi phục tài khoản khi cần.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${verifyUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:12px;font-size:14px;">
          Xác minh email →
        </a>
      </div>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 8px;">
        Hoặc copy link này dán vào trình duyệt:
      </p>
      <p style="font-size:12px;color:#7c3aed;word-break:break-all;margin:0 0 24px;">
        <a href="${verifyUrl}" style="color:#7c3aed;">${verifyUrl}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
      <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;">
        Link xác minh có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:24px;">
      © Mind Sales Lab — tamlyhocvn.club
    </p>
  </div>
</body>
</html>`
}

function buildText({ name, verifyUrl }: { name: string; verifyUrl: string }) {
  return `Chào ${name},

Cảm ơn bạn đã đăng ký tại Mind Sales Lab. Vui lòng xác minh email bằng link sau:

${verifyUrl}

Link có hiệu lực trong 24 giờ. Nếu bạn không đăng ký, vui lòng bỏ qua email này.

— Mind Sales Lab (tamlyhocvn.club)`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAD NURTURE EMAIL SEQUENCE — "3 Kịch Bản Chốt Đơn" lead magnet
// ═══════════════════════════════════════════════════════════════════════════

interface NurtureEmailOpts {
  to: string
  name: string
}

function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1] || fullName
}

async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY chưa cấu hình — bỏ qua: ${opts.subject}`)
    console.log(`[email][DEV] To: ${opts.to} | ${opts.subject}`)
    return { ok: true }
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    })
    if (error) {
      console.error('[email] Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

function nurtureLayout({
  title,
  bodyHtml,
  ctaUrl,
  ctaText,
}: {
  title: string
  bodyHtml: string
  ctaUrl?: string
  ctaText?: string
}): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:28px;">🧠</span>
      <span style="font-size:18px;font-weight:800;background:linear-gradient(90deg,#7c3aed,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Mind Sales Lab</span>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 16px;color:#0f172a;">${escapeHtml(title)}</h1>
      <div style="font-size:14px;line-height:1.7;color:#334155;">${bodyHtml}</div>
      ${
        ctaUrl && ctaText
          ? `<div style="text-align:center;margin:28px 0 8px;">
              <a href="${ctaUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:12px;font-size:14px;">${escapeHtml(ctaText)}</a>
            </div>`
          : ''
      }
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;">
      <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0;">
        Bạn nhận email này vì đã tải tài liệu miễn phí "3 Kịch Bản Chốt Đơn" từ <strong>tamlyhocvn.club</strong>.
        Có gì cần hỏi cứ nhắn Zalo: <a href="tel:0961588227" style="color:#7c3aed;">0961 588 227</a> — Hán Văn Sơn.
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:24px;">
      © Mind Sales Lab — tamlyhocvn.club
    </p>
  </div>
</body>
</html>`
}

/** T+0: Welcome — gửi NGAY khi user điền form, kèm link xem 3 kịch bản */
export async function sendLeadWelcomeEmail(opts: NurtureEmailOpts) {
  const firstName = getFirstName(opts.name)
  const viewUrl = `${APP_URL}/free/download`

  const html = nurtureLayout({
    title: `Cảm ơn ${escapeHtml(firstName)} — 3 kịch bản chốt đơn đây ạ 🎁`,
    bodyHtml: `
      <p>Chào <strong>${escapeHtml(firstName)}</strong>,</p>
      <p>Em là Sơn — admin <strong>tamlyhocvn.club</strong>. Cảm ơn anh/chị đã quan tâm đến bộ <em>"3 Kịch Bản Chốt Đơn"</em>!</p>
      <p>3 kịch bản này em soạn từ kinh nghiệm thực tế đào tạo 200+ sales trong 5 năm — gồm 3 tình huống gặp nhiều nhất:</p>
      <ul style="margin:8px 0 16px;padding-left:20px;">
        <li><strong>Kịch bản 1</strong> — Khi khách nói "để em suy nghĩ thêm"</li>
        <li><strong>Kịch bản 2</strong> — Khi khách chê đắt</li>
        <li><strong>Kịch bản 3</strong> — Khi khách im lặng sau báo giá</li>
      </ul>
      <p>Click nút bên dưới để xem chi tiết — có nút <strong>💾 Lưu PDF</strong> ở trang đó để in/save về máy nếu anh/chị muốn 👇</p>
    `,
    ctaUrl: viewUrl,
    ctaText: 'Xem 3 kịch bản ngay →',
  })

  const text = `Chào ${firstName},

Em là Sơn — cảm ơn anh/chị đã quan tâm đến "3 Kịch Bản Chốt Đơn".

Xem chi tiết tại: ${viewUrl}
(Có nút "Lưu PDF" trên trang để in/save về máy.)

Có gì cần hỏi nhắn Zalo: 0961 588 227 — Hán Văn Sơn.
— Mind Sales Lab (tamlyhocvn.club)`

  return sendEmail({
    to: opts.to,
    subject: `🎁 ${firstName} ơi, 3 kịch bản chốt đơn đây ạ`,
    html,
    text,
  })
}

/** T+24h: Check-in — hỏi đã đọc chưa, share thêm tip nhỏ */
export async function sendLeadCheckinEmail(opts: NurtureEmailOpts) {
  const firstName = getFirstName(opts.name)

  const html = nurtureLayout({
    title: `${escapeHtml(firstName)} ơi, anh/chị đã thử kịch bản nào chưa? 🤔`,
    bodyHtml: `
      <p>Chào <strong>${escapeHtml(firstName)}</strong>,</p>
      <p>Hôm qua em gửi anh/chị bộ "3 Kịch Bản Chốt Đơn" — không biết anh/chị đã có cơ hội áp dụng kịch bản nào chưa?</p>
      <p style="background:#fef3c7;padding:14px 18px;border-radius:10px;border-left:3px solid #d97706;margin:16px 0;">
        <strong>💡 Bí quyết em hay nhắc học viên:</strong><br>
        Đừng đọc thuộc lòng kịch bản — hãy lấy <strong>logic tâm lý đằng sau</strong> rồi diễn đạt theo phong cách của anh/chị.
        Khách nhận ra "đọc thuộc" là sẽ phòng thủ ngay.
      </p>
      <p>Anh/chị có gặp tình huống nào kịch bản trong tài liệu chưa cover không? Reply email này em tư vấn miễn phí — không bán gì hết 🙏</p>
      <p>— Sơn</p>
    `,
  })

  const text = `Chào ${firstName},

Hôm qua em gửi anh/chị "3 Kịch Bản Chốt Đơn" — đã có dịp áp dụng chưa?

💡 Tip: Đừng đọc thuộc kịch bản — hãy lấy logic tâm lý rồi diễn đạt theo phong cách của anh/chị. Khách nhận ra "đọc thuộc" là sẽ phòng thủ ngay.

Có tình huống nào kịch bản chưa cover? Reply email này em tư vấn miễn phí — không bán gì hết.

— Sơn (tamlyhocvn.club)`

  return sendEmail({
    to: opts.to,
    subject: `${firstName} đã thử kịch bản nào chưa?`,
    html,
    text,
  })
}

/** T+72h: Soft pitch — giới thiệu Mind Sales Lab 99K */
export async function sendLeadPitchEmail(opts: NurtureEmailOpts) {
  const firstName = getFirstName(opts.name)
  const registerUrl = `${APP_URL}/register`

  const html = nurtureLayout({
    title: `Nếu 3 kịch bản giúp được, đây là 18+ kịch bản nữa 🎯`,
    bodyHtml: `
      <p>Chào <strong>${escapeHtml(firstName)}</strong>,</p>
      <p>Em thấy <em>"3 Kịch Bản Chốt Đơn"</em> được rất nhiều anh/chị áp dụng thành công trong tuần đầu — em rất vui!</p>
      <p>Bộ tài liệu miễn phí chỉ là phần nổi của tảng băng. Trong <strong>Mind Sales Lab</strong> em có:</p>
      <ul style="margin:8px 0 16px;padding-left:20px;">
        <li>✓ <strong>18+ kịch bản chuyên sâu</strong> theo từng ngành (BĐS, Bảo hiểm, Mỹ phẩm, Tài chính, F&B...)</li>
        <li>✓ <strong>Lộ trình 30 ngày</strong> từ cơ bản đến nâng cao</li>
        <li>✓ <strong>Phân tích tâm lý học</strong> đằng sau từng kịch bản</li>
        <li>✓ <strong>Ví dụ thực tế</strong> trên Zalo / FB / gặp trực tiếp</li>
        <li>✓ Cập nhật <strong>kịch bản mới hàng tháng</strong></li>
      </ul>
      <p style="background:#ecfdf5;padding:14px 18px;border-radius:10px;border-left:3px solid #059669;margin:16px 0;">
        <strong>💰 Giá: 99.000đ/tháng</strong> — bằng 2 ly cà phê. Hủy bất cứ lúc nào.<br>
        <strong>🛡 Cam kết:</strong> Không hài lòng trong 7 ngày đầu → hoàn tiền 100%.
      </p>
      <p>Anh/chị muốn thử trải nghiệm 1 tháng đầu xem có phù hợp không?</p>
    `,
    ctaUrl: registerUrl,
    ctaText: 'Trải nghiệm Mind Sales Lab →',
  })

  const text = `Chào ${firstName},

Bộ "3 Kịch Bản Chốt Đơn" chỉ là phần nổi. Trong Mind Sales Lab em có:
- 18+ kịch bản chuyên sâu (BĐS, Bảo hiểm, Mỹ phẩm, Tài chính, F&B...)
- Lộ trình 30 ngày
- Phân tích tâm lý học
- Cập nhật hàng tháng

💰 Giá: 99.000đ/tháng (bằng 2 ly cà phê). Hủy bất cứ lúc nào.
🛡 Cam kết hoàn tiền 7 ngày đầu nếu không hài lòng.

Đăng ký thử: ${registerUrl}

— Sơn (tamlyhocvn.club)`

  return sendEmail({
    to: opts.to,
    subject: `${firstName}, có 18 kịch bản nữa chuyên sâu hơn — anh/chị muốn xem?`,
    html,
    text,
  })
}

/** T+5d: Last call — bộ free thêm + nhắc cuối */
export async function sendLeadLastCallEmail(opts: NurtureEmailOpts) {
  const firstName = getFirstName(opts.name)
  const registerUrl = `${APP_URL}/register`

  const html = nurtureLayout({
    title: `${escapeHtml(firstName)} — em gửi nốt 1 thứ cuối cùng 🙏`,
    bodyHtml: `
      <p>Chào <strong>${escapeHtml(firstName)}</strong>,</p>
      <p>Đây là email cuối em gửi anh/chị về Mind Sales Lab — em không muốn làm phiền nên xin phép tóm tắt nhanh:</p>
      <ul style="margin:8px 0 16px;padding-left:20px;">
        <li>📚 Anh/chị đã tải bộ "3 Kịch Bản Chốt Đơn" miễn phí 5 ngày trước</li>
        <li>💡 Trong Mind Sales Lab có thêm 18+ kịch bản chuyên sâu</li>
        <li>💰 Giá 99K/tháng — hủy bất cứ lúc nào, hoàn tiền 7 ngày</li>
      </ul>
      <p>Nếu anh/chị thấy phù hợp thì đăng ký luôn. Nếu chưa — em hiểu, không sao cả.</p>
      <p>Em sẽ không spam thêm — sau email này em sẽ ngừng. Có gì cần hỏi cứ nhắn Zalo <strong>0961 588 227</strong> em sẵn sàng tư vấn miễn phí 🙏</p>
      <p>— Sơn</p>
    `,
    ctaUrl: registerUrl,
    ctaText: 'Tìm hiểu Mind Sales Lab →',
  })

  const text = `Chào ${firstName},

Đây là email cuối em gửi về Mind Sales Lab. Em không muốn làm phiền:
- Anh/chị đã tải "3 Kịch Bản Chốt Đơn" 5 ngày trước
- Trong Mind Sales Lab có 18+ kịch bản chuyên sâu nữa
- Giá 99K/tháng, hủy lúc nào cũng được, hoàn tiền 7 ngày

Đăng ký nếu thấy phù hợp: ${registerUrl}

Nếu chưa — không sao cả. Sau email này em ngừng spam.

Có gì cần nhắn Zalo: 0961 588 227 — Sơn.`

  return sendEmail({
    to: opts.to,
    subject: `${firstName}, email cuối em xin phép gửi 🙏`,
    html,
    text,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAD MAGNET — "Bản Đồ 4 Loại Khách Hàng Sales Việt" (/ban-do)
// PDF đang hoàn thiện — email welcome xác nhận đăng ký, hứa gửi PDF sớm
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBanDoWelcomeEmail(opts: NurtureEmailOpts) {
  const firstName = getFirstName(opts.name)
  const khauQuyetUrl = `${APP_URL}/khau-quyet`

  const html = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FEF7E6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1C1917;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;line-height:1;margin-bottom:8px;">📜</div>
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:700;color:#7C2D12;letter-spacing:2px;">TÀNG KINH CÁC</div>
      <div style="font-size:11px;letter-spacing:3px;color:#A48A4A;margin-top:2px;">— tamlyhocvn.club —</div>
    </div>

    <div style="background:#fff;border:1px solid #C9A961;border-radius:12px;padding:28px;border-top:6px solid #7C2D12;">
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:700;margin:0 0 14px;color:#7C2D12;">
        Cảm ơn ${escapeHtml(firstName)} đã đăng ký Bản Đồ!
      </h1>

      <p style="font-size:14.5px;line-height:1.7;color:#1C1917;margin:0 0 14px;">
        Em là Sơn — tác giả của <strong>Tàng Kinh Các</strong>. Em đã nhận được đăng ký của anh/chị cho bộ <em>"Bản Đồ 4 Loại Khách Hàng Sales Việt"</em>.
      </p>

      <div style="background:#FEF7E6;border-left:4px solid #C9A961;padding:14px 18px;border-radius:0 6px 6px 0;margin:18px 0;">
        <div style="font-size:11px;letter-spacing:1.5px;color:#7C2D12;font-weight:700;text-transform:uppercase;margin-bottom:6px;">📜 Một lưu ý nhỏ</div>
        <p style="font-size:13.5px;line-height:1.6;color:#1C1917;margin:0;">
          Em đang trau chuốt phiên bản PDF cuối cùng — bản hoàn chỉnh sẽ được gửi cho anh/chị qua chính email này, <strong>trong vài ngày tới</strong>. Cảm ơn anh/chị đã kiên nhẫn 🙏
        </p>
      </div>

      <p style="font-size:14px;line-height:1.7;color:#1C1917;margin:18px 0 8px;">
        <strong>Trong Bản Đồ, anh/chị sẽ học:</strong>
      </p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:13.5px;line-height:1.7;color:#1C1917;">
        <li>🔬 Khách <strong>"Phân Tích Gia"</strong> — Cần dữ liệu, sợ sai lầm</li>
        <li>🛡️ Khách <strong>"Thận Trọng"</strong> — Cần thời gian, sợ áp lực</li>
        <li>⚡ Khách <strong>"Quyết Nhanh"</strong> — Cần urgency, sợ phức tạp</li>
        <li>🔍 Khách <strong>"Hoài Nghi"</strong> — Cần proof, sợ bị lừa</li>
      </ul>

      <hr style="border:none;border-top:1px dashed #C9A961;margin:24px 0;">

      <p style="font-size:14px;line-height:1.7;color:#1C1917;margin:0 0 10px;">
        <strong>Trong lúc chờ Bản Đồ —</strong> nếu anh/chị muốn <em>có sẵn câu mẫu</em> cho 10 phản đối kinh điển nhất, em có bộ <strong>Khẩu Quyết Phá Phản Đối</strong>:
      </p>

      <div style="text-align:center;margin:18px 0;">
        <a href="${khauQuyetUrl}" style="display:inline-block;background:#7C2D12;color:#FEF7E6;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:6px;font-size:14px;">
          📜 Xem 10 Khẩu Quyết →
        </a>
      </div>

      <p style="font-size:12.5px;line-height:1.6;color:#6b3a20;margin:0;">
        Bản đồ giúp anh/chị <strong>HIỂU</strong> khách.
        Khẩu Quyết giúp anh/chị <strong>XỬ LÝ</strong> khách. Bổ trợ nhau.
      </p>

      <hr style="border:none;border-top:1px dashed #C9A961;margin:24px 0;">

      <p style="font-size:13px;line-height:1.7;color:#6b3a20;margin:0;">
        Có câu hỏi nào nhắn Zalo cho em:<br>
        <strong style="color:#7C2D12;">📱 0961 588 227 — Hán Văn Sơn</strong>
      </p>
    </div>

    <p style="text-align:center;font-size:11px;color:#A48A4A;margin-top:20px;font-style:italic;font-family:'Cormorant Garamond',Georgia,serif;">
      "Bắt đúng mạch khách — chốt đúng cách deal."<br>
      <span style="color:#b8895a;font-size:10px;letter-spacing:1px;">— TÀNG KINH CÁC —</span>
    </p>
  </div>
</body>
</html>`

  const text = `📜 TÀNG KINH CÁC — tamlyhocvn.club

Cảm ơn ${firstName} đã đăng ký Bản Đồ!

Em là Sơn — em đã nhận được đăng ký của anh/chị cho bộ "Bản Đồ 4 Loại Khách Hàng Sales Việt".

📜 LƯU Ý: Em đang trau chuốt phiên bản PDF cuối cùng — bản hoàn chỉnh sẽ được gửi qua chính email này, trong vài ngày tới. Cảm ơn anh/chị đã kiên nhẫn 🙏

Trong Bản Đồ, anh/chị sẽ học:
- 🔬 Khách "Phân Tích Gia" — Cần dữ liệu, sợ sai lầm
- 🛡️ Khách "Thận Trọng" — Cần thời gian, sợ áp lực
- ⚡ Khách "Quyết Nhanh" — Cần urgency, sợ phức tạp
- 🔍 Khách "Hoài Nghi" — Cần proof, sợ bị lừa

Trong lúc chờ — nếu anh/chị muốn có sẵn câu mẫu cho 10 phản đối kinh điển, em có bộ Khẩu Quyết Phá Phản Đối:
${khauQuyetUrl}

Bản đồ giúp HIỂU khách. Khẩu Quyết giúp XỬ LÝ khách. Bổ trợ nhau.

Có câu hỏi nhắn Zalo: 0961 588 227 — Hán Văn Sơn
— Tàng Kinh Các (tamlyhocvn.club)`

  return sendEmail({
    to: opts.to,
    subject: `📜 ${firstName} ơi — Em đã nhận đăng ký Bản Đồ`,
    html,
    text,
  })
}
