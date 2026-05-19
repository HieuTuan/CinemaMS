# CINEAI - BACKEND MVC TASK ASSIGNMENT FOR 2 MEMBERS

Phan chia task backend CinemaAI cho 2 nguoi theo mo hinh MVC.

MVC convention:
- Model: Entity, Enum, database mapping.
- Repository: Spring Data JPA repository, query method, specification.
- Service: Business logic, transaction, validation xu ly nghiep vu.
- Controller: REST endpoint.
- DTO: Request/Response object, mapper.
- Config/Common: cau hinh dung chung.
- Test: unit test, service test, integration test.

API prefix:
- Public/customer API: `/api/v1`
- Admin API: `/api/v1/admin`

==================================================
BACKEND PHASE STATUS
==================================================

Muc dich:
- Theo doi toan bo phase backend can hoan thien.
- Biet hien tai project da lam duoc phase nao.
- Cap nhat lai phan tram sau moi lan implement.

==================================================

PHASE 0 - SHARED FOUNDATION

Mô tả nhiệm vụ:
- Thiết lập nền tảng chung cho toàn bộ backend.
- Tạo cấu trúc thư mục theo mô hình MVC/layer.
- Chuẩn hóa response, exception, config, security base và các tiện ích dùng chung.
- Đảm bảo project có thể khởi động, compile và chạy test context ổn định trước khi triển khai nghiệp vụ.

Status:
- Hoàn thành.
- Progress: 100%.
- Hoàn thành code-first schema foundation.

Đã hoàn thành:
- MVC package structure.
- `audit`
- `config`
- `controller`
- `dto`
- `entity`
- `enums`
- `exception`
- `mapper`
- `modules`
- `repository`
- `security`
- `service`
- `ApiResponse`
- `PageResponse`
- `ErrorResponse`
- `FieldErrorResponse`
- `GlobalExceptionHandler`
- custom exceptions.
- `BaseEntity`
- CORS config.
- OpenAPI config.
- Async config.
- JPA auditing config.
- Security config cơ bản.
- Security config gắn JWT filter thật.
- `PasswordEncoder`.
- `JwtProperties`.
- `JwtService`.
- `JwtAuthenticationFilter`.
- Request logging.
- Correlation id.
- Test riêng cho exception/validation.
- Test context pass bằng `mvn test`.
- Toàn bộ test pass bằng `mvn test`.

Còn thiếu:
- Không còn hạng mục Phase 0 bắt buộc.
- Các phần security nghiệp vụ chi tiết sẽ làm tiếp ở Phase 2.

==================================================

PHASE 1 - DATABASE MIGRATION

Mô tả nhiệm vụ:
- Giai đoạn dev chuyển sang code-first: ưu tiên tạo Entity trước, để Hibernate sinh/update schema.
- Flyway migration hiện tại được giữ lại nhưng tạm thời tắt trong môi trường dev.
- Sau khi domain model ổn định mới chốt schema và tạo migration SQL chính thức.
- Đây là nền tảng dữ liệu cho tất cả module nghiệp vụ phía sau.

Status:
- Hoàn thành code-first schema foundation.
- Progress: 100%.

Update Phase 1 code-first:
- Added entities/enums/repositories for all current schema foundation modules: AI analysis, booking/F&B/QR, payment, promotion, wishlist, loyalty, notification, review, staff/audit, uploaded files.
- Added Java seed runner for base roles and genres in non-test profiles.
- Extended Java seed runner with sample movies, movie genres, cinema, room, generated seats, and future showtimes for dev API testing.
- Reviewed initial schema constraints and changed booking seat uniqueness to a status-aware index so cancelled/released seats can be booked again later.
- Created official SQL Server baseline migration: `src/main/resources/db/migration/V1__baseline_schema.sql`.
- Reviewed production indexes/constraints for current Entity model.
- Verified with `mvn test`.

Đã hoàn thành:
- Đã archive migration nháp sang `src/main/resources/db/migration_disabled`.
  - `V1__init_auth_core.sql`
  - `V2__movie_catalog.sql`
  - `V3__cinema_showtime.sql`
- Đã cấu hình code-first dev mode:
  - `spring.jpa.hibernate.ddl-auto=update`
  - `spring.flyway.enabled=false`
  - datasource dùng biến môi trường `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
- Đã bỏ Flyway dependency khỏi `pom.xml` trong giai đoạn code-first.

Còn thiếu:
- Không còn hạng mục Phase 1 bắt buộc.
- Khi các phase nghiệp vụ thay đổi model, tạo migration bổ sung thay vì sửa baseline đã chốt.

==================================================

PHASE 2 - AUTH, USER & SECURITY

Mô tả nhiệm vụ:
- Xây dựng hệ thống tài khoản người dùng, phân quyền và xác thực JWT.
- Hỗ trợ đăng ký, đăng nhập, refresh token, logout, lấy thông tin người dùng hiện tại.
- Phân quyền ADMIN, CUSTOMER, STAFF cho các API tương ứng.
- Đây là phase bắt buộc trước khi triển khai booking, payment, admin và staff APIs.

Status:
- Đang làm.
- Progress: 100%.

Đã hoàn thành:
- `User`
- `Role`
- `UserRole`
- `RefreshToken`
- `PasswordResetToken`
- `EmailVerificationToken`
- `RoleName`
- `UserStatus`
- `UserRepository`
- `RoleRepository`
- `UserRoleRepository`
- `RefreshTokenRepository`
- `PasswordResetTokenRepository`
- `EmailVerificationTokenRepository`
- `PasswordEncoder`
- Auth DTOs.
- User DTOs.
- `AuthService`
- `UserService`
- `RefreshTokenService`
- `PasswordResetService`
- `EmailVerificationService`
- `CustomUserDetailsService`
- `AuthController`
- `UserController`
- `AdminUserController`
- Register API.
- Login API.
- Refresh token API.
- Logout API.
- Current user API.
- Email verification API.
- Password reset request/confirm APIs.
- Role-based authorization for public, authenticated, and admin routes.
- Auth integration test for register -> verify email -> login -> current user -> refresh -> logout.
- H2-backed test profile for integration tests.

Còn thiếu:
- Auth DTOs.
- User DTOs.
- `JwtService`
- `AuthService`
- `UserService`
- `RefreshTokenService`
- `PasswordResetService`
- `EmailVerificationService`
- `CustomUserDetailsService`
- `JwtAuthenticationFilter`
- `AuthController`
- `UserController`
- `AdminUserController`
- Register API.
- Login API.
- Refresh token API.
- Logout API.
- Current user API.
- Role-based authorization hoàn chỉnh.
- Auth integration tests.
- Phase 2 close-out: Không còn hạng mục Phase 2 bắt buộc.
- Email/password reset hiện trả token phục vụ dev; Phase 11 sẽ nối mail provider thật.

==================================================

PHASE 3 - MOVIE & GENRE

Mô tả nhiệm vụ:
- Xây dựng module quản lý phim và thể loại phim.
- Cho phép khách xem danh sách phim, tìm kiếm, lọc phim và xem chi tiết phim.
- Cho phép admin tạo, cập nhật, ẩn/xóa phim và quản lý thể loại.
- Đây là dữ liệu đầu vào chính cho AI analysis, showtime và booking.

Status:
- Hoàn thành.
- Progress: 100%.

Đã hoàn thành:
- Movie/genre migration trong `V2__movie_catalog.sql`.
- `Movie`
- `Genre`
- `MovieGenre`
- movie enums.
- repositories.
- DTOs.
- mapper.
- service.
- controller.
- public movie list/detail/search APIs.
- admin movie CRUD APIs.
- genre CRUD APIs.
- tests.

Còn thiếu:
- Phase 3 close-out: Không còn hạng mục Phase 3 bắt buộc.
- Search keyword tạm thời match title/director/language để tránh lower() trên CLOB khi chạy H2/MSSQL mode.

==================================================
PHASE 4 - AI MOVIE ANALYSIS

Mô tả nhiệm vụ:
- Triển khai tính năng cốt lõi của CineAI: AI phân tích nội dung phim.
- AI sinh điểm đa chiều, nhãn nội dung, nhóm khán giả phù hợp và timeline cảm xúc.
- Giai đoạn đầu dùng mock strategy, chưa gọi provider AI thật.
- Admin có thể yêu cầu phân tích, xem kết quả, duyệt hoặc từ chối trước khi công khai cho khách.

Status:
- Hoàn thành mock-first.
- Progress: 100%.

Đã hoàn thành:
- `AIAnalysis`
- `AIEmotionSegment`
- AI enums.
- repositories.
- DTOs.
- `MovieAnalysisStrategy`
- `MockMovieAnalysisStrategy`
- `OpenAIMovieAnalysisStrategy`
- `GeminiMovieAnalysisStrategy`
- `PromptBuilder`
- `AIResultParser`
- services.
- controllers.
- request analysis API.
- regenerate API.
- approve/reject API.
- public approved analysis API.
- tests.

Còn thiếu:
- Phase 4 close-out: Không còn hạng mục Phase 4 bắt buộc.
- OpenAI/Gemini provider hiện là placeholder; Phase 11 hoặc phase tích hợp AI thật sẽ bật provider thật và parser JSON thật.

==================================================
PHASE 5 - CINEMA, ROOM, SEAT & SHOWTIME

Mô tả nhiệm vụ:
- Xây dựng module quản lý rạp, phòng chiếu, ghế và lịch chiếu.
- Admin có thể tạo rạp, tạo phòng, sinh sơ đồ ghế và xếp lịch chiếu.
- Hệ thống phải kiểm tra trùng lịch phòng chiếu để tránh conflict.
- Đây là nền tảng trực tiếp cho luồng chọn suất và chọn ghế khi đặt vé.

Status:
- Hoàn thành.
- Progress: 100%.

Đã hoàn thành:
- Cinema/room/seat/showtime migration trong `V3__cinema_showtime.sql`.
- `Cinema`
- `Room`
- `Seat`
- `Showtime`
- related enums.
- repositories.
- DTOs.
- mapper.
- services.
- controllers.
- seat generation API.
- showtime conflict validation.
- showtime seat map API.
- tests.

Còn thiếu:
- Phase 5 close-out: Không còn hạng mục Phase 5 bắt buộc.
- Seat map hiện đọc runtime từ `BookingSeat`; Phase 6 sẽ bổ sung giữ ghế/thanh toán để runtime status có dữ liệu thực tế.

==================================================
PHASE 6 - BOOKING, SEAT LOCKING, F&B & TICKET QR

Mô tả nhiệm vụ:
- Xây dựng luồng đặt vé của khách hàng từ giữ ghế đến tạo booking.
- Hỗ trợ khóa ghế tạm thời, tự động hết hạn, tính tổng tiền, thêm F&B và tạo vé QR.
- Đảm bảo không có hai người dùng đặt cùng một ghế trong cùng suất chiếu.
- Staff/admin có thể check-in vé bằng QR code.

Status:
- Hoàn thành.
- Progress: 100%.

Đã hoàn thành:
- Booking migrations.
- `Booking`
- `BookingSeat`
- `FoodItem`
- `FoodCombo`
- `BookingFoodItem`
- repositories.
- DTOs.
- services.
- controllers.
- hold seats API.
- create booking API.
- cancel booking API.
- QR ticket service.
- check-in API.
- F&B APIs.
- tests.

Còn thiếu:
- Phase 6 close-out: Không còn hạng mục Phase 6 bắt buộc.
- Booking hiện dùng mock paid flow khi confirm; Phase 7 sẽ tách payment provider/callback/refund thật.
- Seat locking hiện release hold hết hạn khi booking flow chạy; Phase 11 có thể bổ sung scheduler tự động.

==================================================
PHASE 7 - PAYMENT

Mô tả nhiệm vụ:
- Xây dựng kiến trúc thanh toán đa nhà cung cấp theo Strategy Pattern.
- Giai đoạn đầu dùng mock payment để hoàn thiện flow booking.
- Sau đó bổ sung VNPAY/MoMo provider, callback/webhook và xác thực chữ ký.
- Payment callback phải idempotent để tránh xử lý trùng giao dịch.

Status:
- Chưa làm.
- Progress: 0%.

Cần làm:
- Payment migration.
- `Payment`
- payment enums.
- repository.
- DTOs.
- payment strategy pattern.
- mock payment provider.
- VNPAY provider placeholder.
- MoMo provider placeholder.
- services.
- controllers.
- create payment API.
- callback/webhook APIs.
- idempotent callback handling.
- refund foundation.
- tests.

==================================================

PHASE 8 - PROMOTION, WISHLIST, LOYALTY & NOTIFICATION

Mô tả nhiệm vụ:
- Xây dựng các tính năng giữ chân khách hàng và truyền thông.
- Bao gồm mã giảm giá, danh sách phim yêu thích, điểm thành viên và thông báo.
- Cho phép khách theo dõi phim, nhận thông báo mở bán/suất chiếu mới và tích điểm sau giao dịch.
- Admin có thể tạo, cập nhật, kiểm soát mã khuyến mãi.

Status:
- Chưa làm.
- Progress: 0%.

Cần làm:
- Promotion migration.
- Wishlist migration.
- Loyalty point migration.
- Notification migration.
- entities.
- enums.
- repositories.
- DTOs.
- services.
- controllers.
- promotion validation API.
- wishlist APIs.
- loyalty APIs.
- notification APIs.
- tests.

==================================================

PHASE 9 - REVIEW

Mô tả nhiệm vụ:
- Cho phép khách đánh giá phim sau khi đã sử dụng vé.
- Hệ thống tổng hợp điểm đánh giá thật từ người dùng để hiển thị trên trang phim.
- Admin có thể ẩn đánh giá không phù hợp.
- Dữ liệu review cũng dùng để so sánh với điểm AI trong báo cáo AI accuracy.

Status:
- Chưa làm.
- Progress: 0%.

Cần làm:
- Review migration.
- `Review`
- `ReviewStatus`
- repository.
- DTOs.
- `ReviewService`
- `ReviewModerationService`
- `MovieRatingAggregationService`
- controllers.
- public review APIs.
- admin hide review API.
- tests.

==================================================

PHASE 10 - STAFF, AUDIT & REPORTS

Mô tả nhiệm vụ:
- Xây dựng phần vận hành cho chủ rạp/admin.
- Bao gồm quản lý nhân viên, ca làm, audit log và các báo cáo vận hành.
- Báo cáo gồm doanh thu, tỷ lệ lấp đầy, hiệu quả phim và độ lệch giữa điểm AI với đánh giá thật.
- Audit log giúp theo dõi các hành động quan trọng trong hệ thống.

Status:
- Chưa làm.
- Progress: 0%.

Cần làm:
- Staff migration.
- Staff shift migration.
- Audit log migration.
- `StaffProfile`
- `StaffShift`
- `AuditLog`
- repositories.
- DTOs.
- services.
- controllers.
- dashboard API.
- revenue report API.
- occupancy report API.
- movie performance report API.
- AI accuracy report API.
- tests.

==================================================

PHASE 11 - STORAGE, EMAIL, WEBSOCKET & SCHEDULER

Mô tả nhiệm vụ:
- Tích hợp các hạ tầng phụ trợ cho production.
- Storage dùng để upload poster, trailer hoặc file liên quan.
- Email dùng cho xác thực tài khoản, reset mật khẩu, gửi vé và thông báo thanh toán.
- WebSocket dùng để cập nhật trạng thái ghế/thông báo realtime.
- Scheduler dùng để dọn các hold ghế hết hạn và các job nền khác.

Status:
- Chưa làm.
- Progress: 0%.

Cần làm:
- Uploaded file migration.
- `UploadedFile`
- storage service.
- Cloudinary service.
- S3 placeholder.
- mail service.
- email templates.
- WebSocket config.
- seat event publisher.
- notification event publisher.
- expired seat hold cleanup job.
- tests.

==================================================

PHASE 12 - INTEGRATION & QA

Mô tả nhiệm vụ:
- Kiểm thử tích hợp toàn bộ backend sau khi các module chính hoàn thành.
- Đảm bảo các flow quan trọng chạy xuyên suốt: auth, movie, AI, showtime, booking, payment, review, reports.
- Dọn Swagger, chuẩn hóa API contract và tạo Postman collection.
- Đây là phase đóng gói chất lượng trước khi bàn giao hoặc kết nối frontend.

Status:
- Chưa làm.
- Progress: 0%.

Cần làm:
- Auth integration tests.
- Movie integration tests.
- AI integration tests.
- Showtime integration tests.
- Booking integration tests.
- Payment integration tests.
- Security tests.
- Swagger cleanup.
- Postman collection.
- End-to-end backend smoke flow.

==================================================

CURRENT SUMMARY
==================================================

```text
Phase 0 - Shared Foundation: 100%
Phase 1 - Database Code-first/Schema: 100%
Phase 2 - Auth/User/Security: 100%
Phase 3 - Movie/Genre: 100%
Phase 4 - AI Analysis: 100%
Phase 5 - Cinema/Room/Seat/Showtime: 100%
Phase 6 - Booking/F&B/QR: 100%
Phase 7 - Payment: 0%
Phase 8 - Promotion/Wishlist/Loyalty/Notification: 0%
Phase 9 - Review: 0%
Phase 10 - Staff/Audit/Reports: 0%
Phase 11 - Storage/Email/WebSocket/Scheduler: 0%
Phase 12 - Integration & QA: 0%
```

Next recommended phase:
- Hoàn thiện Phase 7 - Payment.
- Thứ tự nên làm tiếp: payment DTO -> mock provider -> create payment -> callback/success/fail -> refund/cancel flow -> tests.
==================================================
TEAM SPLIT
==================================================

Backend Member 1 - Platform, Catalog & Scheduling:
- Common MVC foundation
- Auth/Security/User
- Movie/Genre
- AI Movie Analysis
- Cinema/Room/Seat
- Showtime

Backend Member 2 - Booking, Payment & Operations:
- Booking/Seat locking
- F&B
- Payment
- Promotion
- Wishlist
- Loyalty
- Notification
- Review
- Staff/Audit
- Reports
- Storage/Email/WebSocket

==================================================
SHARED MVC STRUCTURE
==================================================

Recommended package layout:

```text
com.sba301.cinemaai
├── common
│   ├── response
│   ├── exception
│   ├── pagination
│   └── util
├── config
├── security
├── auth
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   └── service
├── movie
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   └── service
└── ...
```

Rules:
- Controller only receives requests and returns responses.
- Service owns business logic and transaction boundaries.
- Repository only handles database access.
- DTOs are used for all request/response payloads.
- Entities are not returned directly from controllers.
- Validation annotations stay on request DTOs.
- `@Transactional` belongs in service layer.
- Admin endpoints require ADMIN role.

==================================================
SHARED FOUNDATION TASKS
==================================================

Owner:
- Member 1 owns implementation.
- Member 2 reviews and adds needs for booking/payment modules.

Model/Common:
- Create `BaseEntity`.
- Create audit fields: `createdAt`, `updatedAt`.
- Enable JPA auditing.

DTO/Common:
- Create `ApiResponse<T>`.
- Create `PageResponse<T>`.
- Create `ErrorResponse`.
- Create `ValidationErrorResponse`.

Service/Common:
- Create common pagination helper.
- Create date/time utility.
- Create money utility.

Controller/Common:
- Create health check awareness through Actuator.
- Ensure Swagger groups APIs by module.

Config:
- Configure CORS.
- Configure OpenAPI.
- Configure async executor.
- Configure application profiles: `dev`, `test`, `prod`.
- Configure environment properties.

Exception:
- Create `GlobalExceptionHandler`.
- Create `BadRequestException`.
- Create `NotFoundException`.
- Create `UnauthorizedException`.
- Create `ForbiddenException`.
- Create `ConflictException`.

Tests:
- Application context loads.
- Global exception format works.
- Validation error format works.
- Swagger UI works.

==================================================
MEMBER 1 - MVC TASKS
==================================================

MODULE 1 - AUTH, USER & SECURITY
==================================================

Model:
- `User`
- `Role`
- `UserRole`
- `RefreshToken`
- `PasswordResetToken`
- `EmailVerificationToken`
- Enum: `UserStatus`
- Enum: `RoleName`

Repository:
- `UserRepository`
- `RoleRepository`
- `RefreshTokenRepository`
- `PasswordResetTokenRepository`
- `EmailVerificationTokenRepository`

DTO:
- `RegisterRequest`
- `LoginRequest`
- `AuthResponse`
- `RefreshTokenRequest`
- `UserProfileResponse`
- `UpdateProfileRequest`
- `ChangePasswordRequest`
- `ForgotPasswordRequest`
- `ResetPasswordRequest`

Service:
- `AuthService`
- `JwtService`
- `UserService`
- `RefreshTokenService`
- `PasswordResetService`
- `EmailVerificationService`
- `CustomUserDetailsService`

Controller:
- `AuthController`
- `UserController`
- `AdminUserController`

APIs:
- POST  /api/v1/auth/register
- POST  /api/v1/auth/login
- POST  /api/v1/auth/refresh
- POST  /api/v1/auth/logout
- POST  /api/v1/auth/verify-email
- POST  /api/v1/auth/forgot-password
- POST  /api/v1/auth/reset-password
- GET   /api/v1/auth/me
- GET   /api/v1/users/me
- PATCH /api/v1/users/me
- PATCH /api/v1/users/me/password
- GET   /api/v1/admin/users
- GET   /api/v1/admin/users/{userId}
- PATCH /api/v1/admin/users/{userId}/status
- PATCH /api/v1/admin/users/{userId}/roles

Security Config:
- `SecurityConfig`
- `JwtAuthenticationFilter`
- `CustomAuthenticationEntryPoint`
- `CustomAccessDeniedHandler`

Business rules:
- Password is hashed with BCrypt.
- Access token expires after 15 minutes.
- Refresh token expires after 7 days.
- Refresh token is stored in httpOnly cookie.
- Disabled users cannot login.
- User can update only own profile.
- Admin APIs require ADMIN role.

Tests:
- Register user.
- Login user.
- Refresh token.
- Logout user.
- Get current user.
- Update profile.
- Change password.
- Customer cannot access admin API.
- Disabled user cannot login.

==================================================

MODULE 2 - MOVIE & GENRE
==================================================

Model:
- `Movie`
- `Genre`
- `MovieGenre`
- `UploadedFile` reference if poster/trailer metadata is stored here.
- Enum: `MovieStatus`
- Enum: `AgeRating`

Repository:
- `MovieRepository`
- `GenreRepository`
- `MovieGenreRepository`

DTO:
- `MovieCreateRequest`
- `MovieUpdateRequest`
- `MovieResponse`
- `MovieDetailResponse`
- `MovieFilterRequest`
- `GenreCreateRequest`
- `GenreUpdateRequest`
- `GenreResponse`

Service:
- `MovieService`
- `GenreService`
- `MovieSearchService`
- `MovieMapper`
- `GenreMapper`

Controller:
- `MovieController`
- `AdminMovieController`
- `GenreController`
- `AdminGenreController`

APIs:
- GET    /api/v1/movies
- GET    /api/v1/movies/{movieId}
- GET    /api/v1/movies/search
- GET    /api/v1/genres
- POST   /api/v1/admin/movies
- PUT    /api/v1/admin/movies/{movieId}
- DELETE /api/v1/admin/movies/{movieId}
- PATCH  /api/v1/admin/movies/{movieId}/status
- POST   /api/v1/admin/movies/{movieId}/poster
- POST   /api/v1/admin/movies/{movieId}/trailer
- POST   /api/v1/admin/genres
- PUT    /api/v1/admin/genres/{genreId}
- DELETE /api/v1/admin/genres/{genreId}

Business rules:
- Public users can view active movies.
- Admin can create, update, hide, or delete movies.
- Movie can have multiple genres.
- Movie title is required.
- Movie duration must be positive.
- Poster max size is 5MB.
- Poster must be valid image MIME type.

Tests:
- Admin creates movie.
- Admin updates movie.
- Admin changes movie status.
- Public movie list works.
- Movie detail works.
- Search/filter works.
- Customer cannot create movie.

==================================================

MODULE 3 - AI MOVIE ANALYSIS
==================================================

Model:
- `AIAnalysis`
- `AIEmotionSegment`
- Enum: `AIAnalysisStatus`
- Enum: `EmotionType`
- Enum: `ContentLabel`
- Enum: `TargetAudience`

Repository:
- `AIAnalysisRepository`
- `AIEmotionSegmentRepository`

DTO:
- `AIAnalysisResponse`
- `AIAnalysisAdminResponse`
- `AIEmotionSegmentResponse`
- `AIEmotionSegmentUpdateRequest`
- `AIAnalysisApprovalRequest`
- `AIAnalysisResultDto`

Service:
- `MovieAnalysisService`
- `MovieAnalysisGenerationService`
- `MovieAnalysisApprovalService`
- `AIEmotionTimelineService`
- `PromptBuilder`
- `AIResultParser`
- `MovieAnalysisMapper`

Strategy:
- `MovieAnalysisStrategy`
- `MockMovieAnalysisStrategy`
- `OpenAIMovieAnalysisStrategy`
- `GeminiMovieAnalysisStrategy`

Controller:
- `MovieAnalysisController`
- `AdminMovieAnalysisController`

APIs:
- POST  /api/v1/admin/movies/{movieId}/analyze
- POST  /api/v1/admin/movies/{movieId}/analysis/regenerate
- GET   /api/v1/movies/{movieId}/analysis
- GET   /api/v1/admin/movies/{movieId}/analysis
- PATCH /api/v1/admin/movies/{movieId}/analysis/approve
- PATCH /api/v1/admin/movies/{movieId}/analysis/reject
- GET   /api/v1/movies/{movieId}/analysis/emotion-segments
- PUT   /api/v1/admin/ai-analyses/{analysisId}/emotion-segments

Business rules:
- Early implementation uses mock AI.
- AI analysis starts as PENDING.
- Running analysis changes status to PROCESSING.
- Success changes status to DONE.
- Failure changes status to FAILED.
- Public users only see approved AI analysis.
- AI summary must be non-spoiler.

Tests:
- Request AI analysis.
- Generate mock analysis.
- Save emotion segments.
- Approve/reject analysis.
- Public cannot see unapproved analysis.
- Parser handles malformed AI response.

==================================================

MODULE 4 - CINEMA, ROOM, SEAT & SHOWTIME
==================================================

Model:
- `Cinema`
- `Room`
- `Seat`
- `Showtime`
- Enum: `RoomType`
- Enum: `SeatType`
- Enum: `SeatStatus`
- Enum: `ShowtimeStatus`

Repository:
- `CinemaRepository`
- `RoomRepository`
- `SeatRepository`
- `ShowtimeRepository`

DTO:
- `CinemaCreateRequest`
- `CinemaUpdateRequest`
- `CinemaResponse`
- `RoomCreateRequest`
- `RoomUpdateRequest`
- `RoomResponse`
- `SeatResponse`
- `SeatUpdateRequest`
- `SeatGenerationRequest`
- `ShowtimeCreateRequest`
- `ShowtimeUpdateRequest`
- `ShowtimeResponse`
- `ShowtimeSeatMapResponse`

Service:
- `CinemaService`
- `RoomService`
- `SeatService`
- `SeatGenerationService`
- `ShowtimeService`
- `ShowtimeConflictService`
- `ShowtimeSeatViewService`
- `CinemaMapper`
- `RoomMapper`
- `SeatMapper`
- `ShowtimeMapper`

Controller:
- `CinemaController`
- `AdminCinemaController`
- `AdminRoomController`
- `AdminSeatController`
- `ShowtimeController`
- `AdminShowtimeController`

APIs:
- GET    /api/v1/cinemas
- GET    /api/v1/cinemas/{cinemaId}
- POST   /api/v1/admin/cinemas
- PUT    /api/v1/admin/cinemas/{cinemaId}
- DELETE /api/v1/admin/cinemas/{cinemaId}
- GET    /api/v1/admin/rooms
- GET    /api/v1/admin/rooms/{roomId}
- POST   /api/v1/admin/rooms
- PUT    /api/v1/admin/rooms/{roomId}
- DELETE /api/v1/admin/rooms/{roomId}
- GET    /api/v1/admin/rooms/{roomId}/seats
- POST   /api/v1/admin/rooms/{roomId}/seats/generate
- GET    /api/v1/showtimes
- GET    /api/v1/showtimes/{showtimeId}
- GET    /api/v1/movies/{movieId}/showtimes
- GET    /api/v1/showtimes/{showtimeId}/seats
- POST   /api/v1/admin/showtimes
- PUT    /api/v1/admin/showtimes/{showtimeId}
- DELETE /api/v1/admin/showtimes/{showtimeId}

Business rules:
- Room belongs to one cinema.
- Seat belongs to one room.
- Seat types: NORMAL, VIP, COUPLE.
- Room types: 2D, 3D, IMAX, VIP.
- Showtime belongs to one movie and one room.
- Showtime start time must be at least 2 hours in the future.
- Showtime cannot conflict with another showtime in same room.
- Showtime end time = start time + movie duration + cleanup time.

Tests:
- Admin creates cinema.
- Admin creates room.
- Generate seats.
- Update seat type.
- Admin creates showtime.
- Reject conflicting showtime.
- Get showtime seat map.

==================================================
MEMBER 2 - MVC TASKS
==================================================

MODULE 5 - BOOKING, SEAT LOCKING, F&B & TICKET QR
==================================================

Model:
- `Booking`
- `BookingSeat`
- `FoodItem`
- `FoodCombo`
- `BookingFoodItem`
- Enum: `BookingStatus`
- Enum: `SeatRuntimeStatus`
- Enum: `FoodItemStatus`

Repository:
- `BookingRepository`
- `BookingSeatRepository`
- `FoodItemRepository`
- `FoodComboRepository`
- `BookingFoodItemRepository`

DTO:
- `SeatHoldRequest`
- `SeatHoldResponse`
- `BookingCreateRequest`
- `BookingResponse`
- `BookingDetailResponse`
- `BookingSeatResponse`
- `BookingCancelRequest`
- `BookingExchangeRequest`
- `CheckInResponse`
- `FoodItemCreateRequest`
- `FoodItemResponse`
- `FoodComboCreateRequest`
- `FoodComboResponse`

Service:
- `BookingService`
- `BookingHoldService`
- `SeatLockService`
- `BookingCodeGenerator`
- `TicketQrService`
- `QrSignatureService`
- `ExpiredSeatHoldCleanupJob`
- `FoodService`
- `BookingPriceCalculator`
- `BookingMapper`

Controller:
- `BookingController`
- `AdminBookingController`
- `FoodController`
- `AdminFoodController`

APIs:
- POST   /api/v1/bookings/hold
- POST   /api/v1/bookings
- GET    /api/v1/bookings/my
- GET    /api/v1/bookings/{bookingId}
- POST   /api/v1/bookings/{bookingId}/cancel
- POST   /api/v1/bookings/{bookingId}/exchange
- GET    /api/v1/bookings/{bookingId}/seats
- DELETE /api/v1/bookings/{bookingId}/seats/{seatId}
- GET    /api/v1/admin/bookings
- POST   /api/v1/admin/checkin/{qrCode}
- GET    /api/v1/food-items
- GET    /api/v1/food-combos
- POST   /api/v1/admin/food-items
- PUT    /api/v1/admin/food-items/{foodItemId}
- DELETE /api/v1/admin/food-items/{foodItemId}
- POST   /api/v1/admin/food-combos
- PUT    /api/v1/admin/food-combos/{comboId}
- DELETE /api/v1/admin/food-combos/{comboId}

Business rules:
- Booking requires authenticated user.
- User only accesses own bookings.
- Cannot book seats already booked or holding.
- Maximum 8 seats per booking.
- Seat hold expires after 10 minutes.
- Cancelled booking releases held seats.
- Check-in changes booking status to USED.
- QR contains booking code and HMAC signature.
- F&B item must be active to be added.

Tests:
- Hold seats.
- Reject unavailable seat hold.
- Reject more than 8 seats.
- Create booking from hold.
- Add F&B to booking.
- Calculate total.
- Cancel booking.
- Release expired holds.
- Generate ticket QR.
- Reject invalid QR check-in.

==================================================

MODULE 6 - PAYMENT
==================================================

Model:
- `Payment`
- Enum: `PaymentStatus`
- Enum: `PaymentProvider`

Repository:
- `PaymentRepository`

DTO:
- `PaymentCreateRequest`
- `PaymentCreateResponse`
- `PaymentStatusResponse`
- `PaymentCallbackRequest`
- `PaymentRefundRequest`
- `PaymentRefundResponse`

Service:
- `PaymentService`
- `PaymentCallbackService`
- `PaymentWebhookService`
- `PaymentSignatureVerifier`
- `PaymentRefundService`
- `PaymentMapper`

Strategy:
- `PaymentProviderStrategy`
- `MockPaymentProviderStrategy`
- `VnpayPaymentProviderStrategy`
- `MomoPaymentProviderStrategy`

Controller:
- `PaymentController`
- `PaymentCallbackController`
- `AdminPaymentController`

APIs:
- POST /api/v1/payments/create
- GET  /api/v1/payments/callback/vnpay
- GET  /api/v1/payments/callback/momo
- POST /api/v1/payments/webhook/vnpay
- POST /api/v1/payments/webhook/momo
- GET  /api/v1/payments/{bookingId}
- POST /api/v1/admin/payments/{paymentId}/refund

Business rules:
- Payment requires valid pending booking.
- Callback must be idempotent.
- Successful payment changes booking status to PAID.
- Failed payment marks payment as FAILED.
- User only sees own payment status.
- Refund requires paid booking.
- Refund writes audit log.

Tests:
- Create mock payment.
- Reject payment for another user's booking.
- Handle successful callback.
- Handle duplicate callback.
- Handle failed callback.
- Verify signature.
- Refund payment.

==================================================

MODULE 7 - PROMOTION, WISHLIST, LOYALTY & NOTIFICATION
==================================================

Model:
- `Promotion`
- `Wishlist`
- `LoyaltyPoint`
- `Notification`
- Enum: `PromotionType`
- Enum: `NotificationType`
- Enum: `LoyaltyTier`

Repository:
- `PromotionRepository`
- `WishlistRepository`
- `LoyaltyPointRepository`
- `NotificationRepository`

DTO:
- `PromotionCreateRequest`
- `PromotionUpdateRequest`
- `PromotionResponse`
- `PromotionValidateRequest`
- `PromotionValidateResponse`
- `WishlistResponse`
- `LoyaltyPointResponse`
- `LoyaltyPointHistoryResponse`
- `LoyaltyPointAdjustRequest`
- `NotificationResponse`

Service:
- `PromotionService`
- `WishlistService`
- `LoyaltyPointService`
- `NotificationService`
- `PromotionMapper`
- `NotificationMapper`

Controller:
- `PromotionController`
- `AdminPromotionController`
- `WishlistController`
- `LoyaltyPointController`
- `NotificationController`

APIs:
- GET    /api/v1/admin/promotions
- POST   /api/v1/admin/promotions
- PUT    /api/v1/admin/promotions/{promotionId}
- DELETE /api/v1/admin/promotions/{promotionId}
- POST   /api/v1/promotions/validate
- GET    /api/v1/wishlists/my
- POST   /api/v1/wishlists/movies/{movieId}
- DELETE /api/v1/wishlists/movies/{movieId}
- GET    /api/v1/loyalty-points/my
- GET    /api/v1/loyalty-points/my/history
- POST   /api/v1/admin/users/{userId}/loyalty-points/adjust
- GET    /api/v1/notifications
- PATCH  /api/v1/notifications/{notificationId}/read
- PATCH  /api/v1/notifications/read-all

Business rules:
- User can wishlist a movie once.
- User only accesses own wishlist.
- User only accesses own notifications.
- Promotion code must exist and not be expired.
- Promotion must not exceed usage limit.
- Promotion supports percentage, fixed amount, and combo.
- Successful check-in or review can create loyalty points.

Tests:
- Create promotion.
- Validate promotion.
- Reject expired promotion.
- Reject overused promotion.
- Add/remove wishlist.
- Reject duplicate wishlist.
- Get loyalty history.
- Mark notification as read.

==================================================

MODULE 8 - REVIEW
==================================================

Model:
- `Review`
- Enum: `ReviewStatus`

Repository:
- `ReviewRepository`

DTO:
- `ReviewCreateRequest`
- `ReviewUpdateRequest`
- `ReviewResponse`
- `ReviewModerationRequest`

Service:
- `ReviewService`
- `ReviewModerationService`
- `MovieRatingAggregationService`
- `ReviewMapper`

Controller:
- `ReviewController`
- `AdminReviewController`

APIs:
- GET    /api/v1/movies/{movieId}/reviews
- POST   /api/v1/movies/{movieId}/reviews
- PUT    /api/v1/reviews/{reviewId}
- DELETE /api/v1/reviews/{reviewId}
- GET    /api/v1/admin/reviews
- PATCH  /api/v1/admin/reviews/{reviewId}/hide

Business rules:
- User can review movie only after used booking.
- User can update or delete own review only.
- Admin can hide inappropriate review.
- Movie average rating updates after review change.

Tests:
- Submit review.
- Reject review without used booking.
- Update own review.
- Reject updating another user's review.
- Admin hides review.
- Recalculate movie average rating.

==================================================

MODULE 9 - STAFF, AUDIT & REPORTS
==================================================

Model:
- `StaffProfile`
- `StaffShift`
- `AuditLog`
- Enum: `StaffStatus`
- Enum: `AuditActionType`

Repository:
- `StaffProfileRepository`
- `StaffShiftRepository`
- `AuditLogRepository`

DTO:
- `StaffCreateRequest`
- `StaffUpdateRequest`
- `StaffResponse`
- `StaffShiftCreateRequest`
- `StaffShiftResponse`
- `AuditLogResponse`
- `DashboardResponse`
- `RevenueReportResponse`
- `OccupancyReportResponse`
- `MoviePerformanceReportResponse`
- `AIAccuracyReportResponse`

Service:
- `StaffService`
- `StaffShiftService`
- `AuditLogService`
- `AdminDashboardService`
- `ReportService`
- `RevenueReportService`
- `OccupancyReportService`
- `MoviePerformanceReportService`
- `AIAccuracyReportService`
- `BookingConversionReportService`
- `PaymentMethodReportService`

Controller:
- `AdminStaffController`
- `AdminStaffShiftController`
- `AdminAuditLogController`
- `AdminDashboardController`
- `AdminReportController`

APIs:
- GET    /api/v1/admin/staff
- POST   /api/v1/admin/staff
- GET    /api/v1/admin/staff/{staffId}
- PUT    /api/v1/admin/staff/{staffId}
- PATCH  /api/v1/admin/staff/{staffId}/status
- GET    /api/v1/admin/staff-shifts
- POST   /api/v1/admin/staff-shifts
- PUT    /api/v1/admin/staff-shifts/{shiftId}
- DELETE /api/v1/admin/staff-shifts/{shiftId}
- GET    /api/v1/admin/audit-logs
- GET    /api/v1/admin/audit-logs/{auditLogId}
- GET    /api/v1/admin/dashboard
- GET    /api/v1/admin/revenue
- GET    /api/v1/admin/reports/occupancy-rate
- GET    /api/v1/admin/reports/movie-performance
- GET    /api/v1/admin/reports/ai-accuracy
- GET    /api/v1/admin/reports/booking-conversion
- GET    /api/v1/admin/reports/payment-methods

Business rules:
- Only ADMIN can manage staff.
- STAFF can check in tickets if granted permission.
- Sensitive admin actions write audit log.
- Staff shift cannot overlap for same staff.
- Revenue only counts paid bookings.
- Occupancy rate = booked seats / total available seats.
- AI accuracy compares AI score and user review score.

Tests:
- Admin creates staff.
- Reject overlapping shift.
- Audit log created.
- Dashboard works.
- Revenue report works.
- AI accuracy report works.
- Customer cannot access reports.

==================================================

MODULE 10 - STORAGE, EMAIL, WEBSOCKET & SCHEDULER
==================================================

Model:
- `UploadedFile`

Repository:
- `UploadedFileRepository`

DTO:
- `FileUploadResponse`
- `UploadedFileResponse`
- `EmailTestRequest`
- `SeatEventResponse`
- `NotificationEventResponse`

Service:
- `StorageService`
- `CloudinaryStorageService`
- `S3StorageService`
- `MailService`
- `EmailTemplateService`
- `SeatEventPublisher`
- `NotificationEventPublisher`
- `ExpiredSeatHoldCleanupJob`

Controller:
- `AdminFileController`
- `AdminEmailController`
- `SeatWebSocketController`

Config:
- `WebSocketConfig`
- `CacheConfig`
- `RequestLoggingFilter`
- `CorrelationIdFilter`

APIs:
- POST   /api/v1/admin/files/upload
- GET    /api/v1/admin/files
- DELETE /api/v1/admin/files/{fileId}
- POST   /api/v1/admin/emails/test
- GET    /ws

Business rules:
- Provider API keys come from environment variables.
- Provider errors must not expose secrets.
- Uploaded files validate MIME type and size.
- Email failure must not break successful payment transaction.
- WebSocket payload must not expose sensitive data.

Tests:
- Upload validation.
- Email template rendering.
- WebSocket seat event.
- Notification realtime event.
- Cache behavior.

==================================================
DATABASE MIGRATION OWNERSHIP
==================================================

Member 1 owns migrations:
- users
- roles
- user_roles
- refresh_tokens
- password_reset_tokens
- email_verification_tokens
- movies
- genres
- movie_genres
- ai_analyses
- ai_emotion_segments
- cinemas
- rooms
- seats
- showtimes

Member 2 owns migrations:
- bookings
- booking_seats
- payments
- promotions
- booking_promotions
- wishlists
- loyalty_points
- notifications
- reviews
- staff_profiles
- staff_shifts
- audit_logs
- food_items
- food_combos
- booking_food_items
- uploaded_files

Migration rules:
- Coordinate version numbers before creating files.
- Never edit a merged migration; create a new migration.
- Foreign keys to another member's table require contract agreement.
- Add indexes in the same module migration or a later index migration.

==================================================
SPRINT PLAN
==================================================

Sprint 1 - Foundation:
- Member 1: Common foundation, Flyway setup, auth core tables.
- Member 2: Business table migration draft, booking/payment model design.

Sprint 2 - Auth & Catalog:
- Member 1: Auth MVC, movie/genre MVC.
- Member 2: Booking/F&B MVC skeleton, promotion MVC skeleton.

Sprint 3 - AI & Showtime:
- Member 1: AI MVC, cinema/room/seat/showtime MVC.
- Member 2: Booking hold, seat locking, ticket QR.

Sprint 4 - Payment:
- Member 1: Showtime seat map stabilization, security hardening.
- Member 2: Payment MVC, mock provider, callback idempotency.

Sprint 5 - Engagement:
- Member 1: AI approval polish, movie/showtime integration tests.
- Member 2: Promotion, wishlist, loyalty, notification, review MVC.

Sprint 6 - Operations:
- Member 1: Swagger cleanup, auth/catalog/AI tests.
- Member 2: Staff, audit, reports MVC.

Sprint 7 - Integration:
- Member 1: OpenAI/Gemini adapter support.
- Member 2: Storage, email, WebSocket, scheduler, integration tests.

==================================================
GIT BRANCH SUGGESTION
==================================================

Member 1:
- feature/be-mvc-foundation
- feature/be-mvc-auth
- feature/be-mvc-movie
- feature/be-mvc-ai
- feature/be-mvc-showtime

Member 2:
- feature/be-mvc-booking
- feature/be-mvc-payment
- feature/be-mvc-engagement
- feature/be-mvc-operations
- feature/be-mvc-integrations

==================================================
INTEGRATION RULES
==================================================

- Member 1 finishes auth before Member 2 protects booking/payment APIs.
- Member 1 finishes movie/showtime contracts before Member 2 finalizes booking.
- Member 2 can use IDs and repository stubs while waiting for Member 1 modules.
- Use Swagger as API source of truth.
- Use DTO contracts before frontend integration.
- Run tests before merging.
- Discuss before editing shared files: `pom.xml`, `application.yml`, `SecurityConfig`, `GlobalExceptionHandler`.
- Avoid circular service dependencies.

==================================================
DONE CRITERIA
==================================================

MVC module done:
- Model created.
- Repository created.
- DTOs created.
- Mapper created if needed.
- Service implemented.
- Controller implemented.
- Validation implemented.
- Security rules implemented.
- Transaction boundary reviewed.
- Swagger visible.
- Tests added.
- Error response follows common format.

Backend project done:
- Auth works.
- Movie catalog works.
- AI analysis works after approval.
- Showtime and seat map work.
- Booking and payment work.
- QR check-in works.
- Promotion/wishlist/loyalty/notification work.
- Reviews work.
- Staff/audit/reports work.
- Storage/email/WebSocket work.
- Integration tests pass.
