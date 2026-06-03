# Tổng hợp công việc Backend CinemaAI - Phạm vi Phase 0 đến Phase 6

Tài liệu này tổng hợp các phần bạn đảm nhiệm trong folder BE của CinemaAI.

Phạm vi đảm nhiệm: **Phase 0 đến Phase 6**.

Nội dung tập trung vào nghiệp vụ và trạng thái hoàn thành, không liệt kê chi tiết entity, enum, repository, DTO, mapper, strategy, service, controller hay từng API.

## PHASE 0 - Shared Foundation

### Mô tả nhiệm vụ

- Thiết lập nền tảng chung cho toàn bộ backend.
- Tạo cấu trúc thư mục theo mô hình MVC/layer.
- Chuẩn hóa response, exception, config, security base và các tiện ích dùng chung.
- Đảm bảo project có thể khởi động, compile và chạy test context ổn định.

### Đã hoàn thành

- Đã có cấu trúc backend theo layer rõ ràng.
- Đã chuẩn hóa response trả về cho API.
- Đã có xử lý exception tập trung.
- Đã có base entity dùng chung cho auditing.
- Đã cấu hình CORS, OpenAPI, async và JPA auditing.
- Đã có request logging và correlation id.
- Đã có security base, JWT filter, password encoder và user details nền.
- Đã có test context và test exception/validation.
- Toàn bộ test đã từng pass bằng `mvn test`.

### Còn thiếu

- Không còn hạng mục bắt buộc cho Phase 0.

---

## PHASE 1 - Database Migration / Schema Foundation

### Mô tả nhiệm vụ

- Thiết kế nền tảng dữ liệu cho toàn bộ hệ thống.
- Tạo schema, constraint, index và seed data cần thiết.
- Làm nền dữ liệu cho các module nghiệp vụ phía sau.

### Đã hoàn thành

- Đã có baseline schema chính trong `V1__baseline_schema.sql`.
- Đã archive các migration nháp cũ vào `migration_disabled`.
- Đã có model dữ liệu nền cho các module thuộc Phase 0 đến Phase 6.
- Đã có seed runner cho môi trường dev.
- Đã bổ sung bảng đăng ký tạm `pending_registrations` cho flow OTP mới.

### Còn thiếu

- Khi domain model thay đổi thêm, nên tạo migration bổ sung thay vì chỉnh trực tiếp baseline đã chốt.

---

## PHASE 2 - Auth, User & Security

### Mô tả nhiệm vụ

- Xây dựng hệ thống tài khoản người dùng, phân quyền và xác thực JWT.
- Hỗ trợ đăng ký, đăng nhập, refresh token, logout và lấy thông tin người dùng hiện tại.
- Phân quyền ADMIN, CUSTOMER, STAFF cho các nhóm API tương ứng.

### Đã hoàn thành

- Đã có đăng ký tài khoản.
- Đã có đăng nhập bằng email/password.
- Đã có refresh token và logout.
- Đã có API lấy thông tin người dùng hiện tại.
- Đã có password reset request/confirm.
- Đã có xác minh email bằng OTP.
- Đã có đăng nhập Google và Google OTP verify.
- Đã có OTP đăng nhập/xác minh số điện thoại.
- Đã có phân quyền theo role cho public, authenticated, admin và staff route.
- Đã thay đổi flow đăng ký để chưa tạo user thật trước khi xác minh OTP.
- Đã lưu đăng ký tạm vào `pending_registrations`.
- Đã tạo user thật chỉ sau khi OTP email hợp lệ.
- Đã giới hạn OTP email còn 1 phút 30 giây.
- Đã cập nhật resend OTP cho cả pending registration.
- Đã có auth integration test cho flow register -> verify email -> login -> current user -> refresh -> logout.

### Còn thiếu

- Có thể bổ sung thêm test cho OTP sai, OTP hết hạn, resend OTP và các case bảo mật biên.

---

## PHASE 3 - Movie & Genre

### Mô tả nhiệm vụ

- Xây dựng module quản lý phim và thể loại phim.
- Cho phép khách xem danh sách phim, tìm kiếm, lọc phim và xem chi tiết phim.
- Cho phép admin tạo, cập nhật, ẩn/xóa phim và quản lý thể loại.

### Đã hoàn thành

- Đã có quản lý phim.
- Đã có quản lý thể loại phim.
- Đã có tìm kiếm/lọc phim cho phía public.
- Đã có xem chi tiết phim.
- Đã có admin CRUD phim.
- Đã có admin cập nhật trạng thái phim.
- Đã có admin quản lý thể loại.
- Đã có movie integration test.

### Còn thiếu

- Không còn hạng mục bắt buộc cho core Phase 3.

---

## PHASE 4 - AI Movie Analysis

### Mô tả nhiệm vụ

- Triển khai tính năng AI phân tích nội dung phim.
- Sinh điểm đa chiều, nhãn nội dung, nhóm khán giả phù hợp và timeline cảm xúc.
- Admin có thể yêu cầu phân tích, duyệt hoặc từ chối trước khi công khai.

### Đã hoàn thành

- Đã có flow admin yêu cầu phân tích phim.
- Đã có mock strategy để sinh kết quả phân tích.
- Đã có nền để kết nối OpenAI/Gemini.
- Đã có prompt builder và parser kết quả AI.
- Đã có regenerate analysis.
- Đã có approve/reject analysis.
- Đã có API public để xem analysis đã được duyệt.
- Đã có AI analysis integration test.

### Còn thiếu

- Có thể bổ sung kiểm thử sâu hơn khi bật provider AI thật ở production.

---

## PHASE 5 - Cinema, Room, Seat & Showtime

### Mô tả nhiệm vụ

- Xây dựng module quản lý rạp, phòng chiếu, ghế và lịch chiếu.
- Admin có thể tạo rạp, tạo phòng, sinh sơ đồ ghế và xếp lịch chiếu.
- Hệ thống kiểm tra trùng lịch phòng chiếu để tránh conflict.

### Đã hoàn thành

- Đã có quản lý rạp.
- Đã có quản lý phòng chiếu.
- Đã có sinh sơ đồ ghế.
- Đã có quản lý suất chiếu.
- Đã có kiểm tra trùng lịch phòng chiếu.
- Đã có public cinema/showtime APIs.
- Đã có seat map theo suất chiếu.
- Đã có cinema/showtime integration test.

### Còn thiếu

- Không còn hạng mục bắt buộc cho core Phase 5.

---

## PHASE 6 - Booking, Seat Locking, F&B & Ticket QR

### Mô tả nhiệm vụ

- Xây dựng luồng đặt vé từ giữ ghế đến tạo booking.
- Hỗ trợ khóa ghế tạm thời, tính tổng tiền, thêm F&B và tạo vé QR.
- Đảm bảo không có hai người dùng đặt cùng một ghế trong cùng suất chiếu.
- Staff/admin có thể check-in vé bằng QR code.

### Đã hoàn thành

- Đã có giữ ghế tạm thời.
- Đã có chống đặt trùng ghế.
- Đã có tạo booking từ booking giữ ghế.
- Đã có tính tiền vé và F&B.
- Đã có cancel booking.
- Đã có danh sách booking của người dùng.
- Đã có sinh QR ticket nội bộ.
- Đã có staff/admin check-in bằng QR.
- Đã có public và admin F&B flow.
- Đã bổ sung admin CRUD đầy đủ hơn cho F&B, seat, booking và AI analysis trong phạm vi Phase 0 đến Phase 6.
- Đã có scheduler dọn hold ghế hết hạn.
- Đã có booking integration test.

### Còn thiếu

- Không còn hạng mục bắt buộc cho core Phase 6.
- Payment thật sẽ nằm ngoài phạm vi Phase 0 đến Phase 6.

---

## Cập nhật bổ sung liên quan đến OTP và Gmail

Phần này phát sinh thêm trong quá trình hoàn thiện Phase 2.

### Đã hoàn thành

- Khi đăng ký, backend không lưu user vào bảng `users` trước khi xác minh OTP.
- Thông tin đăng ký được lưu tạm trong `pending_registrations`.
- Xác minh OTP thành công mới tạo user thật.
- OTP email có hiệu lực trong 1 phút 30 giây.
- Resend OTP hoạt động với pending registration.
- Backend đọc file `.env` từ root project.
- Email OTP gửi qua Gmail SMTP khi `MAIL_ENABLED=true`.
- Email OTP đã có HTML/CSS.
- Email OTP đã dùng tiếng Việt có dấu.

Subject email hiện tại:

```text
CinemaAI - Mã xác minh của bạn
```

### File liên quan chính

- `AuthService.java`
- `AuthController.java`
- `EmailVerificationService.java`
- `MailService.java`
- `RegisterResponse.java`
- `PendingRegistration.java`
- `PendingRegistrationRepository.java`
- `application.properties`
- `V1__baseline_schema.sql`
- `AuthIntegrationTests.java`
- `.env.example`
