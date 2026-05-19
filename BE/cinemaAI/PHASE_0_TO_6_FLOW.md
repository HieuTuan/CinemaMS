# Luồng Backend CineAI - Phase 0 đến Phase 6

Tài liệu này mô tả luồng nghiệp vụ và vai trò của các phase đã hoàn thành trong backend CineAI, từ nền tảng chung đến luồng đặt vé, F&B và QR check-in.

## Phase 0 - Shared Foundation

Phase 0 tạo nền chung cho toàn bộ backend.

Thành phần chính:
- Cấu trúc Spring Boot MVC.
- Response chuẩn: `ApiResponse`, `ErrorResponse`, `PageResponse`.
- Global exception handler.
- Base entity có `createdAt`, `updatedAt`.
- Security base.
- Test profile H2.
- Logging/filter/config nền.

Mục tiêu: các phase sau có thể cắm module vào cùng một chuẩn API, response và error handling.

## Phase 1 - Database Code-first/Schema

Phase 1 chuyển môi trường dev sang code-first.

Thành phần chính:
- Dùng JPA Entity để Hibernate sinh/update schema.
- Tắt Flyway trong dev.
- Archive migration nháp.
- Tạo entity nền cho các module: user, movie, cinema, booking, payment, promotion, review, staff, storage.
- Tạo repository nền.
- Tạo seed data dev.

Mục tiêu: có database model đủ rộng để triển khai các module nghiệp vụ tiếp theo.

## Phase 2 - Auth, User & Security

Phase 2 xây hệ thống tài khoản, xác thực và phân quyền.

Luồng chính:
1. Khách đăng ký tài khoản.
2. Hệ thống tạo user, gán role mặc định `CUSTOMER`, tạo email verification token.
3. User xác minh email.
4. User đăng nhập và nhận access token + refresh token.
5. User gọi `/api/v1/users/me` để lấy thông tin hiện tại.
6. Hỗ trợ refresh token, logout, password reset và email verification.
7. API admin được bảo vệ bằng role `ADMIN`.
8. API staff dùng role `STAFF` hoặc `ADMIN` ở các phase sau.

Mục tiêu: mọi API nghiệp vụ sau này có user context và role-based authorization.

## Phase 3 - Movie & Genre

Phase 3 xây catalog phim và thể loại phim.

Luồng public:
1. Khách xem danh sách phim.
2. Tìm kiếm/lọc phim theo keyword, genre, ngày phát hành, status.
3. Xem chi tiết phim.
4. Xem danh sách thể loại.

Luồng admin:
1. Admin tạo genre.
2. Admin tạo movie.
3. Gắn movie với nhiều genre.
4. Admin cập nhật movie.
5. Admin đổi status movie.
6. Admin soft delete/ẩn movie bằng status `INACTIVE`.

Mục tiêu: tạo dữ liệu phim làm đầu vào cho AI analysis, showtime và booking.

## Phase 4 - AI Movie Analysis

Phase 4 tạo tính năng CineAI phân tích nội dung phim.

Luồng admin:
1. Admin yêu cầu phân tích một movie.
2. Hệ thống dùng `MockMovieAnalysisStrategy`.
3. Sinh kết quả:
   - overall score
   - violence score
   - romance score
   - humor score
   - content label
   - target audience
   - summary
   - emotion timeline
4. Admin có thể regenerate analysis.
5. Admin approve hoặc reject analysis.

Luồng public:
1. Khách gọi API xem analysis của movie.
2. Chỉ analysis có status `APPROVED` mới được public.

Mục tiêu: tạo lớp AI analysis mock-first, sẵn sàng nối OpenAI/Gemini thật ở phase tích hợp sau.

## Phase 5 - Cinema, Room, Seat & Showtime

Phase 5 xây hệ thống rạp, phòng, ghế và suất chiếu.

Luồng admin:
1. Admin tạo cinema.
2. Admin tạo room thuộc cinema.
3. Admin sinh sơ đồ ghế theo `rowCount` và `columnCount`.
4. Admin tạo showtime cho movie trong room.
5. Hệ thống tự tính `endTime = startTime + movie duration + cleanup time`.
6. Hệ thống kiểm tra trùng lịch:
   - cùng room
   - showtime chưa cancel
   - khoảng thời gian bị overlap
   - nếu trùng thì trả `409 Conflict`

Luồng public:
1. Khách xem danh sách cinema.
2. Xem room theo cinema.
3. Xem danh sách showtime.
4. Xem chi tiết showtime.
5. Xem seat map của showtime.

Seat map gồm:
- Ghế vật lý từ `Seat`.
- Runtime status từ `BookingSeat`, ví dụ `AVAILABLE`, `HOLDING`, `BOOKED`, `CHECKED_IN`.

Mục tiêu: chuẩn bị nền cho luồng chọn suất và chọn ghế khi booking.

## Phase 6 - Booking, Seat Locking, F&B & Ticket QR

Phase 6 xây luồng đặt vé.

### Luồng giữ ghế

1. Khách đăng nhập.
2. Khách chọn showtime.
3. Khách xem seat map.
4. Khách gọi hold seats API:
   - `POST /api/v1/bookings/hold`
5. Hệ thống kiểm tra:
   - showtime còn mở
   - seat thuộc đúng room của showtime
   - seat còn available
   - seat chưa bị user khác hold/book/check-in
6. Nếu hợp lệ, tạo `Booking` status `HOLDING`.
7. Tạo `BookingSeat` status `HOLDING`.
8. Set `holdExpiresAt`.

### Luồng chống đặt trùng ghế

1. User A hold ghế A1.
2. User B hold cùng ghế A1.
3. Hệ thống kiểm tra `BookingSeat` đang `HOLDING`, `BOOKED` hoặc `CHECKED_IN`.
4. Nếu hold chưa hết hạn, trả `409 Conflict`.

### Luồng confirm booking

1. Khách gọi:
   - `POST /api/v1/bookings`
2. Truyền `holdBookingId`.
3. Có thể thêm F&B:
   - `FoodItem`: món lẻ.
   - `FoodCombo`: combo.
4. Hệ thống tính:
   - tiền vé
   - tiền F&B
   - subtotal
   - totalAmount
5. Booking hiện mock paid ngay.
6. Booking chuyển sang `PAID`.
7. `BookingSeat` chuyển sang `BOOKED`.
8. Sinh QR code nội bộ.

### Luồng cancel booking

1. Khách cancel booking.
2. Booking chuyển sang `CANCELLED`.
3. Seat runtime chuyển sang `RELEASED`.

### Luồng QR check-in

1. Staff hoặc admin quét/gửi QR.
2. Gọi một trong hai API:
   - `POST /api/v1/staff/check-in`
   - `POST /api/v1/admin/check-in`
3. Hệ thống tìm booking theo QR.
4. Nếu booking đang `PAID`, chuyển sang `USED`.
5. `BookingSeat` chuyển sang `CHECKED_IN`.

### Luồng F&B

Public:
- `GET /api/v1/foods/items`
- `GET /api/v1/foods/combos`

Admin:
- `GET /api/v1/admin/foods/items`
- `GET /api/v1/admin/foods/combos`
- `POST /api/v1/admin/foods/items`
- `POST /api/v1/admin/foods/combos`
- `PUT /api/v1/admin/foods/items/{itemId}`
- `PUT /api/v1/admin/foods/combos/{comboId}`

Mục tiêu: customer có thể giữ ghế, tạo booking, mua thêm F&B và nhận QR; staff/admin có thể check-in vé bằng QR.

## Luồng End-to-End

1. Phase 0 tạo foundation.
2. Phase 1 tạo schema/entity/repository.
3. Phase 2 user đăng ký/login, có JWT.
4. Phase 3 admin tạo movie/genre.
5. Phase 4 admin phân tích AI cho movie, approve để public xem.
6. Phase 5 admin tạo cinema/room/seat/showtime.
7. Phase 6 customer chọn showtime, giữ ghế, tạo booking, thêm F&B, nhận QR.
8. Staff/admin dùng QR để check-in vé.

