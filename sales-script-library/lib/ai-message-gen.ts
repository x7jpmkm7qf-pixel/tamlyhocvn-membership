/**
 * AI Message Generator — sinh tin Zalo cá nhân hóa cho admin copy-paste.
 *
 * Dùng Claude Haiku 4.5 (rẻ, nhanh, đủ thông minh).
 * Gọi từ lib/telegram.ts khi build tin Telegram cho admin.
 *
 * Có fallback static template nếu Claude API fail / chưa cấu hình.
 */

import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-haiku-4-5-20251001'

// URLs cố định trong tin
export const REGISTER_URL = 'https://www.tamlyhocvn.club/register'
export const ZALO_GROUP_URL = 'https://zalo.me/g/iaa5rn07vkurgl1tiana'

const client = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null

interface GenerateOptions {
  name: string
  industry?: string
  /** Tuổi của lead theo giờ — tin T+0 vs nudge khác nhau */
  ageHours?: number
}

function fallbackMessage(opts: GenerateOptions): string {
  const firstName = opts.name.trim().split(/\s+/).pop() || opts.name
  const industryLine = opts.industry
    ? `\n\nEm thấy anh đang sales ngành ${opts.industry} — em có riêng kịch bản chuyên sâu cho ngành này, để em chia sẻ với anh nhé.`
    : `\n\nAnh đang sales ngành gì vậy ạ? Em hỏi để giới thiệu đúng kịch bản phù hợp.`

  return `Chào anh ${firstName}!

Em là Sơn — admin tamlyhocvn.club. Em vừa thấy anh tải tài liệu "3 Kịch Bản Chốt Đơn" của em 🙏${industryLine}

Bonus em tặng anh 2 link:
📚 Đăng ký Mind Sales Lab (99K/tháng — 18+ kịch bản): ${REGISTER_URL}
👥 Nhóm Zalo cộng đồng sales: ${ZALO_GROUP_URL}

Có gì cần hỏi cứ nhắn em ạ!`
}

/**
 * Sinh tin Zalo cá nhân hóa cho admin copy → paste vào Zalo khách.
 * - Personalize theo ngành nghề
 * - Kèm link register + link nhóm Zalo
 * - Tone: thân thiện, không pushy
 * - Return: string ~150-300 từ, ready-to-copy
 */
export async function generateZaloFollowupMessage(
  opts: GenerateOptions
): Promise<{ message: string; fromAI: boolean }> {
  if (!client) {
    return { message: fallbackMessage(opts), fromAI: false }
  }

  const firstName = opts.name.trim().split(/\s+/).pop() || opts.name
  const industryContext = opts.industry
    ? `Anh ấy/chị ấy đang làm sales ngành: ${opts.industry}.`
    : `Anh ấy/chị ấy chưa cho biết ngành nghề cụ thể.`

  const ageContext =
    opts.ageHours && opts.ageHours >= 24
      ? `Lead đã ${Math.round(opts.ageHours)}h kể từ lúc tải — đây là tin follow-up nhắc lại, không phải tin chào đầu.`
      : `Lead vừa tải tài liệu — đây là tin chào đầu tiên.`

  const systemPrompt = `Bạn là copywriter chuyên viết tin nhắn Zalo cho admin tên "Sơn" của trang tamlyhocvn.club (chuyên về kịch bản sales). Khách hàng vừa điền form tải tài liệu "3 Kịch Bản Chốt Đơn" miễn phí.

NHIỆM VỤ: Viết 1 tin nhắn Zalo ngắn (150-250 từ) để Sơn copy-paste gửi cho khách.

QUY TẮC TUYỆT ĐỐI:
1. Xưng "em", gọi khách "anh" (mặc định) hoặc "chị" (chỉ khi tên là tên nữ rõ ràng: Mai/Lan/Hương/Thảo/Linh/Nhung/Hoa/...)
2. Tone: thân thiện, chân thành, KHÔNG pushy/spam
3. CÁ NHÂN HÓA THEO NGÀNH NGHỀ: đưa 1 ví dụ pain point hoặc kịch bản cụ thể của ngành đó
4. Bao gồm 2 link CHÍNH XÁC ở cuối:
   - Đăng ký: ${REGISTER_URL}
   - Nhóm Zalo cộng đồng: ${ZALO_GROUP_URL}
5. KHÔNG nói "khóa học của em là tốt nhất" — chân thành, dùng số liệu cụ thể
6. KHÔNG dùng emoji quá nhiều — 2-4 emoji là đủ
7. KHÔNG mở đầu bằng "Kính chào quý anh chị" — quá formal. Mở: "Chào anh [tên]!"

CẤU TRÚC TIN NHẮN:
- Câu 1: Lời chào cá nhân + nhắc lại context (vừa tải tài liệu)
- Câu 2-3: Insight/pain point CỤ THỂ cho ngành của khách (~2-3 câu thực tế)
- Câu 4: Soft pitch Mind Sales Lab (18+ kịch bản, 99K/tháng) — chỉ nói nhẹ, KHÔNG ép
- Đoạn cuối: 2 link rõ ràng (đăng ký + nhóm Zalo)
- Kết: 1 câu thân thiện mời chat tiếp nếu cần

CHỈ XUẤT RA TIN NHẮN — không xuất phần giải thích, không xuất subject line.`

  const userPrompt = `Khách hàng:
- Tên: ${opts.name} (gọi là anh/chị "${firstName}")
- ${industryContext}
- ${ageContext}

Hãy viết tin nhắn Zalo cho Sơn copy gửi khách.`

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text =
      (response.content?.[0] as { type: string; text?: string })?.text?.trim() ||
      ''

    if (!text || text.length < 50) {
      return { message: fallbackMessage(opts), fromAI: false }
    }
    return { message: text, fromAI: true }
  } catch (e) {
    console.error('[ai-message-gen] error:', e instanceof Error ? e.message : e)
    return { message: fallbackMessage(opts), fromAI: false }
  }
}
