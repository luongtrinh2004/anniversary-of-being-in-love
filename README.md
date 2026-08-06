# 💖 Anniversary Space — Web Kỷ Niệm 3 Năm Yêu Nhau (Minh Châu & Lương Trịnh)

Một ứng dụng Web lãng mạn cao cấp được xây dựng riêng để kỷ niệm 3 năm ngày yêu nhau, tích hợp hệ thống phân quyền (Auth), đếm thời gian thực, thiệp mời 3D, album ảnh kỷ niệm, bình luận vĩnh viễn và cơ sở dữ liệu **MongoDB Local**.

---

## 🌟 Tính Năng Nổi Bật

- **Thiệp Mời Hẹn Hò & Đếm Ngược Thời Gian Thực:**
  - Trang Đăng nhập hiển thị bộ đếm ngược chính xác từng ngày, giờ, phút, giây đến mốc **09/08/2026**.
  - Bàn phím mã PIN 4 số với lớp mã bảo mật `1096` dành cho **Người Yêu (Minh Châu)** và `6969` dành cho **Quản Trị (Admin)**.

- **Không Gian Lãng Mạn Cho Bạn Gái (Role User):**
  - **Bức Thư Tình 3D**: Phong bì thư 3D với hiệu ứng đánh máy chữ (Typewriter Effect) tự động.
  - **Love Story Timeline**: Cột mốc 3 năm yêu nhau với hình ảnh & bình luận trực tiếp.
  - **Album Ảnh Kỷ Niệm**: Cho phép người yêu tự do tải ảnh mới từ máy và xem ảnh chất lượng cao.
  - **Hệ Thống Bình Luận Nhạc & Ảnh theo Thời Gian Thực**: Lưu bình luận vĩnh viễn vào MongoDB với thông báo chưa đọc (Unread Badge).
  - **Góc Chọn Quà Sinh Nhật**: Chọn 1 món quà duy nhất hoặc tự nhập ý kiến riêng.

- **Trang Quản Trị Chi Tiết (Role Admin):**
  - Quản lý toàn bộ thông tin thiệp, thư tình, album ảnh, dòng thời gian, lời hứa & nhạc nền.
  - **Theo dõi kết quả chọn quà sinh nhật** và ý kiến riêng của bạn gái cập nhật thời gian thực.

- **Cơ Sở Dữ Liệu Local MongoDB & Âm Nhạc Autoplay:**
  - Tích hợp MongoDB Local (`mongodb://127.0.0.1:27017/anniversary_db`) lưu vĩnh viễn mọi dữ liệu.
  - Phát nhạc tự động bài hát *"Từng Ngày Yêu Em - buitruonglinh"* với trình điều khiển âm thanh singleton.

---

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide React Icons
- **Backend**: Node.js, Express.js, Mongoose (MongoDB Local)
- **Database**: MongoDB Local (`anniversary_db`)

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Khởi chạy Server MongoDB & Vite
```bash
npm run dev
```

Ứng dụng sẽ chạy tại:
- **Frontend**: `http://localhost:5173` (hoặc `5174`)
- **Backend API**: `http://localhost:5001`
- **MongoDB**: `mongodb://127.0.0.1:27017/anniversary_db`

---

## 🔑 Mật Mã Đăng Nhập

- **User (Người Yêu - Minh Châu)**: `1096`
- **Admin (Quản Trị - Lương Trịnh)**: `6969`

---

*Made with ❤️ by luongtrinh2004*