# Tổng hợp các thay đổi đã thực hiện trong BE

Tài liệu này ghi lại những phần đã chỉnh trong backend CinemaAI liên quan đến đăng ký tài khoản, xác minh OTP qua Gmail, thời gian hiệu lực OTP, cấu hình gửi mail và giao diện email OTP.

## 1. Thay đổi flow đăng ký tài khoản

Trước đây, khi người dùng nhập thông tin đăng ký, backend tạo ngay user trong bảng `users`. Điều này làm cho email của người dùng vẫn nằm trong database dù người dùng thoát ở màn hình nhập OTP.

Đã thay đổi flow như sau:

- Khi gọi API đăng ký, backend chưa tạo user thật trong bảng `users`.
- Thông tin đăng ký được lưu tạm vào bảng `pending_registrations`.
- Nếu người dùng thoát ở màn hình OTP, email không xuất hiện trong bảng `users`.
- Chỉ khi người dùng nhập đúng OTP, backend mới tạo user thật.
- Sau khi xác minh OTP thành công, bản ghi tạm trong `pending_registrations` được xóa.

Các phần code liên quan:

- `AuthService`
- `AuthController`
- `PendingRegistration`
- `PendingRegistrationRepository`
- `AuthIntegrationTests`

## 2. Thêm bảng `pending_registrations`

Đã thêm bảng mới để lưu thông tin đăng ký tạm thời trước khi xác minh OTP.

Bảng `pending_registrations` lưu các thông tin:

- Email.
- Mật khẩu đã hash.
- Họ tên.
- Số điện thoại.
- Mã OTP.
- Thời gian hết hạn OTP.
- Thời gian tạo và cập nhật.

Các phần code liên quan:

- `src/main/java/com/sba301/cinemaai/entity/PendingRegistration.java`
- `src/main/java/com/sba301/cinemaai/repository/PendingRegistrationRepository.java`
- `src/main/resources/db/migration/V1__baseline_schema.sql`

## 3. Xác minh OTP mới tạo user thật

Đã cập nhật logic xác minh email để hỗ trợ flow đăng ký tạm.

Khi người dùng nhập đúng OTP:

- Backend tìm bản ghi trong `pending_registrations`.
- Kiểm tra OTP còn hạn.
- Kiểm tra email và số điện thoại chưa bị dùng bởi user khác.
- Tạo user thật trong bảng `users`.
- Kích hoạt email bằng `activateEmail()`.
- Gán role `CUSTOMER`.
- Xóa bản ghi trong `pending_registrations`.

Nếu không tìm thấy pending registration, backend fallback về flow xác minh email cũ.

## 4. Giới hạn thời gian OTP còn 1 phút 30 giây

Đã đổi thời gian hiệu lực của OTP email từ 10 phút xuống còn 90 giây.

Các thay đổi chính:

- Dùng `plusSeconds(90)` cho OTP đăng ký.
- Gửi lại OTP cũng reset thời gian hết hạn về 90 giây.
- Flow email verification cũ cũng được chỉnh về 90 giây.
- Response đăng ký đổi từ đơn vị phút sang đơn vị giây.

Field response hiện tại:

```text
emailVerificationExpiresInSeconds
```

## 5. Cập nhật flow gửi lại OTP

Đã cập nhật API gửi lại OTP để hoạt động với cả user đang nằm trong bảng đăng ký tạm.

Logic mới:

- Nếu email có trong `pending_registrations`, backend tạo OTP mới và cập nhật lại thời gian hết hạn.
- Nếu không có trong `pending_registrations`, backend dùng flow gửi lại OTP cũ.

Các phần code liên quan:

- `AuthService.resendVerificationOtp`
- `AuthController`
- `EmailVerificationService`

## 6. Cấu hình gửi OTP qua Gmail

Đã kiểm tra nguyên nhân OTP không gửi đến Gmail và phát hiện mail đang bị tắt do cấu hình mặc định:

```properties
MAIL_ENABLED=false
```

Đã cập nhật để project có thể đọc file `.env` ở root project:

```properties
spring.config.import=optional:file:.env[.properties]
```

Các biến cần cấu hình để gửi OTP qua Gmail:

```properties
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-google-app-password
MAIL_FROM=your-gmail@gmail.com
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true
```

Lưu ý: `MAIL_PASSWORD` phải là Google App Password, không phải mật khẩu Gmail thường.

Các file liên quan:

- `src/main/resources/application.properties`
- `.env.example`

## 7. Thêm log cảnh báo khi mail chưa bật

Đã thêm log cảnh báo trong `MailService`.

Nếu `MAIL_ENABLED` hoặc `app.mail.enabled` đang là `false`, backend sẽ log:

```text
OTP email was not sent because MAIL_ENABLED/app.mail.enabled is false
```

Mục đích là giúp dễ phát hiện lý do OTP không được gửi đến Gmail.

## 8. Nâng cấp email OTP từ plain text sang HTML/CSS

Đã đổi email OTP từ dạng text thường sang HTML email có CSS.

Email hiện có:

- Header thương hiệu `CinemaAI`.
- Layout dạng khung email chuyên nghiệp.
- Mã OTP được làm nổi bật.
- Thông báo thời gian hiệu lực.
- Cảnh báo bảo mật.
- Footer thương hiệu.

Code gửi mail đã đổi từ `SimpleMailMessage` sang:

```text
MimeMessage
MimeMessageHelper
```

File liên quan:

- `src/main/java/com/sba301/cinemaai/service/MailService.java`

## 9. Việt hóa email OTP

Đã đổi subject và nội dung email OTP sang tiếng Việt có dấu.

Subject hiện tại:

```text
CinemaAI - Mã xác minh của bạn
```

Một số nội dung chính trong email:

```text
Xin chào,
Cảm ơn bạn đã lựa chọn CinemaAI.
Mã này có hiệu lực trong 1 phút 30 giây.
Để bảo vệ tài khoản, vui lòng không chia sẻ mã này với bất kỳ ai.
```

Email vẫn được gửi bằng UTF-8 để Gmail hiển thị tiếng Việt có dấu.

## 10. Cập nhật test

Đã cập nhật `AuthIntegrationTests` để kiểm tra flow mới:

- Sau khi đăng ký, email chưa xuất hiện trong bảng `users`.
- OTP được lưu trong `pending_registrations`.
- Sau khi xác minh OTP, user mới được tạo trong bảng `users`.
- Sau khi xác minh thành công, bản ghi pending bị xóa.
- Login, refresh token, logout vẫn hoạt động bình thường.

Đã chạy các lệnh kiểm thử:

```bash
mvn -Dtest=AuthIntegrationTests test
mvn test
```

Kết quả: các test đã pass.

## 11. Danh sách file đã chỉnh hoặc thêm

Các file chính đã chỉnh:

- `src/main/java/com/sba301/cinemaai/service/AuthService.java`
- `src/main/java/com/sba301/cinemaai/controller/AuthController.java`
- `src/main/java/com/sba301/cinemaai/service/EmailVerificationService.java`
- `src/main/java/com/sba301/cinemaai/service/MailService.java`
- `src/main/java/com/sba301/cinemaai/dto/auth/RegisterResponse.java`
- `src/main/resources/application.properties`
- `src/main/resources/db/migration/V1__baseline_schema.sql`
- `src/test/java/com/sba301/cinemaai/auth/AuthIntegrationTests.java`
- `.env.example`

Các file mới đã thêm:

- `src/main/java/com/sba301/cinemaai/entity/PendingRegistration.java`
- `src/main/java/com/sba301/cinemaai/repository/PendingRegistrationRepository.java`
- `OTP_EMAIL_CHANGES.md`

