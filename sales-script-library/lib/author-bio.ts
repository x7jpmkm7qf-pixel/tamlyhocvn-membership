/**
 * Single source of truth cho profile tác giả Hán Văn Sơn.
 * Mọi nơi cần hiển thị bio (homepage, /free/download, /register, ...) đều dùng data này.
 *
 * Thông tin được verify từ public sources:
 * - CafeF (11/2022): "Hán Văn Sơn và hành trình thay đổi tư duy chăm sóc sức khỏe"
 * - CafeBiz (11/2022): "Hán Văn Sơn - Nghĩ lớn để thành công"
 * - Google AI Overview tổng hợp
 * - Pharmatech.vn (website chính thức)
 */

export interface PressItem {
  publisher: string
  title: string
  date: string
  /** Nếu có URL chính xác — paste vào. Không có thì link đến Google search. */
  url: string
}

export const AUTHOR_BIO = {
  fullName: 'Hán Văn Sơn',
  alias: 'Sơn NaUy',
  initials: 'HVS',
  primaryRole: 'Founder & CEO Norway Pharmatech AS',
  headline:
    'Doanh nhân trẻ — người mang thương hiệu dược phẩm Pharmatech (Na Uy) về Việt Nam',
  /** Mô tả ngắn 2-3 dòng — dùng cho compact variant */
  shortBio:
    'Founder & CEO Norway Pharmatech AS — đại diện chính thức tại Việt Nam của Pharmatech, thương hiệu dược phẩm top 3 Châu Âu (Na Uy, hơn 30 năm). Đồng thời là Founder Lady Care.',
  /** Sứ mệnh — quote */
  mission:
    'Thay đổi tư duy chăm sóc sức khỏe chủ động của người Việt — bằng sản phẩm chuẩn Châu Âu và đội ngũ sales tử tế.',
  /** 5 credentials chính — dùng full variant */
  credentials: [
    {
      icon: '🇳🇴',
      title: 'Founder & CEO Norway Pharmatech AS',
      desc: 'Đại diện chính thức tại VN của Pharmatech — thương hiệu dược phẩm top 3 Châu Âu, hơn 30 năm phát triển, hơn 1.500 sản phẩm.',
    },
    {
      icon: '🏢',
      title: 'Founder Lady Care',
      desc: 'Đồng sáng lập thương hiệu Lady Care — chuyên về dòng sản phẩm chăm sóc sức khỏe phụ nữ.',
    },
    {
      icon: '📅',
      title: 'Đưa Pharmatech về Việt Nam (2019)',
      desc: 'Cuối 2019, anh đưa thương hiệu Pharmatech từ Na Uy về phân phối tại thị trường Việt Nam.',
    },
    {
      icon: '🎯',
      title: '5+ dòng sản phẩm đang phân phối',
      desc: 'Sản phẩm chăm sóc sức khỏe chuẩn Châu Âu: làm đẹp phụ nữ, sức khỏe nam giới, vitamin tổng hợp, chống sâu răng...',
    },
    {
      icon: '🧠',
      title: 'Tâm huyết với đào tạo sales',
      desc: 'Trong hành trình xây Pharmatech VN từ 0, anh trực tiếp đào tạo hàng trăm sales rep — từ đó đúc kết kịch bản tâm lý chia sẻ qua tamlyhocvn.club.',
    },
  ],
  /** Press mentions — link đến Google search nếu chưa có URL bài cụ thể */
  press: [
    {
      publisher: 'CafeF',
      title: 'Hán Văn Sơn và hành trình thay đổi tư duy chăm sóc sức khỏe',
      date: '11/2022',
      url: 'https://www.google.com/search?q=%22H%C3%A1n+V%C4%83n+S%C6%A1n%22+Pharmatech+CafeF',
    },
    {
      publisher: 'CafeBiz',
      title: 'Hán Văn Sơn — Nghĩ lớn để thành công',
      date: '11/2022',
      url: 'https://www.google.com/search?q=%22H%C3%A1n+V%C4%83n+S%C6%A1n%22+Pharmatech+CafeBiz',
    },
    {
      publisher: 'Pharmatech VN',
      title: 'Trang chính thức — Innovation for healthy living',
      date: '',
      url: 'https://pharmatech.vn',
    },
  ] as PressItem[],
  /** Cầu nối với tamlyhocvn.club — vì sao 1 doanh nhân dược phẩm lại làm sales coaching */
  bridgeToProduct:
    'Trong 5 năm xây Pharmatech VN từ con số 0, anh trực tiếp đào tạo hàng trăm sales rep và đúc kết hàng nghìn kịch bản thực chiến. tamlyhocvn.club là nơi anh chia sẻ lại — không phải lý thuyết, mà là kịch bản đã proven trong môi trường cạnh tranh nhất: dược phẩm.',
  contact: {
    phone: '0961 588 227',
    zaloUrl: 'https://zalo.me/0961588227',
  },
}
