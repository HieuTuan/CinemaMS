# POSTMAN API - PHASE 8: PROMOTION, WISHLIST, LOYALTY & NOTIFICATION

> Base URL: `http://localhost:8080`
> Auth: Bearer `{{accessToken}}` (lấy từ POST /api/v1/auth/login)

---

## PROMOTION SERVICE

### Admin CRUD

#### 01 - Admin Create Promotion (Code-Based)
**POST** `/api/v1/admin/promotions`
```json
{
  "code": "SUMMER2026",
  "name": "Summer Sale 2026",
  "type": "PERCENTAGE",
  "value": 15,
  "minOrderAmount": 100000,
  "maxDiscountAmount": 50000,
  "usageLimit": 100,
  "startsAt": "2026-06-01T00:00:00",
  "endsAt": "2026-09-30T23:59:59",
  "canCombineWithPoints": true,
  "description": "Giảm 15% tối đa 50k cho đơn từ 100k"
}
```

#### 02 - Admin Create Point-Redemption Promotion
**POST** `/api/v1/admin/promotions/point-based`
```json
{
  "code": "POINTS500",
  "name": "Đổi 500 điểm lấy 50k",
  "type": "FIXED_AMOUNT",
  "value": 50000,
  "minOrderAmount": 150000,
  "usageLimit": 200,
  "startsAt": "2026-06-01T00:00:00",
  "endsAt": "2026-12-31T23:59:59",
  "canCombineWithPoints": false,
  "requiredPoints": 500,
  "description": "Dùng 500 điểm tích lũy để giảm 50.000đ"
}
```

#### 03 - Admin Update Promotion
**PUT** `/api/v1/admin/promotions/{id}`
```json
{
  "name": "Summer Sale Updated",
  "value": 20,
  "minOrderAmount": 150000,
  "maxDiscountAmount": 60000,
  "usageLimit": 150,
  "endsAt": "2026-10-05T23:59:59",
  "status": "ACTIVE",
  "canCombineWithPoints": true,
  "description": "Cập nhật: giảm 20% tối đa 60k"
}
```

#### 04 - Admin Delete Promotion
**DELETE** `/api/v1/admin/promotions/{id}`

#### 05 - Admin List Promotions (Phân trang)
**GET** `/api/v1/admin/promotions?page=0&size=20`

#### 06 - Admin Get Promotion By Code
**GET** `/api/v1/admin/promotions/{code}`
> Ví dụ: `/api/v1/admin/promotions/SUMMER2026`

#### 07 - Admin Get Promotion Rules
**GET** `/api/v1/admin/promotions/{id}/rules`
> Trả về toàn bộ rule-set: min order, max discount, usage, date range, combination flags.

---

### Customer Endpoints

#### 08 - Get Promotion By Code
**GET** `/api/v1/promotions/{code}`
> Ví dụ: `/api/v1/promotions/SUMMER2026`

#### 09 - Get Available Promotions
**GET** `/api/v1/promotions/available`
> Trả về tất cả promotions đang ACTIVE và trong thời hạn.

#### 10 - Get Point-Based Promotions
**GET** `/api/v1/promotions/point-based`
> Trả về các promotion yêu cầu loyalty points.

#### 11 - Validate / Preview Promotion (Legacy)
**POST** `/api/v1/promotions/validate`
```json
{
  "code": "SUMMER2026",
  "orderAmount": 200000
}
```

#### 12 - Validate Advanced (Code-Based)
**POST** `/api/v1/promotions/validate-advanced`
```json
{
  "code": "SUMMER2026",
  "orderAmount": 200000
}
```

#### 13 - Validate Advanced (Point-Based)
**POST** `/api/v1/promotions/validate-advanced`
```json
{
  "promotionId": 2,
  "orderAmount": 200000,
  "usePoints": 500
}
```

#### 14 - Validate Advanced + Combination Check
**POST** `/api/v1/promotions/validate-advanced`
```json
{
  "code": "SUMMER2026",
  "orderAmount": 300000,
  "otherPromotionId": 2
}
```

#### 15 - Check Combination Compatibility
**POST** `/api/v1/promotions/check-combination`
```json
{
  "promotionId1": 1,
  "promotionId2": 2
}
```

#### 16 - Apply Promotion To Booking (Code-Based)
**POST** `/api/v1/promotions/apply?bookingId=1&code=SUMMER2026`

#### 17 - Apply Point-Based Promotion To Booking
**POST** `/api/v1/promotions/apply-points?bookingId=1&promotionId=2&pointsToUse=500`

#### 18 - Remove Promotion From Booking
**DELETE** `/api/v1/promotions/remove?bookingId=1`

---

## WISHLIST SERVICE

#### 19 - Add Movie To Wishlist
**POST** `/api/v1/wishlist`
> Auth: USER (lấy userId từ JWT, không truyền qua body)
```json
{
  "movieId": 1
}
```

#### 20 - Get My Wishlist
**GET** `/api/v1/wishlist`
> Auth: USER

#### 21 - Remove Movie From Wishlist
**DELETE** `/api/v1/wishlist/{movieId}`
> Auth: USER. Ví dụ: `/api/v1/wishlist/1`

---

## LOYALTY SERVICE

#### 22 - Get My Loyalty Points
**GET** `/api/v1/loyalty/me`
> Auth: USER. Tự tạo record điểm=0 nếu lần đầu truy cập.

#### 23 - Admin Add Loyalty Points
**POST** `/api/v1/admin/loyalty/add`
> Auth: ADMIN
```json
{
  "userId": 1,
  "points": 100,
  "reason": "Welcome bonus"
}
```

#### 24 - Admin Redeem Loyalty Points
**POST** `/api/v1/admin/loyalty/{userId}/redeem?points=50`
> Auth: ADMIN. Ví dụ: `/api/v1/admin/loyalty/1/redeem?points=50`

---

## NOTIFICATION SERVICE

#### 25 - Admin Create Notification
**POST** `/api/v1/notifications`
> Auth: ADMIN (`@PreAuthorize("hasRole('ADMIN')")`)
```json
{
  "userId": 1,
  "title": "Phim mới sắp chiếu",
  "message": "Avatar 3 mở bán vé từ 01/07/2026, đặt chỗ ngay!",
  "type": "SHOWTIME"
}
```

> **type** có thể là: `SYSTEM` | `PROMOTION` | `SHOWTIME` | `BOOKING` | `PAYMENT` | `MOVIE`

#### 26 - Get My Notifications
**GET** `/api/v1/notifications/me`
> Auth: USER. Trả về tất cả thông báo, mới nhất trước.

#### 27 - Get My Unread Notifications
**GET** `/api/v1/notifications/me/unread`
> Auth: USER. Chỉ trả về thông báo chưa đọc (`isRead = false`).

#### 28 - Mark Notification As Read
**PATCH** `/api/v1/notifications/{id}/read`
> Auth: USER. Idempotent — nếu đã đọc rồi, trả về state hiện tại.
> Ví dụ: `/api/v1/notifications/3/read`

---

## SWAGGER TEST FLOW

### Flow 1 — Promotion Code-Based
```
1. POST /auth/login          → lấy accessToken
2. POST /admin/promotions    → tạo SUMMER2026 (ADMIN)
3. GET  /promotions/available → xác nhận có trong danh sách
4. POST /promotions/validate-advanced { code, orderAmount } → preview discount
5. POST /promotions/apply?bookingId=1&code=SUMMER2026 → áp dụng vào booking
6. DELETE /promotions/remove?bookingId=1 → gỡ nếu cần
```

### Flow 2 — Promotion Point-Based
```
1. POST /admin/promotions/point-based  → tạo POINTS500 (requiredPoints: 500)
2. GET  /promotions/point-based        → verify xuất hiện trong list
3. POST /promotions/validate-advanced  { promotionId, orderAmount, usePoints: 500 }
4. POST /promotions/apply-points?bookingId=1&promotionId=2&pointsToUse=500
```

### Flow 3 — Combination Check
```
1. POST /promotions/check-combination { promotionId1: 1, promotionId2: 2 }
   → canCombine: true/false + reason
2. POST /promotions/validate-advanced { code, orderAmount, otherPromotionId: 2 }
   → isValid: true/false + validationErrors nếu không combine được
```

### Flow 4 — Wishlist
```
1. POST /wishlist { movieId: 1 }   → 201 Created
2. GET  /wishlist                   → thấy phim vừa thêm
3. POST /wishlist { movieId: 1 }   → 409 Conflict (đã có)
4. DELETE /wishlist/1               → 204 No Content
5. GET  /wishlist                   → danh sách trống
```

### Flow 5 — Loyalty
```
1. GET  /loyalty/me                          → points: 0, totalPoints: 0
2. POST /admin/loyalty/add { userId, points: 100, reason: "..." } → points: 100
3. GET  /loyalty/me                          → points: 100, totalPoints: 100
4. POST /admin/loyalty/1/redeem?points=30    → points: 70, totalPoints: 100
```

### Flow 6 — Notification
```
1. POST /notifications { userId, title, message, type: "SHOWTIME" }
2. GET  /notifications/me          → thấy thông báo mới, isRead: false
3. GET  /notifications/me/unread   → thấy 1 thông báo chưa đọc
4. PATCH /notifications/1/read     → isRead: true
5. GET  /notifications/me/unread   → danh sách trống (đã đọc hết)
```
