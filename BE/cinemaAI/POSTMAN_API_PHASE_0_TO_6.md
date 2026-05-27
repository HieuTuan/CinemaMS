Auth

01 - Register
POST /api/v1/auth/register
Tạo tài khoản mới. Mặc định user mới thường có role CUSTOMER và nhận emailVerificationToken.

02 - Verify Email
POST /api/v1/auth/verify-email
Xác minh email bằng token nhận được sau khi register.

03 - Login
POST /api/v1/auth/login
Đăng nhập, trả về accessToken, refreshToken, thông tin user và roles.

04 - Refresh Token
POST /api/v1/auth/refresh
Dùng refreshToken để lấy accessToken mới khi token cũ hết hạn.

05 - Logout
POST /api/v1/auth/logout
Đăng xuất, vô hiệu hóa refresh token.

06 - Request Password Reset
POST /api/v1/auth/password-reset/request
Tạo token reset password cho email được gửi lên.

07 - Confirm Password Reset
POST /api/v1/auth/password-reset/confirm
Dùng reset token để đặt lại mật khẩu mới.

08 - Get My Profile
GET /api/v1/users/me
Lấy thông tin tài khoản hiện tại từ Bearer token.

09 - Update My Profile
PUT /api/v1/users/me
Cập nhật fullName, phone của tài khoản hiện tại.

Admin User

10 - Admin Get Users
GET /api/v1/admin/users
Admin xem danh sách toàn bộ users.

11 - Admin Get User Detail
GET /api/v1/admin/users/{userId}
Admin xem chi tiết một user theo id.

12 - Admin Update User Status
PATCH /api/v1/admin/users/{userId}/status
Admin đổi trạng thái user, ví dụ ACTIVE, DISABLED.

Genre

13 - Public Get Genres
GET /api/v1/genres
Public xem danh sách thể loại phim.

14 - Public Get Genre Detail
GET /api/v1/genres/{genreId}
Public xem chi tiết một genre.

15 - Admin Create Genre
POST /api/v1/admin/genres
Admin tạo thể loại phim mới.

16 - Admin Get Genres
GET /api/v1/admin/genres
Admin xem danh sách genre.

17 - Admin Get Genre Detail
GET /api/v1/admin/genres/{genreId}
Admin xem chi tiết genre.

18 - Admin Update Genre
PUT /api/v1/admin/genres/{genreId}
Admin cập nhật tên/mô tả genre.

19 - Admin Delete Genre
DELETE /api/v1/admin/genres/{genreId}
Admin xóa genre. Không nên xóa nếu genre đang dùng cho movie test.

Movie

20 - Public Search Movies
GET /api/v1/movies
Public tìm kiếm/lọc phim theo keyword, status, genre, ngày, phân trang.

21 - Public Get Movie Detail
GET /api/v1/movies/{movieId}
Public xem chi tiết phim.

22 - Admin Search Movies
GET /api/v1/admin/movies
Admin xem/tìm kiếm tất cả phim, gồm cả phim không public.

23 - Admin Get Movie Detail
GET /api/v1/admin/movies/{movieId}
Admin xem chi tiết phim.

24 - Admin Create Movie
POST /api/v1/admin/movies
Admin tạo phim mới, có thể gán nhiều genre bằng genreIds.

25 - Admin Update Movie
PUT /api/v1/admin/movies/{movieId}
Admin cập nhật thông tin phim.

26 - Admin Update Movie Status
PATCH /api/v1/admin/movies/{movieId}/status
Admin đổi trạng thái phim: UPCOMING, NOW_SHOWING, ENDED, INACTIVE.

27 - Admin Delete Movie
DELETE /api/v1/admin/movies/{movieId}
Admin xóa/ẩn phim. Không nên xóa nếu còn test AI/showtime/booking.

AI Analysis

28 - Admin Request Movie Analysis
POST /api/v1/admin/movies/{movieId}/analyses
Admin yêu cầu AI phân tích phim. Hiện dùng mock strategy, trả kết quả analysis.

29 - Admin Get Movie Analyses
GET /api/v1/admin/movies/{movieId}/analyses
Admin xem tất cả analysis của một phim.

30 - Admin Get Analysis Detail
GET /api/v1/admin/analyses/{analysisId}
Admin xem chi tiết analysis.

31 - Admin Regenerate Analysis
POST /api/v1/admin/analyses/{analysisId}/regenerate
Admin tạo lại kết quả phân tích AI.

32 - Admin Approve Analysis
POST /api/v1/admin/analyses/{analysisId}/approve
Admin duyệt analysis. Sau khi approve, public mới xem được analysis.

33 - Admin Reject Analysis
POST /api/v1/admin/analyses/{analysisId}/reject
Admin từ chối analysis.

34 - Public Get Approved Movie Analysis
GET /api/v1/movies/{movieId}/analysis
Public xem analysis đã được APPROVED của phim.

Cinema

35 - Public Get Cinemas
GET /api/v1/cinemas
Public xem danh sách rạp đang active.

36 - Public Get Cinema Detail
GET /api/v1/cinemas/{cinemaId}
Public xem chi tiết rạp.

37 - Public Get Rooms By Cinema
GET /api/v1/cinemas/{cinemaId}/rooms
Public xem danh sách phòng chiếu thuộc một rạp.

38 - Admin Get Cinemas
GET /api/v1/admin/cinemas
Admin xem danh sách rạp.

39 - Admin Get Cinema Detail
GET /api/v1/admin/cinemas/{cinemaId}
Admin xem chi tiết rạp.

40 - Admin Create Cinema
POST /api/v1/admin/cinemas
Admin tạo rạp mới.

41 - Admin Update Cinema
PUT /api/v1/admin/cinemas/{cinemaId}
Admin cập nhật thông tin rạp.

42 - Admin Update Cinema Status
PATCH /api/v1/admin/cinemas/{cinemaId}/status?status=ACTIVE
Admin đổi trạng thái rạp: ACTIVE, INACTIVE.

43 - Admin Delete Cinema
DELETE /api/v1/admin/cinemas/{cinemaId}
Admin xóa rạp. Không nên xóa nếu còn test room/showtime.

Room & Seat

44 - Admin Create Room
POST /api/v1/admin/rooms
Admin tạo phòng chiếu thuộc một cinema.

45 - Admin Get Room Detail
GET /api/v1/admin/rooms/{roomId}
Admin xem chi tiết phòng chiếu.

46 - Admin Get Room Seats
GET /api/v1/admin/rooms/{roomId}/seats
Admin xem danh sách ghế vật lý trong phòng.

47 - Admin Update Room
PUT /api/v1/admin/rooms/{roomId}
Admin cập nhật phòng chiếu.

48 - Admin Update Room Status
PATCH /api/v1/admin/rooms/{roomId}/status?status=ACTIVE
Admin đổi trạng thái phòng: ACTIVE, MAINTENANCE, INACTIVE.

49 - Admin Generate Seats
POST /api/v1/admin/rooms/{roomId}/seats/generate
Sinh ghế tự động theo rowCount, columnCount của room.

Showtime

50 - Public Search Showtimes
GET /api/v1/showtimes
Public tìm suất chiếu theo movie, room hoặc ngày.

51 - Public Get Showtime Detail
GET /api/v1/showtimes/{showtimeId}
Public xem chi tiết suất chiếu.

52 - Public Get Showtime Seat Map
GET /api/v1/showtimes/{showtimeId}/seat-map
Public xem sơ đồ ghế của suất chiếu, gồm trạng thái runtime như AVAILABLE, HOLDING, BOOKED.

53 - Admin Search Showtimes
GET /api/v1/admin/showtimes
Admin xem/tìm danh sách suất chiếu.

54 - Admin Get Showtime Detail
GET /api/v1/admin/showtimes/{showtimeId}
Admin xem chi tiết suất chiếu.

55 - Admin Create Showtime
POST /api/v1/admin/showtimes
Admin tạo suất chiếu. Hệ thống tự tính endTime theo duration phim.

56 - Admin Update Showtime
PUT /api/v1/admin/showtimes/{showtimeId}
Admin cập nhật suất chiếu.

57 - Admin Update Showtime Status
PATCH /api/v1/admin/showtimes/{showtimeId}/status?status=OPEN
Admin đổi trạng thái suất chiếu: SCHEDULED, OPEN, CANCELLED, COMPLETED.

Food

58 - Public Get Food Items
GET /api/v1/foods/items
Public xem danh sách món lẻ đang active.

59 - Public Get Food Combos
GET /api/v1/foods/combos
Public xem danh sách combo đồ ăn đang active.

60 - Admin Get Food Items
GET /api/v1/admin/foods/items
Admin xem tất cả food items.

61 - Admin Get Food Combos
GET /api/v1/admin/foods/combos
Admin xem tất cả food combos.

62 - Admin Create Food Item
POST /api/v1/admin/foods/items
Admin tạo món lẻ, ví dụ popcorn, nước ngọt.

63 - Admin Create Food Combo
POST /api/v1/admin/foods/combos
Admin tạo combo đồ ăn.

64 - Admin Update Food Item
PUT /api/v1/admin/foods/items/{itemId}
Admin cập nhật món lẻ.

65 - Admin Update Food Combo
PUT /api/v1/admin/foods/combos/{comboId}
Admin cập nhật combo.

Booking & Check-in

66 - Customer Hold Seats
POST /api/v1/bookings/hold
Customer giữ ghế tạm thời cho một showtime. Trả về booking status HOLDING.

67 - Customer Create Booking
POST /api/v1/bookings
Customer xác nhận booking từ holdBookingId, có thể thêm food. Hiện flow mock thanh toán và chuyển booking sang PAID.

68 - Customer Get My Bookings
GET /api/v1/bookings
Customer xem danh sách booking của chính mình.

69 - Customer Get Booking Detail
GET /api/v1/bookings/{bookingId}
Customer xem chi tiết một booking của mình.

70 - Customer Cancel Booking
DELETE /api/v1/bookings/{bookingId}
Customer hủy booking, ghế được release.

71 - Staff Check In Ticket
POST /api/v1/staff/check-in
Staff check-in vé bằng qrCode. Cần role STAFF hoặc ADMIN.

72 - Admin Check In Ticket
POST /api/v1/admin/check-in
Admin check-in ve bang qrCode. Sau khi check-in, booking chuyen sang USED.

Auth Add-ons

73 - Google Login
POST /api/v1/auth/google
Dang nhap bang Google ID token tu frontend. Backend verify credential voi Google, tao user moi neu chua ton tai, gan role CUSTOMER va tra ve AuthResponse.
Body:
{
  "credential": "{{google_id_token}}"
}
Env can co:
GOOGLE_CLIENT_ID=<google-web-client-id>

74 - Request Login OTP
POST /api/v1/auth/otp/request
Tao OTP 6 so de dang nhap bang so dien thoai da verify. Hien response tra OTP de tien test Postman; khi co SMS provider thi gui OTP qua SMS.
Body:
{
  "phone": "0900111222"
}

75 - Verify Login OTP
POST /api/v1/auth/otp/verify
Xac thuc OTP dang nhap va tra ve AuthResponse gom accessToken, refreshToken, user va roles.
Body:
{
  "phone": "0900111222",
  "otp": "123456"
}

76 - Verify Phone OTP
POST /api/v1/auth/verify-phone
Xac thuc so dien thoai bang OTP 6 so. Thanh cong se set phoneVerified=true va kich hoat user neu dang pending.
Body:
{
  "phone": "0900111222",
  "otp": "123456"
}

77 - Request My Phone Verification OTP
POST /api/v1/users/me/phone-verification/request
User dang nhap yeu cau tao OTP moi de verify so dien thoai hien tai trong profile.
Header:
Authorization: Bearer {{accessToken}}

Updated Auth OTP Flow

Register now sends an email verification OTP to the registered email when MAIL_ENABLED=true.

Verify Email OTP
POST /api/v1/auth/verify-email
Body:
{
  "email": "customer@gmail.com",
  "otp": "123456"
}

Google Login is now a 2-step flow.

Step 1 - Request Google Login OTP
POST /api/v1/auth/google
Body:
{
  "credential": "{{google_id_token}}"
}

Step 2 - Verify Google Login OTP
POST /api/v1/auth/google/verify
Body:
{
  "email": "customer@gmail.com",
  "otp": "123456"
}
