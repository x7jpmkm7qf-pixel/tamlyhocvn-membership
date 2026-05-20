# Deployment Notes — tamlyhocvn.club

Ghi lại các bài học từ thực tế deploy để tránh lặp lại.

---

## 1. Next.js public folder path

**Rule**: KHÔNG dùng prefix `/public/` trong `href` hoặc `src`.

Trong Next.js, thư mục `public/` được serve tại root URL — không có prefix `/public`.

| File trên disk | URL đúng | URL sai |
|---|---|---|
| `public/files/abc.pdf` | `/files/abc.pdf` | `/public/files/abc.pdf` |
| `public/images/foo.png` | `/images/foo.png` | `/public/images/foo.png` |

**Lỗi gặp**: Nút "↓ PDF" trên reader dùng `href="/public/files/..."` → 404. Fix: bỏ `/public`.

---

## 2. Vercel production deploy — workflow 3 bước (tránh cache issue)

`vercel --prod` đôi khi restore build cache cũ → Next.js không recompile file đã thay đổi → chunk JS cũ được serve lên production. Dùng workflow sau để tránh:

```bash
# Bước 1: Build local, dùng env production
npx vercel build --prod

# Bước 2: Deploy prebuilt output (upload 3.2MB thật, không reuse cache)
npx vercel deploy --prebuilt --prod
# → ghi lại <new-deployment-url> từ output

# Bước 3: Alias CẢ HAI domain (BẮT BUỘC!)
npx vercel alias <new-deployment-url> tamlyhocvn.club
npx vercel alias <new-deployment-url> www.tamlyhocvn.club
```

**Tại sao phải alias cả 2?**
`tamlyhocvn.club` (non-www) redirect 308 → `www.tamlyhocvn.club`. Nếu chỉ alias non-www, www vẫn serve deployment cũ.

**Dấu hiệu cache issue**: output build log không có dòng `Running "npm run build"`, hoặc upload chỉ vài KB thay vì MB.

---

## 3. Verify deployment bằng curl trước khi tin browser

Browser có thể cache page cũ. Dùng curl để xác nhận production thật sự đã update.

```bash
# Check HTTP status và content-type
curl -sI https://www.tamlyhocvn.club/<path> | grep "HTTP\|content-type"

# Check chunk hash của trang (so với local build)
curl -sL https://www.tamlyhocvn.club/<page-path> | grep -o "chunks/app/.*/page-[a-f0-9]*.js"

# Check chunk hash local build
ls .next/static/chunks/app/<page>/
# Hoặc trong prebuilt output:
ls .vercel/output/static/_next/static/chunks/app/<page>/

# Nếu hash trên prod ≠ hash local → deployment chưa đúng → chạy lại workflow bước 2-3
```

**Ví dụ thực tế (2026-05-21)**:
- Local build: `page-c904e85e3cfe722c.js` (có phone field)
- Production lần đầu: `page-f74f199e626559de.js` (cache cũ, không có phone field)
- Fix: `vercel build --prod` + `deploy --prebuilt` → hash khớp → OK

---

## 4. Vercel build cache — khi nào `vercel --prod` bị ảnh hưởng

Vercel restore Next.js build cache từ deployment production trước đó. Nếu source file thay đổi nhưng Next.js dùng timestamp thay vì content hash để invalidate cache (trong môi trường container), file có thể không được recompile.

**Triệu chứng**: JS chunk trên production thiếu code mới dù git push đã đúng.

**Fix nhanh**: Workflow prebuilt ở mục 2 luôn đảm bảo build từ source local.
