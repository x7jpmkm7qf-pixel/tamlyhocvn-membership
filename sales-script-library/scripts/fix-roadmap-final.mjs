#!/usr/bin/env node
/**
 * FINAL FIX:
 * - Thêm 3 scripts mới (script-023, 024, 025) cho ngày 6, 9, 22
 * - Re-assign roadmap để không còn duplicate nào
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCRIPTS_PATH = path.resolve(__dirname, '..', 'data', 'scripts.json')
const ROADMAP_PATH = path.resolve(__dirname, '..', 'data', 'roadmap.json')
const NOW = '2026-05-11T07:00:00Z'

const NEW_SCRIPTS = [
  // ─────────────────────────────────────────────────────────────
  {
    id: 'script-023',
    title: '3 Kỹ thuật chốt sale không áp lực — Assumptive, Choice, Summary',
    industry: 'khac',
    situation: 'chot-sale',
    preview:
      'Chốt sale không cần ép. Đây là 3 kỹ thuật mà sales pro hay dùng — đặc trưng: khách không cảm thấy bị "bán", họ cảm thấy tự ra quyết định. Mỗi kỹ thuật đánh vào 1 cơ chế tâm lý khác nhau, dùng combo cả 3 hiệu quả nhất.',
    content:
      `**KỸ THUẬT 1 — ASSUMPTIVE CLOSE (Câu hỏi giả định)**\n\n` +
      `Bạn KHÔNG hỏi "Anh có mua không?" — bạn hỏi câu mặc định đã mua:\n\n` +
      `✓ "Anh muốn nhận hàng địa chỉ nhà hay công ty ạ?"\n` +
      `✓ "Em ship hôm nay được hay anh chọn ngày khác?"\n` +
      `✓ "Anh thanh toán bằng chuyển khoản hay thẻ ạ?"\n\n` +
      `**Tại sao hiệu quả:** Não người không thích phản biện điều đã được chấp nhận ngầm. Khi bạn đặt câu hỏi giả định, khách phải dùng năng lượng để nói "khoan, tôi chưa quyết" — nhiều người chọn đường đỡ tốn sức là... trả lời.\n\n` +
      `**Khi nào dùng:** Khách đã có 80% niềm tin, chỉ thiếu cú đẩy nhẹ. Đừng dùng khi khách còn đang phân vân lớn — sẽ phản tác dụng.\n\n` +
      `─────────────────────────\n\n` +
      `**KỸ THUẬT 2 — CHOICE CLOSE (Cho 2 lựa chọn)**\n\n` +
      `Bạn cho khách chọn giữa A và B — KHÔNG có "không mua":\n\n` +
      `✓ "Anh muốn gói Tiêu chuẩn 99K hay gói Premium 199K ạ?"\n` +
      `✓ "Em book lịch demo thứ 3 hay thứ 5 cho anh?"\n` +
      `✓ "Anh đặt cọc 5tr hay 10tr giữ căn này?"\n\n` +
      `**Tại sao hiệu quả:** Não người mệt khi phải so sánh nhiều lựa chọn. Cho 2 lựa chọn ĐỀU LÀ "mua" = decision fatigue thấp = chọn nhanh.\n\n` +
      `**Variant nâng cao — anchor pricing:**\n` +
      `Đưa 3 option: A (Tệ - 5tr), B (Tốt - 10tr), C (Cao - 25tr).\n` +
      `→ Khách thường chọn B vì A có vẻ tệ, C có vẻ đắt.\n` +
      `→ Bạn đã "ép" khách chọn B mà họ vẫn cảm thấy tự quyết.\n\n` +
      `─────────────────────────\n\n` +
      `**KỸ THUẬT 3 — SUMMARY CLOSE (Tóm tắt + chốt)**\n\n` +
      `Bạn tóm tắt LẠI tất cả những điều khách đã đồng ý, rồi close:\n\n` +
      `*"Để em tóm tắt: anh cần [X], anh muốn [Y], anh OK với mức đầu tư [Z]. Bên em đáp ứng đúng cả 3 — anh có muốn bắt đầu hôm nay không?"*\n\n` +
      `**Tại sao hiệu quả:**\n` +
      `1. Nhắc lại cam kết đã có → kích hoạt Consistency Principle (xem script-019)\n` +
      `2. Khách thấy "lựa chọn đúng" vì khớp với những gì họ đã nói\n` +
      `3. Giảm cognitive load — họ không phải nghĩ lại từ đầu\n\n` +
      `**Cách tăng hiệu quả:** Note lại từng yes của khách trong suốt cuộc trò chuyện, đến phần close đọc lại từng cái → cảm giác "không thể từ chối".\n\n` +
      `─────────────────────────\n\n` +
      `**COMBO 3 KỸ THUẬT — DÙNG THEO TRÌNH TỰ:**\n\n` +
      `**Đầu cuộc trò chuyện:** Choice Close để xác định preference\n` +
      `   *"Anh quan tâm gói cá nhân hay doanh nghiệp ạ?"*\n\n` +
      `**Giữa pitch:** Tích lũy "yes" + ghi chú\n\n` +
      `**Cuối pitch:** Summary Close → Assumptive Close\n` +
      `   *"Vậy đúng những gì anh cần. Em gửi đường link thanh toán anh chuyển trong 5 phút nhé?"*`,
    psychology:
      `**TÂM LÝ HỌC ĐẰNG SAU:**\n\n` +
      `**1. Cognitive Load Theory:** Quyết định mua tốn nhiều năng lượng nhận thức. Các kỹ thuật chốt giảm tải bằng cách: (a) loại bỏ lựa chọn "không mua" - Choice, (b) giả định đã mua - Assumptive, (c) tóm tắt thay vì bắt khách nhớ - Summary.\n\n` +
      `**2. Path of Least Resistance:** Não chọn con đường ít tốn sức nhất. Phản biện câu hỏi giả định = nhiều sức. Trả lời theo flow = ít sức. Não chọn ít sức.\n\n` +
      `**3. Choice Architecture (Thaler & Sunstein):** Cách bạn TRÌNH BÀY lựa chọn ảnh hưởng đến lựa chọn hơn cả nội dung. Cùng 1 sản phẩm, trình bày khác = conversion khác.\n\n` +
      `**4. Decoy Effect:** Variant 3-option của Choice Close. Khách so sánh tương đối, không tuyệt đối. Decoy (option tệ) làm option mục tiêu trông hời hơn.\n\n` +
      `⚠️ **CẢNH BÁO:** Dùng Assumptive khi khách CHƯA ready = ép khách = backlash. Đọc tín hiệu đúng: nếu khách lắc đầu/ngần ngừ → quay lại pitch, không chốt.`,
    examples:
      `**VÍ DỤ — BĐS (combo cả 3):**\n` +
      `B1 (Choice): "Anh quan tâm căn 2PN view hồ hay 3PN view công viên?"\n` +
      `B2 (tích lũy yes): khách nói 3PN, bạn xác nhận liên tục\n` +
      `B3 (Summary): "Anh muốn 3PN, view công viên, budget 5-6 tỷ, ưu tiên gần trường con — căn 1502 đáp ứng đủ. Anh thấy đúng không?"\n` +
      `B4 (Assumptive close): "Em chuẩn bị hồ sơ — anh muốn cọc 50tr hay 100tr giữ căn này hôm nay?"\n\n` +
      `**VÍ DỤ — Bảo hiểm:**\n` +
      `Sau khi tư vấn 30 phút, khách OK gói: "Em làm hồ sơ — anh muốn thụ hưởng là vợ hay con anh nhỉ?" (Assumptive)\n` +
      `→ Khách không hỏi "có nên mua không" — họ chọn người thụ hưởng = đã mua trong đầu.\n\n` +
      `**VÍ DỤ — Mỹ phẩm online:**\n` +
      `"Chị muốn full set 1.2tr hay set basic 600K trước rồi nâng cấp sau?"\n` +
      `→ 2 lựa chọn đều là mua. Decoy: thêm "set VIP 2.5tr" → khách chọn full set 1.2tr cảm thấy hợp lý.`,
    createdAt: NOW,
    expectedResult:
      'Tỷ lệ chốt tăng 30-50% vs câu "anh có mua không". Khách ít hối hận sau mua vì cảm thấy mình tự quyết định. Giảm "để em suy nghĩ thêm" xuống 60%.',
    templates: {
      zalo:
        `*Choice Close:*\n"Chào anh/chị! Em có 2 phương án phù hợp với case của anh/chị:\n- Phương án A: [X] — phù hợp nếu anh/chị ưu tiên [Y]\n- Phương án B: [X'] — phù hợp nếu anh/chị ưu tiên [Y']\nAnh/chị thấy phương án nào hợp hơn?"\n\n*Sau khi khách chọn:*\n"OK em chuẩn bị [phương án X]. Anh/chị muốn nhận trong hôm nay hay đầu tuần sau?" (Assumptive)`,
      facebook:
        `*Post (Decoy + Choice):*\n"3 gói chính:\n💼 Basic 99K — phù hợp cá nhân thử\n⭐ Pro 299K (popular) — phù hợp shop nhỏ\n👑 Enterprise 999K — phù hợp công ty\n\nBạn ở giai đoạn nào? Comment Basic/Pro/Enterprise để mình tư vấn cụ thể."`,
      direct:
        `*Summary + Assumptive Close:*\n"Để em tóm tắt: anh/chị muốn [A], cần [B], OK với mức [C]. Phương án em đề xuất khớp cả 3 điều đó. Vậy mình bắt đầu — anh/chị muốn em gửi hợp đồng qua email luôn hay anh/chị qua văn phòng ký trực tiếp?"`,
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'script-024',
    title: 'Reframe chi phí thành ROI — biến "đắt" thành "đầu tư"',
    industry: 'khac',
    situation: 'khach-che-dat',
    preview:
      'Khi khách chê đắt, đa số sales giảm giá hoặc giải thích tính năng — cả 2 đều thua. Cách đúng: thay đổi khung tham chiếu (frame). Không phải "5 triệu là CHI PHÍ" mà là "5 triệu là KHOẢN ĐẦU TƯ có ROI X". Khách không từ chối đầu tư có lãi — họ chỉ từ chối chi phí mơ hồ.',
    content:
      `**CÔNG THỨC REFRAME CHI PHÍ → ROI:**\n\n` +
      `Câu cốt lõi:\n` +
      `*"Anh/chị đang nhìn [X tr] như chi phí. Nhưng thực tế, đây là khoản đầu tư có ROI [Y]. Để em phân tích cụ thể..."*\n\n` +
      `**3 KIỂU ROI ĐỂ DÙNG:**\n\n` +
      `**ROI 1 — KIỂU TIỀN BẠC (Direct ROI)**\n` +
      `Tính ra tiền cụ thể khách sẽ kiếm được/tiết kiệm.\n\n` +
      `*"Khóa học 5tr này — sau khi áp dụng, anh chốt thêm 2 deal/tháng × 10tr commission = 20tr/tháng. Vậy 5tr này thu hồi vốn trong 7 ngày, lãi trong 12 tháng = 235tr."*\n\n` +
      `**ROI 2 — KIỂU THỜI GIAN (Time ROI)**\n` +
      `Tính thời gian tiết kiệm × giá trị giờ làm việc.\n\n` +
      `*"Phần mềm 3tr/năm — tiết kiệm 5 giờ/tuần × 52 tuần = 260 giờ. Giả sử giờ của anh trị giá 200K (lương + overhead) = 52tr/năm. ROI = 17x."*\n\n` +
      `**ROI 3 — KIỂU AVOID LOSS (Tránh thiệt hại)**\n` +
      `Tính khoản KHÔNG mua dịch vụ thì mất gì.\n\n` +
      `*"Bảo hiểm 12tr/năm — anh sợ tốn. Nhưng nếu không có nó và xảy ra rủi ro: viện phí trung bình 200-500tr cho 1 ca lớn. Anh đang chọn giữa 'tốn chắc 12tr' và 'có thể mất 500tr'. Mathematically, không mua mới là đắt."*\n\n` +
      `─────────────────────────\n\n` +
      `**KỸ THUẬT BẺ NHỎ CHI PHÍ (Cost Decomposition):**\n\n` +
      `Số to làm khách sợ. Số nhỏ làm khách dễ chấp nhận.\n\n` +
      `*"99K/tháng nghe to phải không anh? Tính ra:\n` +
      `- 99K/30 ngày = 3.300đ/ngày\n` +
      `- 3.300đ/ngày = bằng 1 ly trà đá vỉa hè\n` +
      `- 1 ly trà đá có giúp anh tăng doanh số không?\n` +
      `- Bộ kịch bản này, theo case của 200 anh chị khác, tăng doanh số trung bình 30-40%/tháng.\n` +
      `- Vậy 3.300đ/ngày để tăng 30% doanh số — anh có thấy hời không?"*\n\n` +
      `**Mẹo phân nhỏ:**\n` +
      `- Theo ngày (nếu giá tháng/năm)\n` +
      `- Theo giờ (cho dịch vụ tính giờ)\n` +
      `- Theo case/transaction (cho B2B)\n` +
      `- So sánh với chi tiêu phổ thông (cà phê, trà đá, ăn sáng)\n\n` +
      `─────────────────────────\n\n` +
      `**4 BƯỚC KHI KHÁCH NÓI "ĐẮT":**\n\n` +
      `**Bước 1 — Acknowledge (Đồng cảm)**\n` +
      `*"Dạ, em hiểu — đây là khoản đầu tư cần cân nhắc kỹ."*\n` +
      `KHÔNG nói "Không đắt đâu anh!" — phản tác dụng.\n\n` +
      `**Bước 2 — Reframe (Thay khung)**\n` +
      `*"Anh đang nhìn theo chi phí, nhưng em xin được nhìn theo góc đầu tư..."*\n\n` +
      `**Bước 3 — Quantify (Tính cụ thể)**\n` +
      `*"Cụ thể với case anh, em tính: [con số ROI]..."*\n\n` +
      `**Bước 4 — Confirm (Xác nhận)**\n` +
      `*"Nhìn theo cách này, anh thấy đáng đầu tư không?"*\n` +
      `→ Khách thường gật đầu vì đã hiểu giá trị.`,
    psychology:
      `**TÂM LÝ HỌC ĐẰNG SAU:**\n\n` +
      `**1. Framing Effect (Kahneman & Tversky):** Cùng 1 sự thật, khung khác → quyết định khác. "Mất 200 triệu nếu không bảo hiểm" mạnh hơn "Có 99.6% khả năng không cần bảo hiểm" — dù cùng nội dung.\n\n` +
      `**2. Mental Accounting (Thaler):** Não chia tiền thành "ngăn" khác nhau. Tiền "chi phí" và tiền "đầu tư" trong não là 2 ngăn khác nhau — dù cùng từ tài khoản. Reframe = chuyển từ ngăn "chi phí" sang "đầu tư".\n\n` +
      `**3. Loss Aversion:** Mất 1tr đau gấp 2 lần được 1tr. Frame "tránh mất" mạnh hơn "có thêm". Dùng ROI #3 (avoid loss) cho khách risk-averse.\n\n` +
      `**4. Anchor & Adjust:** Số đầu tiên khách nghe sẽ anchor mọi suy nghĩ tiếp theo. Nếu bắt đầu bằng "99K/tháng" → khách anchor số 99K. Nếu bắt đầu bằng "3.300đ/ngày" → khách anchor số 3.300đ.\n\n` +
      `⚠️ **CẢNH BÁO:** ROI phải REALISTIC + có data thật. Bịa số sẽ bị phát hiện trong vòng 1-2 tháng = brand damage.`,
    examples:
      `**VÍ DỤ — BĐS (Reframe + Decompose):**\n\n` +
      `Khách: "5 tỷ căn này đắt quá!"\n` +
      `Bạn: "Dạ em hiểu — 5 tỷ là khoản lớn. Nhưng em xin được phân tích theo góc đầu tư:\n` +
      `- 5 tỷ / 30 năm sở hữu = 167tr/năm = 14tr/tháng\n` +
      `- So với thuê căn tương tự khu này: ~20tr/tháng = mất 240tr/năm không có gì\n` +
      `- Vậy mỗi tháng tiết kiệm 6tr (so với thuê) + tăng giá BĐS trung bình 10%/năm\n` +
      `- 10 năm nữa, giá trị căn này estimated ~13 tỷ → lãi 8 tỷ vốn (chưa kể tiết kiệm tiền thuê)\n` +
      `- Đây là một trong những kênh đầu tư an toàn nhất ở VN.\n` +
      `Anh nhìn theo cách này, vẫn thấy đắt không?"\n\n` +
      `**VÍ DỤ — Bảo hiểm (Avoid Loss):**\n\n` +
      `Khách: "12tr/năm đắt quá, em không cần"\n` +
      `Bạn: "Dạ — 12tr/năm = 1tr/tháng = 33K/ngày. So với:\n` +
      `- 1 lần khám sức khỏe tổng quát: 5-8tr\n` +
      `- 1 case nhập viện sốt xuất huyết: 30-50tr\n` +
      `- 1 ca điều trị ung thư: 500tr - 2 tỷ\n` +
      `Anh đang đặt cược: 'chắc chắn không gặp gì' với xác suất ~99% (theo data WHO). Mua bảo hiểm = trả phí cho 1% rủi ro. Đó là toán học bảo vệ — không phải chi phí lãng phí."\n\n` +
      `**VÍ DỤ — Khóa học (Time ROI):**\n\n` +
      `Khách: "Khóa 5tr cho 30 ngày học đắt"\n` +
      `Bạn: "Em đồng ý không phải nhỏ. Nhưng em tính cho chị: hiện chị mất 5h/tuần cho việc bán hàng không hiệu quả (theo case study). Sau khóa, chị save 5h/tuần × 4 tuần = 20h/tháng. Giá trị 1h của chị giả sử 300K (vì chị có thể dùng để chốt thêm khách) = 6tr/tháng. ROI 1 tháng đã hơn 100%. 12 tháng = 72tr quy đổi giá trị. 5tr đầu tư cho 72tr/năm — chị thấy hợp lý không?"`,
    createdAt: NOW,
    expectedResult:
      'Khách chuyển từ "đắt" sang "đáng đầu tư". Giảm yêu cầu giảm giá xuống 70%. Khách close ở giá full thay vì discount.',
    templates: {
      zalo:
        `*Khi khách nhắn "đắt quá":*\n"Dạ em hiểu, [X tr] không phải số nhỏ. Em xin phân tích theo góc đầu tư:\n- Anh/chị sẽ tiết kiệm/kiếm thêm: [số cụ thể]/tháng\n- Quy đổi: [X tr] sẽ thu hồi vốn trong [N] tháng\n- Sau 12 tháng: lãi [Y tr]\n\nNhìn cách này, anh/chị thấy còn đắt không ạ?"`,
      facebook:
        `*Post xử lý objection "đắt":*\n"99K/tháng — nghe to phải không?\n\nTính ra: 3.300đ/ngày — bằng 1 ly trà đá. \nHọc viên trung bình tăng doanh số 35% sau 60 ngày.\nROI: 3.300đ → tạo ra hàng triệu mỗi tháng.\n\nĐắt hay rẻ? Comment quan điểm của bạn 👇"`,
      direct:
        `*Trong cuộc gặp, khi khách chê đắt:*\n"Anh/chị có thể cho em 3 phút phân tích cụ thể không? Em không muốn anh/chị trả tiền cho cái 'đắt' — em muốn anh/chị đầu tư vào cái có ROI rõ ràng. Em tính cho anh/chị: [chi tiết ROI]. Nếu sau khi nghe vẫn thấy không đáng, em chấp nhận không bán."`,
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'script-025',
    title: 'BĐS — Quy trình chốt cọc 3 bước khi khách còn phân vân',
    industry: 'bds',
    situation: 'chot-sale',
    preview:
      'Đặc thù BĐS: deal lớn → khách phân vân lâu → mất deal vào tay đối thủ. Sales BĐS pro có 1 quy trình chốt cọc 3 bước. Khác biệt giữa "deal vĩnh viễn" và "deal mất" thường là khả năng đề nghị cọc đúng thời điểm — không sớm quá (khách sợ), không muộn quá (khách suy nghĩ lại rồi đi).',
    content:
      `**QUY TRÌNH CHỐT CỌC 3 BƯỚC:**\n\n` +
      `**BƯỚC 1 — TÓM TẮT LỢI ÍCH (Summary)**\n\n` +
      `Sau khi đi xem nhà / tư vấn xong, bạn TÓM TẮT lại những điều khách đã chốt:\n\n` +
      `*"Anh/chị, để em tóm tắt — căn này phù hợp với anh/chị vì:\n` +
      `1. Đúng view anh/chị thích (hồ/công viên/sông)\n` +
      `2. Tầng đúng (cao/thấp theo phong thủy)\n` +
      `3. Layout 3PN đáp ứng gia đình 4 người\n` +
      `4. Tiến độ giao nhà phù hợp timeline anh chị\n` +
      `5. Giá trong budget anh/chị đã xác định\n\n` +
      `Em có miss điểm nào không ạ?"*\n\n` +
      `→ Khách "đúng" → bạn đã củng cố 5 điểm tích cực. Chuyển bước 2.\n\n` +
      `─────────────────────────\n\n` +
      `**BƯỚC 2 — TẠO URGENCY THẬT (Real Scarcity)**\n\n` +
      `KHÔNG bịa "chỉ còn 1 căn" — khách nghe nhiều rồi, không tin.\n` +
      `Dùng URGENCY THẬT:\n\n` +
      `**a) Scarcity về căn cụ thể:**\n` +
      `*"Căn 1502 này anh đang xem là 1 trong 3 căn 3PN view công viên còn lại của block — 17 căn còn lại đã chốt. Em vừa kiểm tra hệ thống cách đây 30 phút."*\n` +
      `(Phải là sự thật — bạn check trước)\n\n` +
      `**b) Scarcity về chính sách:**\n` +
      `*"Chương trình tặng gói nội thất 200tr này chỉ áp dụng cho 50 hợp đồng đầu của block — hiện đã ký 47. Sau 3 hợp đồng nữa, gói này hết."*\n` +
      `(Phải là chính sách thật từ CĐT)\n\n` +
      `**c) Scarcity về thời điểm thị trường:**\n` +
      `*"Lãi suất 8% cố định 24 tháng đang ưu đãi từ ngân hàng — theo nguồn em, ngân hàng sẽ điều chỉnh tăng 0.5% từ tuần sau (cấp trên thông báo nội bộ). Sau đó, mỗi tháng anh trả thêm ~2-3tr trên 30 năm."*\n` +
      `(Phải có thông tin nội bộ thật, không bịa)\n\n` +
      `→ Khách feel urgency THẬT → chuyển bước 3.\n\n` +
      `─────────────────────────\n\n` +
      `**BƯỚC 3 — ĐỀ NGHỊ CỌC NHỎ GIỮ CHỖ (Small Deposit)**\n\n` +
      `Không yêu cầu thanh toán full đợt 1 ngay. Đề nghị CỌC NHỎ giữ chỗ:\n\n` +
      `*"Em đề xuất anh/chị: đặt cọc giữ chỗ 50tr hôm nay — refund 100% trong 7 ngày nếu anh/chị đổi ý. Trong 7 ngày, em hỗ trợ anh/chị:\n` +
      `- Xem lại hợp đồng kỹ với luật sư của anh/chị nếu cần\n` +
      `- Sắp xếp lịch xem lại 1 lần nữa cho gia đình\n` +
      `- Bàn về phương án vay\n\n` +
      `Vậy 50tr giữ chỗ này CHỈ là để chốt căn này không bị bán cho người khác trong 7 ngày anh/chị suy nghĩ kỹ — không phải cam kết mua. Anh/chị thấy hợp lý không?"*\n\n` +
      `**Tại sao 50tr cọc nhỏ hiệu quả:**\n` +
      `1. **50tr nghe nhỏ** so với giá căn (5 tỷ → cọc 50tr = 1%)\n` +
      `2. **Refund 7 ngày** = không có lý do từ chối\n` +
      `3. **Endowment Effect** — khi đã cọc, khách tâm lý đã "có" căn này → 7 ngày sau khả năng rất cao họ tiếp tục thay vì refund\n` +
      `4. **Sunk cost** + **Loss aversion** — cọc xong, mất 50tr (dù được refund) đau hơn đi tới quyết định mua\n\n` +
      `─────────────────────────\n\n` +
      `**CÁCH XỬ LÝ 3 PHẢN ỨNG THƯỜNG GẶP:**\n\n` +
      `**Phản ứng 1: "Để em về bàn với vợ/chồng"**\n` +
      `*"Hoàn toàn hiểu anh. Em đề nghị: anh cọc 50tr giữ chỗ hôm nay (refund 7 ngày). Anh về bàn — nếu cả 2 OK, mình ký HĐ. Nếu không OK, em refund full. Vậy anh có cọc bảo vệ căn này trong khi bàn không ạ?"*\n` +
      `→ Khách feel "không mất gì" mà bạn đã chốt được commitment.\n\n` +
      `**Phản ứng 2: "Để em suy nghĩ thêm vài ngày"**\n` +
      `*"Em hiểu. Nhưng anh ơi, có 2 anh chị khác cũng đang xem căn này hôm nay — em không thể giữ căn không cọc. Em đề xuất: cọc nhỏ 50tr trong 7 ngày để anh suy nghĩ kỹ — vẫn refund full nếu đổi ý. Vậy anh có thể bảo vệ căn trong 7 ngày suy nghĩ không?"*\n\n` +
      `**Phản ứng 3: "Anh chưa chuẩn bị tiền cọc"**\n` +
      `*"Dạ vâng, em hiểu. Anh có thể chuyển khoản qua app ngân hàng — em xin thông tin tài khoản của anh để hỗ trợ. Hoặc nếu anh cần thời gian, em có thể giữ căn 24h cho anh chuẩn bị — sau 24h em phải trả lại pool, có khách khác đang chờ."*`,
    psychology:
      `**TÂM LÝ HỌC ĐẰNG SAU:**\n\n` +
      `**1. Sunk Cost Fallacy:** Khi đã đầu tư (dù chỉ 1% giá), khách tâm lý cảm thấy "đã đến đây rồi". Refund 50tr dù được phép vẫn cảm thấy "phí" — vì đã dành thời gian quyết định.\n\n` +
      `**2. Endowment Effect (Thaler):** Người sở hữu vật gì sẽ định giá nó cao hơn người chưa sở hữu. Khi cọc rồi, căn nhà tâm lý đã "thuộc về" khách → từ bỏ đau gấp 2 lần.\n\n` +
      `**3. Commitment & Consistency (Cialdini):** Cọc = micro-commitment công khai (có giấy tờ). Não thúc đẩy hành vi nhất quán với cam kết → 7 ngày sau, khả năng tiếp tục cao.\n\n` +
      `**4. Loss Aversion:** "Mất căn nhà này cho người khác" đau hơn "có căn nhà". Real scarcity ở Bước 2 + cọc ở Bước 3 = đánh kép vào loss aversion.\n\n` +
      `**5. Choice Closure:** Sau khi đã chọn (kể cả tạm), não giảm cognitive dissonance bằng cách: tự thuyết phục lựa chọn đúng + ngừng so sánh các option khác. Khách ngừng nghĩ đến dự án khác.\n\n` +
      `⚠️ **CẢNH BÁO ĐẠO ĐỨC:** Bịa scarcity (không có người khác mua mà nói có) = lừa đảo. Sẽ bị phát hiện khi khách check chéo. Chỉ dùng scarcity THẬT — và thường có sẵn nếu bạn check kỹ trước.`,
    examples:
      `**VÍ DỤ ĐẦY ĐỦ — CĂN HỘ 4 TỶ:**\n\n` +
      `**Bước 1 — Summary:**\n` +
      `Em: "Anh chị Long & Hương, để em tóm tắt căn 1502 mình vừa xem:\n` +
      `1. View công viên (đúng cái chị Hương muốn)\n` +
      `2. Tầng 15 — không quá cao, không quá thấp (anh Long thích)\n` +
      `3. 3PN + 2WC, đủ cho gia đình 4 người + 1 phòng khách\n` +
      `4. Tiến độ giao nhà Q3/2026 — kịp khi con vào lớp 1\n` +
      `5. Giá 4.2 tỷ — trong budget mình đã trao đổi\n` +
      `Anh chị thấy có đúng không ạ?"\n` +
      `Anh Long: "Đúng rồi em."\n\n` +
      `**Bước 2 — Urgency thật:**\n` +
      `Em: "Em vừa check hệ thống cách đây 30 phút — căn 3PN view công viên chỉ còn 2 căn trong block A. Em vừa nghe team báo có 1 anh khách cũng đang quan tâm căn 1502 này, sẽ xem chiều mai. Bên cạnh đó, chính sách tặng gói nội thất 250tr chỉ áp dụng 50 hợp đồng đầu — hiện đã ký 46, còn 4 slot."\n\n` +
      `**Bước 3 — Cọc nhỏ:**\n` +
      `Em: "Em đề xuất anh chị thế này: đặt cọc giữ chỗ 50tr hôm nay — em ghi rõ trong phiếu: 'refund 100% trong 7 ngày nếu khách hàng đổi ý'. Trong 7 ngày này, anh chị có thể:\n` +
      `- Đọc lại hợp đồng kỹ\n` +
      `- Em hẹn anh chị thêm 1 buổi xem lại với cả gia đình ngày cuối tuần\n` +
      `- Bàn với luật sư hoặc người tư vấn tài chính\n` +
      `\n` +
      `50tr này KHÔNG phải cam kết mua — chỉ là giữ chỗ trong 7 ngày để anh chị suy nghĩ kỹ mà không sợ mất căn. Vậy anh chị có muốn em làm thủ tục cọc giữ chỗ ngay bây giờ không ạ?"\n` +
      `\n` +
      `→ 80% case, khách OK cọc. Sau 7 ngày, ~85% tiếp tục → close deal.`,
    createdAt: NOW,
    expectedResult:
      'Tỷ lệ chốt cọc tăng 60-80% so với close trực tiếp. 85% khách đã cọc → tiếp tục mua sau 7 ngày. Giảm "deal mất vì khách suy nghĩ rồi đi" xuống 50%.',
    templates: {
      zalo:
        `*Sau buổi xem nhà:*\n"Anh/chị, em vừa check lại hệ thống — căn 1502 còn 2 căn cùng layout này. Em đề xuất giữ chỗ 50tr hôm nay (refund full 7 ngày nếu đổi ý). Trong 7 ngày anh/chị suy nghĩ kỹ, em làm việc tiếp với CĐT để giữ chính sách tốt nhất. Anh/chị muốn em gửi STK CĐT để chuyển luôn không?"`,
      facebook:
        `(Ít dùng FB cho BĐS chốt cọc — chủ yếu Zalo/direct)\n*Có thể dùng cho remarketing:*\n"Các anh chị đã xem căn hộ block A — em báo nhanh: chỉ còn 2 căn 3PN view công viên + chính sách quà tặng nội thất 250tr sắp hết (còn 4/50 slot). Anh chị nào quan tâm DM em chốt cọc giữ chỗ trong tuần này."`,
      direct:
        `*Tại văn phòng/showroom:*\n[Sau khi đi xem căn]\n"Anh/chị Long & Hương ngồi đây, em làm thủ tục giữ chỗ luôn nhé. Em chuẩn bị phiếu cọc 50tr — refund 100% trong 7 ngày, có đóng dấu CĐT. Trong 7 ngày này, em sẽ:\n1. Gửi anh chị toàn bộ hợp đồng để xem kỹ\n2. Sắp xếp lịch xem lại cho cả gia đình\n3. Hỗ trợ liên hệ ngân hàng nếu cần vay\n\nVậy mình bắt đầu thủ tục — anh/chị chuyển khoản hay nộp tiền mặt ạ?"`,
    },
  },
]

// ─────────────────────────────────────────────────────────────
// FIX duplicates: re-assign roadmap để dùng 3 scripts mới

const ROADMAP_FIXES = {
  6: 'script-023',   // Ngày 6 → 3 kỹ thuật chốt không áp lực
  9: 'script-024',   // Ngày 9 → Reframe chi phí thành ROI
  22: 'script-025',  // Ngày 22 → BĐS chốt cọc 3 bước
}

// ─────────────────────────────────────────────────────────────
const scripts = JSON.parse(fs.readFileSync(SCRIPTS_PATH, 'utf-8'))
const roadmap = JSON.parse(fs.readFileSync(ROADMAP_PATH, 'utf-8'))

console.log('▶ Hiện tại:', scripts.length, 'scripts,', roadmap.flatMap(w => w.days).length, 'ngày roadmap')

// 1) Add new scripts
const existingIds = new Set(scripts.map(s => s.id))
let added = 0
for (const ns of NEW_SCRIPTS) {
  if (existingIds.has(ns.id)) {
    console.log('  ⚠️ Bỏ qua:', ns.id, '(đã tồn tại)')
    continue
  }
  scripts.push(ns)
  added++
  console.log('  ✅ Thêm:', ns.id, '|', ns.title)
}
scripts.sort((a, b) => a.id.localeCompare(b.id))

// 2) Re-assign roadmap
let fixed = 0
for (const week of roadmap) {
  for (const day of week.days) {
    if (ROADMAP_FIXES[day.day]) {
      const oldId = day.scriptId
      day.scriptId = ROADMAP_FIXES[day.day]
      fixed++
      console.log('  🔧 Ngày', day.day, ':', oldId, '→', day.scriptId)
    }
  }
}

fs.writeFileSync(SCRIPTS_PATH, JSON.stringify(scripts, null, 2) + '\n')
fs.writeFileSync(ROADMAP_PATH, JSON.stringify(roadmap, null, 2) + '\n')

console.log()
console.log('✅ Đã thêm', added, 'scripts mới')
console.log('✅ Đã fix', fixed, 'scriptId trong roadmap')

// Final verification
const allDays = roadmap.flatMap(w => w.days)
const counts = {}
for (const d of allDays) {
  if (!d.scriptId) continue
  counts[d.scriptId] = (counts[d.scriptId] || 0) + 1
}
const dups = Object.entries(counts).filter(([_, c]) => c > 1)
if (dups.length === 0) {
  console.log('✅ FINAL: KHÔNG còn duplicate scriptId nào!')
} else {
  console.log('⚠️ FINAL: vẫn còn', dups)
}

const scriptIds = new Set(scripts.map(s => s.id))
const missing = allDays.filter(d => d.scriptId && !scriptIds.has(d.scriptId))
console.log(missing.length === 0
  ? '✅ FINAL: tất cả scriptId trong roadmap đều tồn tại trong scripts.json'
  : '⚠️ FINAL: còn thiếu ' + missing.length + ' scripts')

console.log()
console.log('TỔNG KẾT:')
console.log('- Scripts trong DB:', scripts.length)
console.log('- Ngày trong roadmap:', allDays.length)
console.log('- Ngày có scriptId:', allDays.filter(d => d.scriptId).length)
console.log('- Ngày null (ôn tập):', allDays.filter(d => !d.scriptId).length)
