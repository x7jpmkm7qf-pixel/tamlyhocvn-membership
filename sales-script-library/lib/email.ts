import { Resend } from 'resend'
import { promises as fs } from 'fs'
import path from 'path'

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

// ═══════════════════════════════════════════════════════════════════════════
// LEAD MAGNET — "Bản Đồ 4 Loại Khách Hàng Sales Việt" (/ban-do)
// Welcome email + PDF attachment (read from public/files/)
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBanDoWelcomeEmail(opts: NurtureEmailOpts): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY chưa cấu hình — bỏ qua ban-do welcome')
    console.log(`[email][DEV] To: ${opts.to} | Bản Đồ welcome`)
    return { ok: true }
  }

  const firstName = getFirstName(opts.name)
  const khauQuyetUrl = `${APP_URL}/khau-quyet`

  let pdfAttachment: { filename: string; content: string } | undefined
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'files', 'Ban-Do-4-Loai-Khach-Hang-Sales-Viet.pdf')
    const buf = await fs.readFile(pdfPath)
    pdfAttachment = {
      filename: 'Ban-Do-4-Loai-Khach-Hang-Sales-Viet.pdf',
      content: buf.toString('base64'),
    }
  } catch (e) {
    console.warn('[email] Read ban-do PDF failed, gửi email không attach:', e instanceof Error ? e.message : e)
  }

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
        Cảm ơn ${escapeHtml(firstName)} sư huynh!
      </h1>

      <p style="font-size:14.5px;line-height:1.7;color:#1C1917;margin:0 0 14px;">
        Em là Sơn. Em xin gửi sư huynh <strong>Bản Đồ 4 Loại Khách Hàng Sales Việt</strong> — file PDF đính kèm trong email này.
      </p>

      <p style="font-size:14px;line-height:1.7;color:#1C1917;margin:0 0 14px;">
        20 trang — đọc trong 30 phút. Trong bản đồ, sư huynh sẽ nhận diện <strong>4 archetype</strong>, hiểu <strong>tâm lý gốc</strong> đằng sau từng loại, và có <strong>5 câu quiz</strong> chẩn đoán loại khách trong 60 giây.
      </p>

      <div style="background:#FEF7E6;border-left:4px solid #C9A961;padding:14px 18px;border-radius:0 6px 6px 0;margin:18px 0;">
        <p style="font-size:13.5px;line-height:1.6;color:#1C1917;margin:0;">
          📎 <strong>File đính kèm:</strong> Ban-Do-4-Loai-Khach-Hang-Sales-Viet.pdf
          ${!pdfAttachment ? '<br><span style="color:#7C2D12;font-size:12px;">(Nếu không thấy file, sư huynh phản hồi email này — em gửi lại ngay)</span>' : ''}
        </p>
      </div>

      <hr style="border:none;border-top:1px dashed #C9A961;margin:24px 0;">

      <p style="font-size:14px;line-height:1.7;color:#1C1917;margin:0 0 10px;">
        <strong>Sau khi đọc Bản Đồ —</strong> nếu sư huynh muốn có sẵn <em>câu mẫu word-for-word</em> cho 10 phản đối kinh điển nhất, em có bộ <strong>Khẩu Quyết Phá Phản Đối</strong>:
      </p>

      <div style="text-align:center;margin:18px 0;">
        <a href="${khauQuyetUrl}" style="display:inline-block;background:#7C2D12;color:#FEF7E6;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:6px;font-size:14px;">
          📜 Xem 10 Khẩu Quyết — 199k →
        </a>
      </div>

      <p style="font-size:12.5px;line-height:1.6;color:#6b3a20;margin:0;">
        Bản đồ giúp sư huynh <strong>HIỂU</strong> khách. Khẩu Quyết giúp sư huynh <strong>XỬ LÝ</strong> khách. Bổ trợ nhau.
      </p>

      <hr style="border:none;border-top:1px dashed #C9A961;margin:24px 0;">

      <p style="font-size:13px;line-height:1.7;color:#6b3a20;margin:0;">
        Có câu hỏi nhắn Zalo cho em:<br>
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

Cảm ơn ${firstName} sư huynh!

Em là Sơn. Em xin gửi sư huynh "Bản Đồ 4 Loại Khách Hàng Sales Việt" — file PDF đính kèm trong email này.

20 trang — đọc trong 30 phút. Sư huynh sẽ nhận diện 4 archetype, hiểu tâm lý gốc đằng sau từng loại, và có 5 câu quiz chẩn đoán loại khách trong 60 giây.

📎 File đính kèm: Ban-Do-4-Loai-Khach-Hang-Sales-Viet.pdf
${!pdfAttachment ? '(Nếu không thấy file, sư huynh phản hồi email này — em gửi lại ngay)' : ''}

Sau khi đọc Bản Đồ — nếu sư huynh muốn có sẵn câu mẫu word-for-word cho 10 phản đối kinh điển, em có bộ Khẩu Quyết Phá Phản Đối:
${khauQuyetUrl}

Bản đồ giúp HIỂU khách. Khẩu Quyết giúp XỬ LÝ khách. Bổ trợ nhau.

Có câu hỏi nhắn Zalo: 0961 588 227 — Hán Văn Sơn
— Tàng Kinh Các (tamlyhocvn.club)`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: '📜 Bản Đồ 4 Loại Khách Hàng — Tàng Kinh Các',
      html,
      text,
      ...(pdfAttachment && { attachments: [pdfAttachment] }),
    })
    if (error) {
      console.error('[email] sendBanDoWelcomeEmail Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[email] sendBanDoWelcomeEmail failed:', e)
    return { ok: false, error: msg }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO DELIVERY — Bộ Khẩu Quyết Toàn Tập (sau khi thanh toán 99k)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gửi PDF Bộ Khẩu Quyết Toàn Tập cho khách sau khi SePay xác nhận thanh toán.
 * - Attach PDF trực tiếp (~1.4MB)
 * - Kèm link backup tải lại từ Vercel Blob
 * - Nếu fetch PDF fail, vẫn gửi email với link only (không fail toàn bộ flow)
 */
export async function sendKhauQuyetDelivery(opts: {
  to: string
  name: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY chưa cấu hình — bỏ qua delivery Khẩu Quyết')
    return { ok: true }
  }

  const firstName = getFirstName(opts.name)
  const pdfUrl = process.env.KHAU_QUYET_PDF_URL

  if (!pdfUrl) {
    console.error('[email] KHAU_QUYET_PDF_URL chưa set — không gửi được PDF')
    return { ok: false, error: 'PDF URL not configured' }
  }

  // Fetch PDF buffer cho attachment (best-effort — fail thì gửi link only)
  let pdfAttachment: { filename: string; content: string } | undefined
  try {
    const pdfResp = await fetch(pdfUrl, { signal: AbortSignal.timeout(8000) })
    if (pdfResp.ok) {
      const buf = await pdfResp.arrayBuffer()
      pdfAttachment = {
        filename: 'Khau-Quyet-Toan-Tap.pdf',
        content: Buffer.from(buf).toString('base64'),
      }
    } else {
      console.warn('[email] Fetch PDF non-OK:', pdfResp.status, '— gửi link only')
    }
  } catch (e) {
    console.warn('[email] Fetch PDF failed, gửi link only:', e instanceof Error ? e.message : e)
  }

  const html = khauQuyetDeliveryHtml({ name: firstName, pdfUrl })
  const text = khauQuyetDeliveryText({ name: firstName, pdfUrl })

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `📜 ${firstName} ơi — Bộ Khẩu Quyết Toàn Tập đã đến`,
      html,
      text,
      ...(pdfAttachment && { attachments: [pdfAttachment] }),
    })
    if (error) {
      console.error('[email] sendKhauQuyetDelivery Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[email] sendKhauQuyetDelivery failed:', e)
    return { ok: false, error: msg }
  }
}

function khauQuyetDeliveryHtml({ name, pdfUrl }: { name: string; pdfUrl: string }) {
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf6e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2d1a10;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;line-height:1;margin-bottom:8px;">📜</div>
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:700;color:#5d2418;letter-spacing:2px;">TÀNG KINH CÁC</div>
      <div style="font-size:11px;letter-spacing:3px;color:#8b6a3a;margin-top:2px;">— tamlyhocvn.club —</div>
    </div>

    <!-- Main card -->
    <div style="background:#fff;border:1px solid #d4b894;border-radius:12px;padding:32px;border-top:6px solid #5d2418;">
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:700;margin:0 0 16px;color:#5d2418;">
        Cảm tạ ${escapeHtml(name)} sư huynh đã gia nhập!
      </h1>

      <p style="font-size:15px;line-height:1.7;color:#3d1f15;margin:0 0 16px;">
        Tiểu đệ Sơn đây. Sư huynh đã chính thức là <strong>đệ tử nhập môn</strong> của Tàng Kinh Các — em xin gửi sư huynh <strong>Bộ Khẩu Quyết Toàn Tập</strong> đính kèm email này.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:24px 0;">
        <a href="${pdfUrl}" style="display:inline-block;background:linear-gradient(135deg,#5d2418 0%,#8b3a1c 100%);color:#fdf6e8;text-decoration:none;font-weight:700;padding:14px 36px;border-radius:8px;font-size:15px;letter-spacing:0.5px;">
          📥 Tải PDF (1.4 MB)
        </a>
        <div style="font-size:11px;color:#8b6a3a;margin-top:8px;">
          File đã đính kèm email này. Nếu không thấy attachment, bấm nút trên để tải.
        </div>
      </div>

      <!-- Phần trong PDF -->
      <div style="background:#fff8eb;border-left:4px solid #c8941a;padding:14px 18px;border-radius:0 6px 6px 0;margin:20px 0;">
        <div style="font-size:11px;letter-spacing:2px;color:#8b3a1c;font-weight:700;text-transform:uppercase;margin-bottom:8px;">📖 Trong bộ này có gì</div>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#3d1f15;">
          <li><strong>Framework Bắt Mạch 4 bước</strong> (L–H–Đ–Q) — tâm pháp gốc</li>
          <li><strong>10 Khẩu Quyết</strong> phá 10 phản đối hay gặp nhất</li>
          <li><strong>Cheatsheet 1 trang</strong> — in ra dán bàn làm việc</li>
        </ul>
      </div>

      <!-- Lộ trình 7 ngày -->
      <div style="margin:24px 0;">
        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-weight:700;color:#5d2418;margin-bottom:10px;">
          🗡️ Lộ trình 7 ngày tới
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
          <tr><td style="padding:6px 0;color:#8b6a3a;width:80px;"><strong>Ngày 1–2:</strong></td><td style="padding:6px 0;color:#3d1f15;">In cheatsheet 1 trang, dán bàn. Đọc qua 10 khẩu quyết.</td></tr>
          <tr><td style="padding:6px 0;color:#8b6a3a;"><strong>Ngày 3–5:</strong></td><td style="padding:6px 0;color:#3d1f15;">Mỗi ngày 1 khẩu quyết — nhái trong 3 cuộc gọi thật.</td></tr>
          <tr><td style="padding:6px 0;color:#8b6a3a;"><strong>Ngày 6–7:</strong></td><td style="padding:6px 0;color:#3d1f15;">Note câu nào hiệu quả — chỉnh thành phiên bản riêng.</td></tr>
        </table>
      </div>

      <!-- Bonus reminder -->
      <p style="font-size:14px;line-height:1.7;color:#3d1f15;margin:20px 0 8px;">
        💡 Sau 7 ngày, sư huynh đã không còn là <em>đệ tử nhập môn</em> — sư huynh đã thành <em>đệ tử ngoại môn</em>.
      </p>
      <p style="font-size:14px;line-height:1.7;color:#3d1f15;margin:0 0 8px;">
        Nếu sư huynh muốn lên <strong>đệ tử thân truyền</strong> (Nội Môn), Tàng Kinh Các vẫn mở cửa: <a href="${APP_URL}/khau-quyet/nang-cap" style="color:#8b3a1c;font-weight:600;">tamlyhocvn.club/khau-quyet/nang-cap</a>
      </p>

      <hr style="border:none;border-top:1px dashed #d4b894;margin:24px 0;">

      <!-- Support -->
      <p style="font-size:13px;line-height:1.7;color:#6b3a20;margin:0;">
        Có câu hỏi nào về 10 khẩu quyết? Sư huynh nhắn Zalo cho em:<br>
        <strong style="color:#5d2418;">📱 0961 588 227 — Hán Văn Sơn</strong>
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:11px;color:#8b6a3a;margin-top:20px;font-style:italic;font-family:'Cormorant Garamond',Georgia,serif;">
      "Khách không phản đối vì giá. Khách phản đối vì chưa thấy đường ra."<br>
      <span style="color:#b8895a;font-size:10px;letter-spacing:1px;">— TÀNG KINH CÁC —</span>
    </p>
  </div>
</body>
</html>`
}

function khauQuyetDeliveryText({ name, pdfUrl }: { name: string; pdfUrl: string }) {
  return `📜 TÀNG KINH CÁC — tamlyhocvn.club

Cảm tạ ${name} sư huynh đã gia nhập!

Tiểu đệ Sơn đây. Sư huynh đã chính thức là đệ tử nhập môn của Tàng Kinh Các — em xin gửi sư huynh Bộ Khẩu Quyết Toàn Tập đính kèm email này.

📥 Tải PDF (backup link): ${pdfUrl}
(File đã đính kèm email. Nếu không thấy attachment, bấm link trên để tải.)

📖 Trong bộ này có gì:
- Framework Bắt Mạch 4 bước (L–H–Đ–Q) — tâm pháp gốc
- 10 Khẩu Quyết phá 10 phản đối hay gặp nhất
- Cheatsheet 1 trang — in ra dán bàn làm việc

🗡️ Lộ trình 7 ngày tới:
- Ngày 1–2: In cheatsheet 1 trang, dán bàn. Đọc qua 10 khẩu quyết.
- Ngày 3–5: Mỗi ngày 1 khẩu quyết — nhái trong 3 cuộc gọi thật.
- Ngày 6–7: Note câu nào hiệu quả — chỉnh thành phiên bản riêng.

💡 Sau 7 ngày, sư huynh đã thành đệ tử ngoại môn. Nếu muốn lên đệ tử thân truyền (Nội Môn): ${APP_URL}/khau-quyet/nang-cap

Có câu hỏi? Nhắn Zalo: 0961 588 227 — Hán Văn Sơn

— Tàng Kinh Các (tamlyhocvn.club)
"Khách không phản đối vì giá. Khách phản đối vì chưa thấy đường ra."`
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
// AUTO DELIVERY — Tàng Kinh Các Nội Môn (sau khi thanh toán 266k upgrade hoặc 365k trọn gói)
// ═══════════════════════════════════════════════════════════════════════════

const ZALO_NOI_MON_GROUP = 'https://zalo.me/g/iaa5rn07vkurgl1tiana'

export async function sendNoiMonDelivery(opts: {
  to: string
  name: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY chưa cấu hình — bỏ qua delivery Nội Môn')
    return { ok: true }
  }

  const firstName = getFirstName(opts.name)
  const khauQuyetUrl = process.env.KHAU_QUYET_PDF_URL
  const noiMonUrl = process.env.NOI_MON_PDF_URL || `${APP_URL}/files/Tang-Kinh-Cac-Noi-Mon-Tuyen-Tap.pdf`

  async function fetchAttachment(url: string, filename: string) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!r.ok) {
        console.warn(`[email] Fetch ${filename} non-OK:`, r.status)
        return undefined
      }
      const buf = await r.arrayBuffer()
      return { filename, content: Buffer.from(buf).toString('base64') }
    } catch (e) {
      console.warn(`[email] Fetch ${filename} failed:`, e instanceof Error ? e.message : e)
      return undefined
    }
  }

  // Fetch cả 2 PDF song song
  const [khauQuyetAtt, noiMonAtt] = await Promise.all([
    khauQuyetUrl ? fetchAttachment(khauQuyetUrl, 'Khau-Quyet-Toan-Tap.pdf') : Promise.resolve(undefined),
    fetchAttachment(noiMonUrl, 'Tang-Kinh-Cac-Noi-Mon-Tuyen-Tap.pdf'),
  ])
  const attachments = [khauQuyetAtt, noiMonAtt].filter(Boolean) as { filename: string; content: string }[]

  const html = noiMonDeliveryHtml({
    name: firstName,
    khauQuyetUrl: khauQuyetUrl || '',
    noiMonUrl,
  })
  const text = noiMonDeliveryText({
    name: firstName,
    khauQuyetUrl: khauQuyetUrl || '',
    noiMonUrl,
  })

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `🏯 ${firstName} ơi — Tàng Kinh Các Nội Môn đã mở cửa`,
      html,
      text,
      ...(attachments.length > 0 && { attachments }),
    })
    if (error) {
      console.error('[email] sendNoiMonDelivery Resend error:', error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[email] sendNoiMonDelivery failed:', e)
    return { ok: false, error: msg }
  }
}

function noiMonDeliveryHtml({ name, khauQuyetUrl, noiMonUrl }: { name: string; khauQuyetUrl: string; noiMonUrl: string }) {
  const libraryUrl = `${APP_URL}/library`
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf6e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2d1a10;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;line-height:1;margin-bottom:8px;">🏯</div>
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:700;color:#5d2418;letter-spacing:2px;">TÀNG KINH CÁC — NỘI MÔN</div>
      <div style="font-size:11px;letter-spacing:3px;color:#8b6a3a;margin-top:2px;">— tamlyhocvn.club —</div>
    </div>

    <!-- Main card -->
    <div style="background:#fff;border:1px solid #d4b894;border-radius:12px;padding:32px;border-top:6px solid #c8941a;">
      <div style="display:inline-block;background:#fef3d4;color:#8b3a1c;font-size:11px;letter-spacing:2px;font-weight:700;padding:4px 12px;border-radius:4px;margin-bottom:12px;">⚜️ ĐỆ TỬ THÂN TRUYỀN</div>

      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:700;margin:0 0 16px;color:#5d2418;">
        Cảm tạ ${escapeHtml(name)} sư huynh — Nội Môn đã mở cửa!
      </h1>

      <p style="font-size:15px;line-height:1.7;color:#3d1f15;margin:0 0 16px;">
        Tiểu đệ Sơn đây. Sư huynh đã chính thức là <strong>đệ tử thân truyền</strong> của Tàng Kinh Các Nội Môn — quyền truy cập <strong>trọn đời</strong>, không giới hạn thời gian.
      </p>

      <!-- 3 Quyền lợi -->
      <div style="background:#fff8eb;border-left:4px solid #c8941a;padding:18px 20px;border-radius:0 6px 6px 0;margin:20px 0;">
        <div style="font-size:11px;letter-spacing:2px;color:#8b3a1c;font-weight:700;text-transform:uppercase;margin-bottom:12px;">⚜️ Tam Đại Bí Bảo Nội Môn</div>

        <div style="margin-bottom:14px;">
          <div style="font-weight:700;color:#5d2418;font-size:15px;margin-bottom:4px;">📚 1. Thư viện 100+ Kịch Bản Chuyên Ngành — TRỌN ĐỜI</div>
          <div style="font-size:13.5px;line-height:1.6;color:#3d1f15;">BĐS · Bảo hiểm · F&B · EdTech · Mỹ phẩm · B2B · Freelance · Coaching. Truy cập ngay tại <a href="${libraryUrl}" style="color:#8b3a1c;font-weight:600;">tamlyhocvn.club/library</a></div>
        </div>

        <div style="margin-bottom:14px;">
          <div style="font-weight:700;color:#5d2418;font-size:15px;margin-bottom:4px;">🎬 2. Live "Mổ Xẻ Deal" — 12 buổi/năm</div>
          <div style="font-size:13.5px;line-height:1.6;color:#3d1f15;">Mỗi buổi 90 phút tiểu đệ mổ xẻ 3 case thật của đệ tử. Lịch cụ thể tiểu đệ sẽ báo riêng trong nhóm Zalo Nội Môn.</div>
        </div>

        <div>
          <div style="font-weight:700;color:#5d2418;font-size:15px;margin-bottom:4px;">💬 3. Nhóm Zalo Nội Môn — TRỌN ĐỜI</div>
          <div style="font-size:13.5px;line-height:1.6;color:#3d1f15;">Hỏi case 24/7, tiểu đệ + cao thủ trả lời trong vòng 24h. Bấm vào nút bên dưới để gia nhập 👇</div>
        </div>
      </div>

      <!-- CTA chính: Library -->
      <div style="text-align:center;margin:24px 0 12px;">
        <a href="${libraryUrl}" style="display:inline-block;background:linear-gradient(135deg,#5d2418 0%,#8b3a1c 100%);color:#fdf6e8;text-decoration:none;font-weight:700;padding:14px 36px;border-radius:8px;font-size:15px;letter-spacing:0.5px;">
          📚 Vào Tàng Kinh Các Nội Môn →
        </a>
      </div>

      <!-- CTA phụ: Zalo group -->
      <div style="text-align:center;margin:12px 0 20px;">
        <a href="${ZALO_NOI_MON_GROUP}" style="display:inline-block;background:#fff;border:2px solid #c8941a;color:#5d2418;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:8px;font-size:14px;">
          💬 Gia nhập Nhóm Zalo Nội Môn →
        </a>
      </div>

      <!-- 2 Bộ PDF kèm theo -->
      <hr style="border:none;border-top:1px dashed #d4b894;margin:24px 0;">
      <div style="background:#faf2dd;padding:14px 18px;border-radius:8px;margin:16px 0;">
        <div style="font-size:13px;color:#5d2418;font-weight:700;margin-bottom:10px;letter-spacing:1px;text-transform:uppercase;">
          📎 2 BỘ PDF KÈM THEO EMAIL NÀY
        </div>
        <div style="font-size:13px;color:#3d1f15;line-height:1.7;margin-bottom:8px;">
          📜 <strong>Bộ Khẩu Quyết Toàn Tập</strong> — tâm pháp gốc 10 khẩu quyết phá phản đối.
          ${khauQuyetUrl ? `<br><span style="font-size:11.5px;color:#8b6a3a;">Tải lại: <a href="${khauQuyetUrl}" style="color:#8b3a1c;">Khau-Quyet-Toan-Tap.pdf</a></span>` : ''}
        </div>
        <div style="font-size:13px;color:#3d1f15;line-height:1.7;">
          🏯 <strong>Tàng Kinh Các Nội Môn — Tuyển Tập</strong> — 25+ kịch bản chuyên ngành, mỗi cái có câu mẫu sẵn dùng + tâm pháp + ví dụ thực chiến.
          <br><span style="font-size:11.5px;color:#8b6a3a;">Tải lại: <a href="${noiMonUrl}" style="color:#8b3a1c;">Tang-Kinh-Cac-Noi-Mon-Tuyen-Tap.pdf</a></span>
        </div>
      </div>

      <!-- Lời hứa bonus -->
      <p style="font-size:14px;line-height:1.7;color:#3d1f15;margin:20px 0 8px;">
        🎁 <strong>Lời hứa của tiểu đệ:</strong> Trong vài ngày tới, tiểu đệ sẽ chủ động gửi thêm <strong>các bonus đặc biệt</strong> dành riêng cho đệ tử Nội Môn — sư huynh chờ tin nhắn Zalo của tiểu đệ nhé.
      </p>

      <hr style="border:none;border-top:1px dashed #d4b894;margin:24px 0;">

      <!-- Support -->
      <p style="font-size:13px;line-height:1.7;color:#6b3a20;margin:0;">
        Có câu hỏi hay cần tiểu đệ phân tích case riêng? Nhắn Zalo trực tiếp:<br>
        <strong style="color:#5d2418;">📱 0961 588 227 — Hán Văn Sơn</strong>
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:11px;color:#8b6a3a;margin-top:20px;font-style:italic;font-family:'Cormorant Garamond',Georgia,serif;">
      "Đệ tử ngoại môn học chiêu. Đệ tử thân truyền học tâm."<br>
      <span style="color:#b8895a;font-size:10px;letter-spacing:1px;">— TÀNG KINH CÁC NỘI MÔN —</span>
    </p>
  </div>
</body>
</html>`
}

function noiMonDeliveryText({ name, khauQuyetUrl, noiMonUrl }: { name: string; khauQuyetUrl: string; noiMonUrl: string }) {
  const libraryUrl = `${APP_URL}/library`
  return `🏯 TÀNG KINH CÁC — NỘI MÔN (tamlyhocvn.club)

Cảm tạ ${name} sư huynh — Nội Môn đã mở cửa!

Tiểu đệ Sơn đây. Sư huynh đã chính thức là đệ tử thân truyền của Tàng Kinh Các Nội Môn — quyền truy cập TRỌN ĐỜI.

⚜️ TAM ĐẠI BÍ BẢO NỘI MÔN:

📚 1. Thư viện Kịch Bản Chuyên Ngành — TRỌN ĐỜI
   25+ kịch bản đang chạy, thêm 10/tháng theo trend & case học viên nộp.
   Truy cập ngay: ${libraryUrl}

🎬 2. Live "Mổ Xẻ Deal" — 12 buổi/năm
   Mỗi buổi 90 phút, tiểu đệ mổ xẻ 3 case thật của đệ tử.
   Lịch cụ thể tiểu đệ sẽ báo riêng trong nhóm Zalo Nội Môn.

💬 3. Nhóm Zalo Nội Môn — TRỌN ĐỜI
   Hỏi case 24/7. Gia nhập: ${ZALO_NOI_MON_GROUP}

📎 2 BỘ PDF KÈM THEO EMAIL NÀY:
   📜 Bộ Khẩu Quyết Toàn Tập — tâm pháp gốc 10 khẩu quyết phá phản đối.
   ${khauQuyetUrl ? `Tải lại: ${khauQuyetUrl}` : ''}
   🏯 Tàng Kinh Các Nội Môn — Tuyển Tập — 25+ kịch bản chuyên ngành.
   Tải lại: ${noiMonUrl}

🎁 LỜI HỨA CỦA TIỂU ĐỆ:
Trong vài ngày tới, tiểu đệ sẽ chủ động gửi thêm các bonus đặc biệt
dành riêng cho đệ tử Nội Môn — sư huynh chờ tin nhắn Zalo của tiểu đệ.

Có câu hỏi? Nhắn Zalo: 0961 588 227 — Hán Văn Sơn

— Tàng Kinh Các Nội Môn (tamlyhocvn.club)
"Đệ tử ngoại môn học chiêu. Đệ tử thân truyền học tâm."`
}
