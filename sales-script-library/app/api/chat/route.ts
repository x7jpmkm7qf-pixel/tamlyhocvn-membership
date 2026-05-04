/**
 * POST /api/chat
 * AI Chat endpoint — kết nối OpenAI GPT, trả lời câu hỏi khách hàng
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `Bạn là trợ lý AI của Mind Sales Lab — một nền tảng đào tạo kỹ năng bán hàng chuyên nghiệp dành cho dân sales Việt Nam.

THÔNG TIN SẢN PHẨM:
- Tên: Mind Sales Lab
- Giá: 99.000đ/tháng (rất hợp lý, bằng 2 ly cà phê)
- Nội dung:
  • 18+ kịch bản sales chi tiết cho từng ngành và tình huống thực tế
  • Lộ trình 30 ngày từ cơ bản đến nâng cao
  • Phân tích tâm lý học đằng sau mỗi kịch bản
  • Ví dụ thực tế: Zalo, Facebook, gặp trực tiếp
  • Cập nhật thêm kịch bản mới hàng tháng
- Ngành phù hợp: Bất động sản, Bảo hiểm, Tài chính, Xe hơi, Mỹ phẩm, Thực phẩm chức năng, và nhiều ngành khác
- Cách đăng ký: vào tamlyhocvn.club → Đăng ký → Thanh toán QR → Tự động kích hoạt ngay
- Hỗ trợ: 0961 588 227 — Hán Văn Sơn

CÁCH TRẢ LỜI:
- Dùng giọng văn thân thiện, tự nhiên như người bạn đang tư vấn
- Gọi khách là "anh/chị", xưng "mình" hoặc "em"
- Câu trả lời ngắn gọn, đúng trọng tâm, dễ đọc trên điện thoại
- Dùng emoji vừa phải để tạo cảm giác gần gũi 😊
- Khi khách hỏi về giá hoặc cách đăng ký → luôn khuyến khích đăng ký thử
- Khi khách có vấn đề kỹ thuật → hướng dẫn liên hệ 0961 588 227
- KHÔNG bịa thêm thông tin không có trong data trên
- Nếu không biết → thành thật nói "Để mình hỏi lại anh Sơn cho chính xác nhé, anh/chị có thể liên hệ 0961 588 227"

MỤC TIÊU: Giúp khách hiểu rõ lợi ích, giải đáp thắc mắc, và tự tin đăng ký thành viên.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Thiếu messages' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình API key' }, { status: 500 })
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model:      'gpt-4o-mini',
        max_tokens: 500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Chat API] OpenAI error:', JSON.stringify(data))
      return NextResponse.json({ error: 'AI đang bận, thử lại sau nhé!' }, { status: 500 })
    }

    const reply = data.choices?.[0]?.message?.content
      || 'Xin lỗi, mình chưa hiểu câu hỏi. Anh/chị có thể hỏi lại không ạ?'

    return NextResponse.json({ reply })

  } catch (err) {
    console.error('[Chat API] Lỗi:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra, thử lại sau nhé!' }, { status: 500 })
  }
}
