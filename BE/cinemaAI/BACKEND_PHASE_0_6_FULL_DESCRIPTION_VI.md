# Mô tả đầy đủ Backend CinemaAI - Phase 0 đến Phase 6

Tài liệu này mô tả đầy đủ phạm vi công việc backend đã thực hiện trong dự án CinemaAI, tập trung vào các Phase 0 đến Phase 6.

Mục tiêu của tài liệu:

- Giải thích vai trò của từng phase trong hệ thống.
- Liệt kê các chức năng đã triển khai trong code backend.
- Ghi nhận các API, luồng xử lý, logic nghiệp vụ và kiểm thử chính.
- Làm rõ trạng thái hoàn thành của từng phase.

Phạm vi: **Backend trong folder `BE/cinemaAI`**.

---

## Phase 0 - Shared Foundation

### Mục tiêu

Phase 0 là phần nền tảng dùng chung cho toàn bộ backend. Phase này không tập trung vào một nghiệp vụ riêng, mà xây dựng các thành phần cơ sở để các phase sau có thể phát triển ổn định, thống nhất và dễ bảo trì.

### Nội dung chính

- Thiết lập cấu trúc project theo mô hình layer/MVC.
- Chuẩn hóa response trả về cho API.
- Chuẩn hóa xử lý lỗi và validation.
- Cấu hình bảo mật nền.
- Cấu hình CORS, OpenAPI, async và JPA auditing.
- Tạo base entity dùng chung cho auditing.
- Thêm logging request và correlation id.
- Đảm bảo project có thể compile, khởi động context và chạy test.

Dự án đã có cấu trúc package rõ ràng:

- `config`
- `controller`
- `dto`
- `entity`
- `enums`
- `exception`
- `mapper`
- `repository`
- `security`
- `service`
- `analysis`
- `audit`
- `modules`

Các lớp response dùng chung đã được triển khai:

- `ApiResponse`
- `PageResponse`
- `ErrorResponse`
- `FieldErrorResponse`

Xử lý exception tập trung đã có:

- `GlobalExceptionHandler`
- `BadRequestException`
- `ConflictException`
- `ForbiddenException`
- `NotFoundException`
- `UnauthorizedException`

Các cấu hình nền đã có:

- `CorsConfig`
- `OpenApiConfig`
- `AsyncConfig`
- `JpaAuditingConfig`
- `RequestLoggingFilter`
- `CorrelationIdFilter`

Phần security nền đã có:

- `SecurityConfig`
- `JwtAuthenticationFilter`
- `JwtService`
- `JwtProperties`
- `CustomUserDetailsService`
- `AuthenticatedUser`
- `PasswordEncoder`

### Kiểm thử

Đã có test context và test exception:

- `CinemaAiApplicationTests`
- `GlobalExceptionHandlerTests`

### Trạng thái

**Hoàn thành.**

Phase 0 đã hoàn thành đầy đủ phần nền tảng bắt buộc cho backend.

---

## Phase 1 - Database Migration / Schema Foundation

### Mục tiêu

Phase 1 xây dựng nền tảng dữ liệu cho hệ thống. Đây là phase tạo schema, bảng, khóa ngoại, constraint, index và dữ liệu seed cần thiết để các module nghiệp vụ phía sau hoạt động.

### Nội dung chính

- Thiết kế database schema cho hệ thống.
- Tạo bảng cho auth, user, movie, cinema, showtime, booking và các module liên quan.
- Tạo constraint, unique key, foreign key và index.
- Chuẩn bị seed data cho môi trường dev.
- Quản lý migration bằng cấu trúc rõ ràng.

Dự án hiện có baseline schema chính:

- `src/main/resources/db/migration/V1__baseline_schema.sql`

Các migration nháp/cũ đã được archive:

- `src/main/resources/db/migration_disabled/V1__init_auth_core.sql`
- `src/main/resources/db/migration_disabled/V2__movie_catalog.sql`
- `src/main/resources/db/migration_disabled/V3__cinema_showtime.sql`

Baseline schema đã bao phủ các nhóm bảng chính:

- Auth/user:
  - `users`
  - `roles`
  - `user_roles`
  - `refresh_tokens`
  - `password_reset_tokens`
  - `email_verification_tokens`
  - `phone_verification_tokens`
  - `pending_registrations`
- Movie:
  - `movies`
  - `genres`
  - `movie_genres`
- Cinema/showtime:
  - `cinemas`
  - `rooms`
  - `seats`
  - `showtimes`
- AI analysis:
  - `ai_analyses`
  - `ai_emotion_segments`
- Booking/F&B:
  - `bookings`
  - `booking_seats`
  - `food_items`
  - `food_combos`
  - `booking_food_items`
- Các bảng nền cho phase sau:
  - `payments`
  - `promotions`
  - `booking_promotions`
  - `wishlists`
  - `loyalty_points`
  - `notifications`
  - `reviews`
  - `staff_profiles`
  - `staff_shifts`
  - `audit_logs`
  - `uploaded_files`

Dự án cũng có seed runner cho môi trường dev:

- `DevSeedDataRunner`

Seed runner hiện tạo dữ liệu mẫu cho:

- Role
- Genre
- Movie
- Cinema
- Room
- Seat
- Showtime

### Trạng thái

**Hoàn thành.**

Phase 1 đã hoàn thành nền dữ liệu cho Phase 0 đến Phase 6, đồng thời đã chuẩn bị trước một số bảng nền cho các phase sau.

---

## Phase 2 - Auth, User & Security

### Mục tiêu

Phase 2 xây dựng hệ thống tài khoản, xác thực và phân quyền. Đây là phase bắt buộc để các API admin, staff và customer hoạt động an toàn.

### Nội dung chính

- Đăng ký tài khoản.
- Xác minh email bằng OTP.
- Đăng nhập bằng email/password.
- Đăng nhập Google.
- Xác minh Google OTP.
- Refresh token.
- Logout.
- Lấy thông tin người dùng hiện tại.
- Cập nhật profile.
- Đổi mật khẩu.
- Reset mật khẩu bằng OTP.
- Xác minh số điện thoại và OTP đăng nhập qua điện thoại.
- Phân quyền theo role.

### Luồng đăng ký OTP

Dự án đã thay đổi flow đăng ký để an toàn hơn:

1. Người dùng gửi request đăng ký.
2. Backend chưa tạo user thật trong bảng `users`.
3. Backend lưu thông tin đăng ký tạm vào `pending_registrations`.
4. Backend gửi OTP email.
5. Khi OTP hợp lệ, backend mới tạo user thật.
6. Sau khi tạo user thành công, pending registration được xóa.

OTP email hiện có hiệu lực trong **1 phút 30 giây**.

### Email/Gmail

Dự án đã có gửi OTP qua Gmail SMTP khi bật:

```properties
MAIL_ENABLED=true
```

Email OTP đã có HTML/CSS và nội dung tiếng Việt có dấu.

### Phân quyền

Security config đã phân quyền:

- Public route cho movie, genre, cinema, showtime, food và auth.
- Authenticated route cho user/booking.
- Admin route cho `/api/v1/admin/**`.
- Staff/admin route cho `/api/v1/staff/**`.

### Kiểm thử

Đã có integration test:

- `AuthIntegrationTests`

Test bao phủ flow:

- Register
- Verify email
- Login
- Current user
- Refresh token
- Logout

### Trạng thái

**Hoàn thành.**

Phase 2 đã hoàn thành đầy đủ core auth, user và security.

---

## Phase 3 - Movie & Genre

### Mục tiêu

Phase 3 xây dựng module quản lý phim và thể loại phim. Đây là dữ liệu đầu vào quan trọng cho AI analysis, showtime và booking.

### Nội dung chính

- Khách có thể xem danh sách phim.
- Khách có thể tìm kiếm/lọc phim.
- Khách có thể xem chi tiết phim.
- Admin có thể tạo, cập nhật, đổi trạng thái và xóa/ẩn phim.
- Admin có thể quản lý thể loại phim.

### Logic nghiệp vụ

Đã có:

- Kiểm tra trùng title phim.
- Soft delete movie bằng trạng thái `INACTIVE`.
- Public API không trả phim `INACTIVE`.
- Gán nhiều genre cho một movie.
- Thay thế danh sách genre khi cập nhật movie.

### Kiểm thử

Đã có integration test:

- `MovieIntegrationTests`

Test bao phủ:

- Tạo genre.
- Tạo movie.
- Public search/filter.
- Public detail.
- Update movie.
- Update status.
- Soft delete movie.

### Trạng thái

**Hoàn thành.**

Phase 3 đã có đầy đủ CRUD/admin flow và public movie/genre API.

---

## Phase 4 - AI Movie Analysis

### Mục tiêu

Phase 4 triển khai tính năng AI phân tích nội dung phim. Đây là tính năng đặc trưng của CinemaAI, giúp sinh điểm phân tích, nhãn nội dung, nhóm khán giả phù hợp và timeline cảm xúc.

### Nội dung chính

- Admin yêu cầu phân tích phim.
- Hệ thống sinh kết quả phân tích.
- Hệ thống hỗ trợ mock strategy để test ổn định.
- Có nền để kết nối OpenAI/Gemini.
- Admin có thể regenerate analysis.
- Admin có thể approve/reject analysis.
- Public chỉ xem được analysis đã được approve.

### Logic nghiệp vụ

Đã có:

- Tạo analysis theo movie.
- Chuyển trạng thái `PENDING` -> `PROCESSING` -> `DONE`.
- Lưu điểm tổng quan và các điểm thành phần.
- Lưu content label.
- Lưu target audience.
- Lưu summary.
- Lưu raw response từ provider.
- Lưu emotion timeline.
- Regenerate analysis và xóa segment cũ.
- Approve analysis.
- Reject analysis.
- Delete analysis và xóa emotion segments liên quan.
- Public chỉ xem analysis approved.

### Kiểm thử

Đã có integration test:

- `AIAnalysisIntegrationTests`

Test bao phủ:

- Request analysis.
- Public chưa thấy analysis khi chưa approve.
- Regenerate.
- Approve.
- Public xem approved analysis.
- Reject.
- Delete analysis.

### Trạng thái

**Hoàn thành.**

Phase 4 đã hoàn thành core AI analysis flow, có mock strategy ổn định cho test và có nền để kết nối provider thật.

---

## Phase 5 - Cinema, Room, Seat & Showtime

### Mục tiêu

Phase 5 xây dựng module quản lý rạp, phòng chiếu, ghế và suất chiếu. Đây là nền tảng trực tiếp cho việc chọn suất chiếu và chọn ghế khi đặt vé.

### Nội dung chính

- Admin quản lý rạp.
- Admin quản lý phòng chiếu.
- Admin sinh sơ đồ ghế.
- Admin quản lý từng ghế.
- Admin tạo và quản lý suất chiếu.
- Hệ thống kiểm tra trùng lịch phòng chiếu.
- Public xem rạp, phòng, suất chiếu và seat map.

### Logic nghiệp vụ

Đã có:

- Quản lý cinema.
- Quản lý room.
- Sinh sơ đồ ghế theo số hàng/số cột của room.
- Cho phép overwrite sơ đồ ghế khi cần.
- Quản lý từng ghế bằng update type/status.
- Delete ghế theo hướng soft delete bằng status `UNAVAILABLE`.
- Tính end time của showtime theo duration phim và cleanup time.
- Kiểm tra trùng lịch phòng chiếu.
- Seat map hiển thị trạng thái ghế theo runtime booking.
- Ghế không khả dụng hiển thị `UNAVAILABLE`.

### Kiểm thử

Đã có integration test:

- `CinemaShowtimeIntegrationTests`

Test bao phủ:

- Tạo cinema.
- Tạo room.
- Generate seats.
- Update/delete seat.
- Tạo showtime.
- Chặn showtime bị trùng lịch.
- Public search showtime.
- Public seat map.
- Update status showtime.

### Trạng thái

**Hoàn thành.**

Phase 5 đã có đầy đủ core flow và admin CRUD cho cinema, room, seat, showtime.

---

## Phase 6 - Booking, Seat Locking, F&B & Ticket QR

### Mục tiêu

Phase 6 xây dựng luồng đặt vé của khách hàng, từ giữ ghế đến tạo booking, thêm F&B, sinh QR ticket và check-in vé.

### Nội dung chính

- Customer giữ ghế tạm thời.
- Hệ thống chống hai người dùng giữ/đặt cùng một ghế trong cùng suất chiếu.
- Customer tạo booking từ booking giữ ghế.
- Customer thêm F&B vào booking.
- Hệ thống tính tổng tiền vé và F&B.
- Hệ thống sinh QR ticket nội bộ.
- Customer xem danh sách booking của mình.
- Customer xem chi tiết booking của mình.
- Customer hủy booking.
- Staff/admin check-in bằng QR.
- Admin quản lý booking.
- Scheduler dọn hold ghế hết hạn.

### Logic giữ ghế và chống trùng

Dự án đã có logic:

- Khi hold ghế, hệ thống kiểm tra ghế có thuộc đúng phòng của showtime không.
- Ghế phải ở trạng thái `AVAILABLE`.
- Hệ thống kiểm tra trạng thái runtime của ghế trong cùng showtime.
- Các trạng thái chặn gồm:
  - `HOLDING`
  - `BOOKED`
  - `CHECKED_IN`
- Hold hết hạn không còn chặn ghế.
- Khi booking thành công, ghế chuyển sang `BOOKED`.
- Khi check-in, ghế chuyển sang `CHECKED_IN`.
- Khi cancel hoặc expire, ghế chuyển sang `RELEASED`.

### Logic booking

Dự án đã có:

- Tạo booking hold với thời hạn 10 phút.
- Tạo booking paid từ hold.
- Thêm food item/combo vào booking.
- Kiểm tra số lượng F&B phải dương.
- Chỉ được chọn một trong hai: food item hoặc combo.
- Chỉ cho phép F&B đang `ACTIVE`.
- Tính subtotal, discount amount và total amount.
- Sinh booking code.
- Sinh QR code nội bộ.
- Customer chỉ xem/hủy booking của mình.
- Admin có thể xem và quản lý booking.

### QR ticket

Dự án đã có `QrTicketService`.

QR code nội bộ có dạng:

```text
CINEAI:{bookingCode}:{userId}
```

Khi check-in:

- Hệ thống kiểm tra QR hợp lệ.
- Hệ thống trích xuất booking code.
- Chỉ booking `PAID` mới được check-in.
- Sau check-in, booking chuyển sang `USED`.

### Scheduler dọn hold hết hạn

Dự án đã có scheduler:

- `SeatHoldCleanupScheduler`

Scheduler gọi:

- `BookingService.releaseExpiredHolds()`

Cấu hình:

```properties
app.booking.hold-cleanup.enabled=${BOOKING_HOLD_CLEANUP_ENABLED:true}
app.booking.hold-cleanup.fixed-delay-ms=${BOOKING_HOLD_CLEANUP_FIXED_DELAY_MS:60000}
```

Mặc định scheduler chạy mỗi 60 giây.

Trong môi trường test, scheduler được tắt bằng:

```properties
app.booking.hold-cleanup.enabled=false
```

### Kiểm thử

Đã có integration test:

- `BookingIntegrationTests`

Test bao phủ:

- Hold ghế.
- Chặn người khác hold trùng ghế.
- Create booking.
- Tính tổng tiền vé và F&B.
- Sinh QR.
- Admin xem booking.
- Admin lọc booking theo status.
- Seat map chuyển sang `BOOKED`.
- Staff/admin check-in bằng QR.
- Public F&B.
- Admin delete F&B item.
- Scheduler cleanup logic cho hold hết hạn.

### Trạng thái

**Hoàn thành.**

Phase 6 đã hoàn thành core booking flow, seat locking, F&B, QR ticket, check-in, admin booking management và scheduler cleanup hold hết hạn.

---

## Tổng kết Phase 0 đến Phase 6

Từ Phase 0 đến Phase 6, backend CinemaAI hiện đã hoàn thành các phần chính:

- Nền tảng backend dùng chung.
- Database schema nền.
- Auth, user và security.
- Movie và genre.
- AI movie analysis.
- Cinema, room, seat và showtime.
- Booking, seat locking, F&B và ticket QR.

Các phase này đã có:

- Entity.
- Enum.
- Repository.
- DTO.
- Mapper.
- Service.
- Controller.
- Security phân quyền.
- Logic nghiệp vụ chính.
- Integration tests.
- Postman/API documentation liên quan Phase 0 đến Phase 6.

Kết quả kiểm thử gần nhất:

```text
mvn test
BUILD SUCCESS
Tests run: 9
Failures: 0
Errors: 0
Skipped: 0
```

Kết luận:

**Backend trong phạm vi Phase 0 đến Phase 6 đã hoàn thành đầy đủ core flow và các CRUD/admin endpoint cần thiết cho các tính năng chính.**

Payment thật, promotion nâng cao, wishlist, loyalty, notification, review, report, storage, websocket và các module production mở rộng khác nằm ngoài phạm vi hoàn thành chính của Phase 0 đến Phase 6.
