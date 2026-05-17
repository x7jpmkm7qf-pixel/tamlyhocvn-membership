/**
 * Generate "Tàng Kinh Các Nội Môn — Tuyển Tập" PDF from data/scripts.json
 *
 * Usage: node scripts/generate-noimon-pdf.mjs
 * Output: public/files/Tang-Kinh-Cac-Noi-Mon-Tuyen-Tap.pdf
 *
 * Public URL after deploy: https://www.tamlyhocvn.club/files/Tang-Kinh-Cac-Noi-Mon-Tuyen-Tap.pdf
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SCRIPTS_JSON = path.join(ROOT, 'data', 'scripts.json')
const OUT_DIR = path.join(ROOT, 'public', 'files')
const OUT_FILE = path.join(OUT_DIR, 'Tang-Kinh-Cac-Noi-Mon-Tuyen-Tap.pdf')

const INDUSTRY_LABELS = {
  bds: 'Bất Động Sản',
  'bao-hiem': 'Bảo Hiểm',
  'my-pham': 'Mỹ Phẩm',
  fb: 'F&B',
  khac: 'Đa Ngành',
}

const INDUSTRY_ORDER = ['bds', 'bao-hiem', 'my-pham', 'fb', 'khac']

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Convert simple markdown-ish text (**, \n) → HTML.
function mdToHtml(text = '') {
  const esc = escapeHtml(text)
  // **bold**
  const bolded = esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Split into blocks by double newline; otherwise single \n → <br>.
  const blocks = bolded.split(/\n\n+/).map(b => b.trim()).filter(Boolean)
  return blocks.map(b => {
    if (/^---+$/.test(b)) return '<hr class="divider">'
    if (/^[-•]\s/.test(b)) {
      const items = b.split(/\n[-•]\s/).map(s => s.replace(/^[-•]\s/, '').trim())
      return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`
    }
    return `<p>${b.replace(/\n/g, '<br>')}</p>`
  }).join('\n')
}

function groupByIndustry(scripts) {
  const groups = {}
  for (const ind of INDUSTRY_ORDER) groups[ind] = []
  for (const s of scripts) {
    const key = INDUSTRY_ORDER.includes(s.industry) ? s.industry : 'khac'
    groups[key].push(s)
  }
  return groups
}

function buildToc(groups) {
  const rows = []
  let idx = 1
  for (const ind of INDUSTRY_ORDER) {
    const list = groups[ind]
    if (!list.length) continue
    rows.push(`<div class="toc-section"><div class="toc-industry">${INDUSTRY_LABELS[ind]} <span class="toc-count">(${list.length} kịch bản)</span></div>`)
    for (const s of list) {
      rows.push(`<div class="toc-item"><span class="toc-num">${String(idx).padStart(2, '0')}</span><span class="toc-title">${escapeHtml(s.title)}</span></div>`)
      idx++
    }
    rows.push(`</div>`)
  }
  return rows.join('\n')
}

function buildScriptPage(script, num, total) {
  const industryLabel = INDUSTRY_LABELS[script.industry] || INDUSTRY_LABELS.khac
  const templates = script.templates || {}
  return `
<section class="page script-page">
  <div class="script-header">
    <div class="script-meta">
      <span class="script-num">Kịch bản ${String(num).padStart(2, '0')} / ${total}</span>
      <span class="script-industry">${industryLabel}</span>
    </div>
    <h2 class="script-title">${escapeHtml(script.title)}</h2>
    <p class="script-preview">${escapeHtml(script.preview || '')}</p>
  </div>

  <div class="script-section">
    <div class="section-label">⚜️ Kịch bản đối thoại</div>
    <div class="section-body">${mdToHtml(script.content || '')}</div>
  </div>

  ${script.psychology ? `
  <div class="script-section">
    <div class="section-label">🧠 Tâm pháp đằng sau</div>
    <div class="section-body">${mdToHtml(script.psychology)}</div>
  </div>` : ''}

  ${script.examples ? `
  <div class="script-section">
    <div class="section-label">📖 Ví dụ áp dụng</div>
    <div class="section-body">${mdToHtml(script.examples)}</div>
  </div>` : ''}

  ${(templates.zalo || templates.facebook || templates.direct) ? `
  <div class="script-section template-section">
    <div class="section-label">📋 Mẫu câu sẵn dùng</div>
    ${templates.zalo ? `<div class="template-block"><div class="template-tag zalo">Zalo</div><div class="template-text">${escapeHtml(templates.zalo)}</div></div>` : ''}
    ${templates.facebook ? `<div class="template-block"><div class="template-tag fb">Facebook</div><div class="template-text">${escapeHtml(templates.facebook)}</div></div>` : ''}
    ${templates.direct ? `<div class="template-block"><div class="template-tag direct">Trực tiếp</div><div class="template-text">${escapeHtml(templates.direct)}</div></div>` : ''}
  </div>` : ''}

  ${script.expectedResult ? `
  <div class="expected-result">
    <div class="er-label">🎯 Kết quả kỳ vọng</div>
    <div class="er-body">${escapeHtml(script.expectedResult)}</div>
  </div>` : ''}
</section>`
}

function buildHtml(scripts) {
  const total = scripts.length
  const groups = groupByIndustry(scripts)
  let idx = 1
  const pages = []
  for (const ind of INDUSTRY_ORDER) {
    for (const s of groups[ind]) {
      pages.push(buildScriptPage(s, idx, total))
      idx++
    }
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Serif:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: 'Be Vietnam Pro', system-ui, sans-serif; color: #2d1a10; line-height: 1.6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  h1, h2, h3, h4 { font-family: 'Noto Serif', Georgia, serif; margin: 0; line-height: 1.2; }
  p { margin: 0 0 0.6em; }
  ul { margin: 0 0 0.6em; padding-left: 22px; }
  li { margin-bottom: 4px; }
  strong { color: #5d2418; font-weight: 700; }
  hr.divider { border: none; height: 1px; background: linear-gradient(90deg, transparent, #d4b894, transparent); margin: 14px 0; }

  .page { padding: 36px 42px; min-height: 100vh; page-break-after: always; background: #fdf6e8; position: relative; }
  .page:last-child { page-break-after: auto; }

  /* ===== COVER PAGE ===== */
  .cover {
    background: linear-gradient(135deg, #0a0908 0%, #1c1917 50%, #5d2418 100%);
    color: #fdf6e8;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center;
    padding: 60px 50px;
  }
  .cover-logo { font-size: 80px; margin-bottom: 16px; }
  .cover-stamp {
    border: 3px solid #d4af37; color: #d4af37; padding: 8px 24px;
    font-family: 'Noto Serif', serif; font-weight: 700; letter-spacing: 4px;
    font-size: 13px; margin-bottom: 32px; display: inline-block;
    transform: rotate(-2deg);
  }
  .cover-title {
    font-size: 48px; font-weight: 800; color: #d4af37;
    text-shadow: 0 2px 20px rgba(212, 175, 55, 0.4);
    margin-bottom: 8px;
  }
  .cover-subtitle {
    font-family: 'Noto Serif', serif; font-size: 22px; color: #f5ead2;
    font-style: italic; margin-bottom: 48px;
  }
  .cover-deco { color: #d4af37; font-size: 32px; letter-spacing: 8px; margin-bottom: 48px; opacity: 0.6; }
  .cover-author {
    margin-top: auto; padding-top: 60px;
    font-family: 'Noto Serif', serif; color: #f5ead2;
  }
  .cover-author-name { font-size: 18px; font-weight: 700; color: #d4af37; }
  .cover-author-site { font-size: 13px; color: #f5ead2; opacity: 0.7; letter-spacing: 2px; margin-top: 4px; }
  .cover-version {
    position: absolute; bottom: 24px; left: 0; right: 0;
    text-align: center; font-size: 11px; color: #f5ead2; opacity: 0.5; letter-spacing: 2px;
  }

  /* ===== INTRO PAGE ===== */
  .intro-page h1 {
    font-size: 30px; color: #5d2418; margin-bottom: 8px;
  }
  .intro-page .intro-stamp {
    display: inline-block; background: #5d2418; color: #fdf6e8;
    font-size: 11px; letter-spacing: 3px; padding: 4px 14px; margin-bottom: 24px;
    font-weight: 700;
  }
  .intro-page .intro-body {
    font-size: 14px; line-height: 1.8; color: #3d1f15;
    max-width: 560px;
  }
  .intro-page .intro-body p { margin-bottom: 14px; }
  .intro-page .intro-pillars {
    background: #fff8eb; border-left: 4px solid #c8941a;
    padding: 18px 20px; margin: 24px 0;
  }
  .intro-page .pillar { margin-bottom: 12px; }
  .intro-page .pillar:last-child { margin-bottom: 0; }
  .intro-page .pillar-title { font-weight: 700; color: #5d2418; font-size: 14px; }
  .intro-page .pillar-body { font-size: 13px; color: #3d1f15; }

  /* ===== TOC PAGE ===== */
  .toc-page h1 {
    font-size: 28px; color: #5d2418; margin-bottom: 24px;
    border-bottom: 2px solid #d4b894; padding-bottom: 10px;
  }
  .toc-section { margin-bottom: 20px; }
  .toc-industry {
    background: #5d2418; color: #fdf6e8;
    padding: 6px 14px; font-weight: 700; font-size: 13px;
    letter-spacing: 1px; margin-bottom: 8px;
  }
  .toc-count { font-weight: 400; opacity: 0.75; font-size: 11px; }
  .toc-item {
    display: flex; gap: 12px; padding: 6px 14px;
    border-bottom: 1px dotted #d4b894; font-size: 13px;
  }
  .toc-num { color: #c8941a; font-weight: 700; min-width: 28px; font-family: 'Noto Serif', serif; }
  .toc-title { flex: 1; color: #3d1f15; }

  /* ===== SCRIPT PAGE ===== */
  .script-page { font-size: 12.5px; }
  .script-header { border-bottom: 2px solid #d4b894; padding-bottom: 12px; margin-bottom: 18px; }
  .script-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .script-num {
    font-family: 'Noto Serif', serif; font-size: 11px; color: #8b6a3a;
    letter-spacing: 2px; font-weight: 700;
  }
  .script-industry {
    background: #c8941a; color: #fdf6e8;
    font-size: 10px; padding: 2px 10px; letter-spacing: 1px; font-weight: 700;
  }
  .script-title {
    font-size: 22px; font-weight: 700; color: #5d2418;
    margin: 6px 0 8px;
  }
  .script-preview {
    font-size: 12px; color: #6b3a20; font-style: italic;
    line-height: 1.5;
  }

  .script-section { margin-bottom: 16px; }
  .section-label {
    background: linear-gradient(90deg, #5d2418, #8b3a1c);
    color: #fdf6e8; font-weight: 700; font-size: 11px;
    padding: 5px 12px; letter-spacing: 1.5px;
    margin-bottom: 8px;
  }
  .section-body { font-size: 12px; line-height: 1.7; color: #3d1f15; padding: 0 4px; }
  .section-body p { margin-bottom: 6px; }
  .section-body ul { margin-bottom: 6px; }

  .template-section { background: #fff8eb; padding: 12px 14px; border: 1px solid #d4b894; }
  .template-block { display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start; }
  .template-block:last-child { margin-bottom: 0; }
  .template-tag {
    font-size: 9px; font-weight: 700; letter-spacing: 1px;
    padding: 3px 8px; color: #fdf6e8;
    min-width: 70px; text-align: center;
    white-space: nowrap;
  }
  .template-tag.zalo { background: #0084ff; }
  .template-tag.fb { background: #1877f2; }
  .template-tag.direct { background: #5d2418; }
  .template-text { font-size: 11.5px; color: #3d1f15; line-height: 1.55; flex: 1; }

  .expected-result {
    background: #f3e9d2; border-left: 3px solid #c8941a;
    padding: 10px 14px; margin-top: 14px;
  }
  .er-label { font-size: 10px; font-weight: 700; color: #5d2418; letter-spacing: 1.5px; margin-bottom: 4px; }
  .er-body { font-size: 11.5px; color: #3d1f15; line-height: 1.55; }

  /* ===== OUTRO / END PAGE ===== */
  .outro {
    background: linear-gradient(135deg, #1c1917, #5d2418);
    color: #fdf6e8;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; padding: 60px 50px;
  }
  .outro-emoji { font-size: 64px; margin-bottom: 16px; }
  .outro-title {
    font-family: 'Noto Serif', serif; font-size: 32px; font-weight: 700;
    color: #d4af37; margin-bottom: 16px;
  }
  .outro-body {
    font-size: 15px; line-height: 1.8; max-width: 480px; color: #f5ead2;
    margin-bottom: 24px;
  }
  .outro-quote {
    font-family: 'Noto Serif', serif; font-style: italic; font-size: 16px;
    color: #d4af37; margin: 32px 0; max-width: 460px;
  }
  .outro-cta {
    display: inline-block; background: #d4af37; color: #1c1917;
    padding: 12px 28px; font-weight: 700; font-size: 14px;
    margin-top: 16px; letter-spacing: 1px;
  }
  .outro-contact { margin-top: 40px; font-size: 13px; color: #f5ead2; opacity: 0.85; line-height: 1.7; }
</style>
</head>
<body>

<!-- ===== COVER PAGE ===== -->
<section class="page cover">
  <div class="cover-logo">🏯</div>
  <div class="cover-stamp">⚜️ TÀNG KINH CÁC ⚜️</div>
  <h1 class="cover-title">NỘI MÔN</h1>
  <div class="cover-subtitle">Tuyển Tập Kịch Bản Sales</div>
  <div class="cover-deco">⚔ · ⚔ · ⚔</div>
  <div style="font-size: 16px; color: #f5ead2; opacity: 0.8; max-width: 380px;">
    ${total} kịch bản chốt deal — câu mẫu sẵn dùng, nguyên lý tâm pháp, ví dụ thực chiến.
  </div>
  <div class="cover-author">
    <div class="cover-author-name">— Hán Văn Sơn —</div>
    <div class="cover-author-site">TAMLYHOCVN.CLUB</div>
  </div>
  <div class="cover-version">Phiên bản ${new Date().toISOString().slice(0, 7)} · Dành riêng cho đệ tử Nội Môn</div>
</section>

<!-- ===== INTRO PAGE ===== -->
<section class="page intro-page">
  <div class="intro-stamp">⚜️ LỜI MỞ ĐẦU</div>
  <h1>Sư huynh đã chính thức nhập Nội Môn</h1>
  <div class="intro-body">
    <p>Tiểu đệ Sơn đây. Cảm tạ sư huynh đã đặt niềm tin vào Tàng Kinh Các Nội Môn.</p>

    <p>Cuốn này là <strong>Tuyển Tập ${total} kịch bản chốt deal</strong> mà tiểu đệ và các cao thủ đã đúc kết từ thực chiến — mỗi kịch bản có 4 phần:</p>

    <div class="intro-pillars">
      <div class="pillar">
        <div class="pillar-title">⚜️ Kịch bản đối thoại</div>
        <div class="pillar-body">Câu mẫu sẵn dùng — copy-paste vào Zalo/cuộc gọi được ngay.</div>
      </div>
      <div class="pillar">
        <div class="pillar-title">🧠 Tâm pháp đằng sau</div>
        <div class="pillar-body">Nguyên lý tâm lý học giúp sư huynh tự biến tấu, không phải đọc thuộc lòng.</div>
      </div>
      <div class="pillar">
        <div class="pillar-title">📖 Ví dụ áp dụng thực chiến</div>
        <div class="pillar-body">Tình huống cụ thể, lịch follow-up, cách dùng cho từng kênh.</div>
      </div>
      <div class="pillar">
        <div class="pillar-title">📋 Mẫu câu sẵn dùng</div>
        <div class="pillar-body">Mỗi kịch bản có sẵn 3 biến thể: Zalo · Facebook · Trực tiếp.</div>
      </div>
    </div>

    <p><strong>Cách dùng tiểu đệ đề xuất:</strong> mỗi tuần chọn 1-2 kịch bản phù hợp tình huống đang gặp, dán cheatsheet bên bàn làm việc, áp dụng trong 5-10 cuộc thật, ghi lại câu nào hiệu quả → chỉnh thành phiên bản riêng.</p>

    <p>Trong nhóm Zalo Nội Môn, sư huynh có thể <strong>nộp case ngành riêng</strong> — tiểu đệ + cao thủ sẽ viết kịch bản tuỳ biến. Đó mới là phần giá trị nhất của Nội Môn — kịch bản tuỳ biến cá nhân, không phải 1 cuốn sách cứng nhắc.</p>
  </div>
</section>

<!-- ===== TOC ===== -->
<section class="page toc-page">
  <h1>Mục Lục — ${total} Kịch Bản</h1>
  ${buildToc(groups)}
</section>

<!-- ===== SCRIPT PAGES ===== -->
${pages.join('\n')}

<!-- ===== OUTRO ===== -->
<section class="page outro">
  <div class="outro-emoji">🗡️</div>
  <h2 class="outro-title">Tu luyện tiếp tục</h2>
  <div class="outro-body">
    Sư huynh đã đọc hết Tuyển Tập. Nhưng nhớ: <strong style="color:#d4af37;">đọc 100 lần không bằng dùng 1 lần.</strong>
    <br><br>
    Mỗi tháng tiểu đệ cập nhật <strong style="color:#d4af37;">10 kịch bản mới</strong> + 1 buổi Live "Mổ Xẻ Deal" — lịch báo trong nhóm Zalo Nội Môn.
  </div>
  <div class="outro-quote">
    "Đệ tử ngoại môn học chiêu.<br>Đệ tử thân truyền học tâm."
  </div>
  <div class="outro-contact">
    📱 Zalo: 0961 588 227 — Hán Văn Sơn<br>
    🌐 tamlyhocvn.club/library
  </div>
</section>

</body>
</html>`
}

async function main() {
  console.log('[noimon-pdf] Reading scripts.json...')
  const scriptsRaw = await fs.readFile(SCRIPTS_JSON, 'utf8')
  const scripts = JSON.parse(scriptsRaw)
  console.log(`[noimon-pdf] Loaded ${scripts.length} scripts.`)

  await fs.mkdir(OUT_DIR, { recursive: true })

  const html = buildHtml(scripts)

  console.log('[noimon-pdf] Launching puppeteer...')
  const browser = await puppeteer.launch({ headless: 'new' })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    // Give web fonts time to load.
    await page.evaluateHandle('document.fonts.ready')

    console.log('[noimon-pdf] Rendering PDF...')
    await page.pdf({
      path: OUT_FILE,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    })
  } finally {
    await browser.close()
  }

  const stat = await fs.stat(OUT_FILE)
  console.log(`[noimon-pdf] ✅ Done. Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`[noimon-pdf] Output: ${OUT_FILE}`)
  console.log(`[noimon-pdf] Public URL after deploy: https://www.tamlyhocvn.club/files/Tang-Kinh-Cac-Noi-Mon-Tuyen-Tap.pdf`)
}

main().catch(err => {
  console.error('[noimon-pdf] Failed:', err)
  process.exit(1)
})
