# Báo Cáo Sáng Mai — Phase 2 Hoàn Thành

**Ngày:** 2026-05-18 | **Staging:** https://project-tqzek-e2xmwb2mw-hanvansonvanlanguni-9517s-projects.vercel.app

---

## ✅ Đã Làm (Phase 2 — Autonomous)

### 1. Content Reader — Khẩu Quyết JSON
File: `data/courses/khau-quyet.json`
- **12 chương** chắt lọc từ PDF `KHAU-QUYET-TOAN-TAP.pdf`
- **ch-00** (Lời Tựa + Framework L-H-Đ-Q): `preview: true` — ai cũng đọc được
- **ch-01 → ch-10** (10 khẩu quyết): `preview: false` — chỉ user đã mua
- **ch-11** (Cheatsheet + Lời Kết): `preview: false`
- Mỗi chương có: Tâm Pháp → Chiêu Thức (3 bản) → Biến Thể → Ví Dụ Thực Chiến (dialogue)
- HTML đồng nhất với style `ban-do.json` (tkc-script-box, tkc-insight-box, tkc-quote, tkc-table)

### 2. Paywall Logic
File: `app/tang-kinh-cac/(protected)/khoa-hoc/[slug]/[chapter]/page.tsx`
- Nếu `chapter.preview === false` và `course.price > 0` → fetch `getMember()` → check `member.enrollments['khau-quyet']?.status === 'active'`
- Nếu chưa mua → render paywall UI (lock icon + danh sách benefits + "Mua ngay 199.000đ →")
- "← Đọc lời tựa miễn phí" link dẫn về ch-00

### 3. Dashboard Fix
File: `app/tang-kinh-cac/(protected)/dashboard/page.tsx`
- Fetch `getMember()` trong dashboard
- Nếu `member.enrollments['khau-quyet']?.status === 'active'` → add KQ vào enrolled courses list (dù chưa có TKC enrollment)
- **Upsell card ẩn** khi user đã mua KQ — không còn "nút không làm gì"
- Progress = 0% nếu chưa vào reader lần đầu (đúng behavior)

### 4. Checkout Redirect
File: `app/tang-kinh-cac/(protected)/checkout/TKCCheckoutClient.tsx`
- Sau thanh toán thành công → redirect `/tang-kinh-cac/khoa-hoc/khau-quyet` (reader, không phải dashboard)
- Success message: "Khẩu Quyết đã kích hoạt. Đang chuyển vào Tàng Kinh Các..." (bỏ "gửi email")
- "Bắt đầu đọc ngay →" link đến reader

### 5. Auto-Enroll Fix
File: `app/tang-kinh-cac/(protected)/khoa-hoc/[slug]/page.tsx`
- Bỏ điều kiện `price === 0` — auto-enroll TKC progress tracking cho MỌI course
- Paywall enforce tại chapter level, không tại enrollment level

### 6. CourseContent Type
File: `lib/courses.ts`
- Thêm `preview?: boolean` vào `CourseContent` interface

### 7. Seed Script
File: `scripts/seed-khau-quyet.mjs`
- Copy từ `seed-ban-do.mjs`, thêm log về preview vs paid chapters
- **Cần chạy thủ công** với Production env để KQ course xuất hiện trong Redis

### 8. Git Commit
```
f37804a feat(tang-kinh-cac): Phase 2 — Khẩu Quyết content reader + paywall
```
19 files changed, 1171 insertions(+), 71 deletions(-)

---

## ⚠️ Cần Làm Trước Khi Push Production

### BẮT BUỘC: Seed Khẩu Quyết vào Redis Production

```bash
# Pull production env vars
vercel env pull .env.production --environment=production

# Chạy seed
node -r dotenv/config scripts/seed-khau-quyet.mjs dotenv_config_path=.env.production
```

Nếu không seed → course `khau-quyet` không tồn tại trong Redis → reader trả 404.

---

## 🧪 Test Plan Staging

> **Lưu ý staging:** QR bank "Truy vấn không thành công" là expected (NEXT_PUBLIC_BANK_* không có trong Preview env). Test flow với user đã có `enrollments['khau-quyet'].status = 'active'` trong Redis.

### Flow 1 — User chưa mua (paywall)
1. Login → `/tang-kinh-cac/khoa-hoc/khau-quyet` → tự redirect sang `kq-ch-00`
2. Đọc ch-00 (lời tựa) OK ✓
3. Click ch-01 → hiện paywall UI đẹp ✓
4. "Mua ngay 199.000đ →" → `/tang-kinh-cac/checkout` ✓
5. Dashboard: upsell card "Khẩu Quyết" hiển thị ✓
6. Enrolled courses: chỉ thấy "Bản Đồ" (nếu có), không thấy KQ ✓

### Flow 2 — User đã mua (set manual trong Redis)
1. Set `member.enrollments['khau-quyet'] = { status: 'active', ... }` trong Redis
2. Login → Dashboard: KQ card xuất hiện trong "Bí Kíp Của Tôi", progress 0% ✓
3. Upsell card "Mua 199.000đ" ẩn ✓
4. Click KQ card → `/tang-kinh-cac/khoa-hoc/khau-quyet` → redirect ch-00 ✓
5. Đọc ch-01 → content hiển thị (không paywall) ✓
6. Đọc hết ch-11 → progress 100% ✓

### Flow 3 — Checkout success redirect
1. User mua KQ → payment confirmed → redirect `/tang-kinh-cac/khoa-hoc/khau-quyet` (không phải dashboard) ✓

---

## 🗂 Architecture Notes

```
Payment enrollment (lib/data.ts → Redis msl:members):
  member.enrollments['khau-quyet'] = { status: 'active', ... }
  → Dùng để check paywall tại chapter level

TKC Progress tracking (lib/courses.ts → Redis msl:enrollments):
  enrollment.userId + enrollment.courseId + chaptersRead[] + progressPercent
  → Dùng để track reading progress, hiển thị progress bar
  → Auto-created khi user visit course/chapter lần đầu

Paywall check (chapter reader):
  course.price > 0 && chapter.preview === false
    → getMember() → check enrollments['khau-quyet'].status
    → if not 'active' → render PaywallUI
```

---

## 📋 Files Changed Summary

| File | Change |
|------|--------|
| `data/courses/khau-quyet.json` | NEW — 12 chapters full content |
| `scripts/seed-khau-quyet.mjs` | NEW — seed script |
| `lib/courses.ts` | Add `preview?: boolean` to CourseContent |
| `app/tang-kinh-cac/(protected)/khoa-hoc/[slug]/page.tsx` | Auto-enroll all courses |
| `app/tang-kinh-cac/(protected)/khoa-hoc/[slug]/[chapter]/page.tsx` | Paywall logic |
| `app/tang-kinh-cac/(protected)/dashboard/page.tsx` | Member fetch + KQ card + hide upsell |
| `app/tang-kinh-cac/(protected)/checkout/TKCCheckoutClient.tsx` | Redirect to reader on success |

---

Chúc sư huynh ngủ ngon 🌙
