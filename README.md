# MATH AND ENGLISH — HAI PHONG MATH OLYMPIAD PLATFORM
### Nền Tảng Bồi Dưỡng Đội Tuyển Học Sinh Giỏi Môn Toán THPT Bằng Tiếng Anh
**Chuẩn Ma Trận Đề Thi Sở Giáo Dục & Đào Tạo Hải Phòng**

---

## 📌 Giới Thiệu Dự Án
**MATHANDENGLISH** (MathElite AI) là nền tảng số hóa toàn diện phục vụ công tác giảng dạy, tự học và thi thử dành cho đội tuyển Học sinh giỏi (HSG) môn Toán THPT thi bằng Tiếng Anh. Dự án tích hợp trí tuệ nhân tạo (Gemini AI), thư viện toán học KaTeX chất lượng cao, hệ thống Firebase thời gian thực và trọn bộ 13 giáo án bồi dưỡng chính khóa.

- **Đơn vị công tác**: Trường THPT Khúc Thừa Dụ – Sở GD&ĐT Hải Phòng
- **Tác giả giáo án & phụ trách chuyên môn**: Thầy Trần Hoài Thanh (Tổ Toán - Tin học)
- **Cấu trúc đề thi chuẩn**: 22 câu / 90 phút (Phần 1: 12 câu trắc nghiệm 4 lựa chọn; Phần 2: 10 câu trả lời ngắn điền đáp số). Thang điểm 20.

---

## 🌟 Tính Năng Nổi Bật

### 1. Hệ Thống 13 Giáo Án Bồi Dưỡng Chính Khóa (Thư mục `giaoan/`)
Toàn bộ 13 bài giảng chuyên sâu được số hóa trực tiếp và hiển thị đầy đủ trong mục **Vở Ghi Ôn Tập**:
1. **Buổi 1**: Hệ Bất Phương Trình Bậc Nhất Hai Ẩn & Tam Thức Bậc Hai
2. **Buổi 2**: Hàm Số Lượng Giác & Phương Trình Lượng Giác Chuyên Sâu
3. **Buổi 3**: Dãy Số, Cấp Số Cộng & Cấp Số Nhân
4. **Buổi 4**: Giới Hạn Dãy Số, Giới Hạn Hàm Số & Tính Liên Tục
5. **Buổi 5**: Hàm Số Mũ & Hàm Số Lôgarit, Phương Trình Mũ - Lôgarit
6. **Buổi 6**: Hệ Thức Lượng Trong Tam Giác & Ứng Dụng Hình Học
7. **Buổi 7**: Quan Hệ Song Song & Vuông Góc Trong Không Gian
8. **Buổi 8**: Đại Số Tổ Hợp & Xác Suất Nâng Cao
9. **Buổi 9**: Thống Kê Số Liệu Ghép Nhóm & Các Số Đặc Trưng
10. **Buổi 10**: Các Chuyên Đề Nâng Cao: Nguyên Lý Dirichlet, Bất Biến & Điểm Cực Biên
11. **Buổi 11**: Luyện Đề Thi Thử Số 1 & 2 (Mock Exam 1 – 2)
12. **Buổi 12**: Luyện Đề Thi Thử Số 3 & 4 (Mock Exam 3 – 4)
13. **Buổi 13**: Luyện Đề Thi Thử Số 5 & 6 & Tổng Ôn Toàn Diện (Mock Exam 5 – 6)

*Mỗi bài học đều kèm Bảng từ vựng thuật ngữ toán chuyên ngành (IPA + dịch nghĩa), file Word `.docx` nguyên bản để tải về máy, và tính năng In / Xuất PDF.*

### 2. Trình Tạo Đề Thi AI Chuẩn Ma Trận Hải Phòng
- Tự động sinh đề thi 22 câu phân bổ chuẩn: 6 Thông hiểu (TH), 9 Vận dụng (VD), 7 Vận dụng cao (VDC).
- Hỗ trợ chế độ Song ngữ (English + Bản dịch Tiếng Việt tách biệt rõ ràng) hoặc Tiếng Anh thuần túy.
- Xuất đề thi và đáp án chi tiết sang định dạng **Microsoft Word (.docx)** và **PDF**.

### 3. Phòng Luyện Thi Trực Tuyến 90 Phút
- Đồng hồ đếm ngược, lưu bài thi theo thời gian thực.
- Bảng câu hỏi thông minh, chấm điểm tự động theo thang 20 điểm.
- Báo cáo phân tích kết quả, xem lại từng câu hỏi kèm lời giải KaTeX sắc nét.

### 4. Công Nghệ Hiển Thị Công Thức Toán KaTeX Siêu Nét
- Đóng gói toàn bộ webfont KaTeX offline, không bị phụ thuộc vào CDN bên ngoài.
- Hiển thị căn thức, phân số, tích phân, ma trận mượt mà, không bị vỡ dòng hay lặp công thức.

---

## 🛠️ Công Nghệ Sử Dụng
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Toán học & Khoa học**: KaTeX (Local fonts bundle)
- **Backend & Database**: Firebase Realtime Database, Firebase Authentication
- **Trí tuệ nhân tạo**: Google Gemini AI (Interactions / Content Generation)
- **Xử lý tài liệu**: `docx`, `file-saver`

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`

### 3. Đóng gói bản Production
```bash
npm run build
```

---

## 📄 Bản Quyền
Dự án được xây dựng phục vụ công tác giảng dạy & học tập môn Toán THPT bằng Tiếng Anh tại Hải Phòng.
Giáo án thuộc bản quyền chuyên môn của Thầy **Trần Hoài Thanh** – Trường THPT Khúc Thừa Dụ, Hải Phòng.
