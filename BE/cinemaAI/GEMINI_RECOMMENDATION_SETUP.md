# Thiết lập Gemini API cho Gợi ý Phim Cá nhân hóa

> Hướng dẫn cấu hình **Google Gemini** làm engine re-ranking trong hệ thống gợi ý phim (mục 16.3 – Personalized Movie Recommendations).

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Lấy Gemini API Key](#2-lấy-gemini-api-key)
3. [Cấu hình biến môi trường](#3-cấu-hình-biến-môi-trường)
4. [Chạy ứng dụng với Gemini](#4-chạy-ứng-dụng-với-gemini)
5. [Kiểm tra hoạt động](#5-kiểm-tra-hoạt-động)
6. [Tham số cấu hình](#6-tham-số-cấu-hình)
7. [Luồng dữ liệu chi tiết](#7-luồng-dữ-liệu-chi-tiết)
8. [Xử lý sự cố](#8-xử-lý-sự-cố)

---

## 1. Tổng quan kiến trúc

```
Người dùng
   │
   ▼
RecommendationService
   │  thu thập tín hiệu sở thích:
   │   • Trailer interactions  (16.1)
   │   • Booking history       (16.1)
   │   • Review ratings        (13.5)   ← auto-refresh khi review thay đổi
   │   • Wishlist              (16.1)
   │
   ▼
UserPreferenceProfile  (16.2)
   │  genreScores / actorScores / directorScores / cohortKey
   │
   ▼
RecommendationStrategy  (chọn bởi RecommendationStrategyConfig)
   │
   ├─ app.gemini.enabled=false (mặc định)
   │      └─ MockRecommendationStrategy  – rule-based scoring
   │
   └─ app.gemini.enabled=true
          └─ GeminiRecommendationStrategy
               ├─ Bước 1: MockRecommendationStrategy pre-filter (lấy top 25)
               ├─ Bước 2: Build prompt → gọi Gemini REST API
               ├─ Bước 3: Parse JSON ranking từ Gemini
               └─ Bước 4: Merge lại, fallback về pre-scored nếu lỗi
```

**Không cần Spring AI Gemini dependency** — gọi trực tiếp Google REST API qua OkHttp (đã có sẵn trong pom.xml).

---

## 2. Lấy Gemini API Key

1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Đăng nhập bằng tài khoản Google
3. Nhấn **"Get API key"** → **"Create API key in new project"** (hoặc chọn project có sẵn)
4. Copy API key, ví dụ: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

> **Lưu ý:** Gemini API có Free tier (60 req/phút với `gemini-2.0-flash`). Đủ dùng cho demo.

---

## 3. Cấu hình biến môi trường

### Cách 1 — File `.env` (khuyến nghị cho local dev)

Tạo file `.env` trong thư mục gốc của project (`cinemaAI/`):

```properties
# .env  (không commit file này lên Git)

GEMINI_ENABLED=true
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL=gemini-2.0-flash

# Tùy chọn (có giá trị mặc định)
GEMINI_TEMPERATURE=0.3
GEMINI_MAX_OUTPUT_TOKENS=1024
```

Spring Boot tự đọc file `.env` nhờ cấu hình đã có:
```properties
spring.config.import=optional:file:.env[.properties],...
```

### Cách 2 — Biến môi trường hệ thống (Linux/macOS)

```bash
export GEMINI_ENABLED=true
export GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export GEMINI_MODEL=gemini-2.0-flash
```

### Cách 3 — Biến môi trường hệ thống (Windows PowerShell)

```powershell
$env:GEMINI_ENABLED = "true"
$env:GEMINI_API_KEY  = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
$env:GEMINI_MODEL    = "gemini-2.0-flash"
```

### Cách 4 — JVM arguments

```bash
java -jar cinemaAI.jar \
  -Dapp.gemini.enabled=true \
  -Dapp.gemini.api-key=AIzaSyXXX \
  -Dapp.gemini.model=gemini-2.0-flash
```

### Cách 5 — Docker / Docker Compose

```yaml
# docker-compose.yml
services:
  cinema-api:
    environment:
      - GEMINI_ENABLED=true
      - GEMINI_API_KEY=${GEMINI_API_KEY}  # từ .env của host
      - GEMINI_MODEL=gemini-2.0-flash
```

---

## 4. Chạy ứng dụng với Gemini

```bash
# 1. Đảm bảo file .env đã có GEMINI_ENABLED=true và GEMINI_API_KEY
cd cinemaAI

# 2. Build và chạy
mvn spring-boot:run

# Kiểm tra log khởi động — sẽ thấy:
# INFO  RecommendationStrategyConfig : Recommendation strategy: GEMINI-ENHANCED (with rule-based fallback)
```

Khi `GEMINI_ENABLED=false` (mặc định):
```
INFO  RecommendationStrategyConfig : Recommendation strategy: RULE-BASED (Gemini disabled)
```

---

## 5. Kiểm tra hoạt động

### 5.1 Lấy gợi ý phim (user)

```http
GET /api/v1/recommendations/movies?limit=10
Authorization: Bearer <JWT_TOKEN>
```

Response khi Gemini active sẽ có `reasons` bắt đầu bằng `"AI: ..."`:
```json
[
  {
    "movieId": 12,
    "title": "Inception",
    "score": 73.5,
    "reasons": ["AI: Matches thriller/sci-fi taste, Christopher Nolan fan"]
  },
  ...
]
```

### 5.2 Xem profile sở thích

```http
GET /api/v1/recommendations/preferences/me
Authorization: Bearer <JWT_TOKEN>
```

### 5.3 Gợi ý theo diễn viên yêu thích

```http
GET /api/v1/recommendations/favorite-actors?limit=5
Authorization: Bearer <JWT_TOKEN>
```

### 5.4 Debug (Admin)

```http
GET /api/v1/admin/recommendations/users/{userId}/debug?limit=10
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

Response bao gồm `profile`, số lượng trailer interactions, bookings, reviews, và danh sách phim gợi ý.

---

## 6. Tham số cấu hình

| Biến môi trường          | Property Spring                | Mặc định           | Mô tả                                         |
|--------------------------|--------------------------------|--------------------|-----------------------------------------------|
| `GEMINI_ENABLED`         | `app.gemini.enabled`           | `false`            | Bật/tắt Gemini re-ranking                     |
| `GEMINI_API_KEY`         | `app.gemini.api-key`           | *(trống)*          | API key từ Google AI Studio                   |
| `GEMINI_MODEL`           | `app.gemini.model`             | `gemini-2.0-flash` | Tên model Gemini                              |
| `GEMINI_TEMPERATURE`     | `app.gemini.temperature`       | `0.3`              | Độ ngẫu nhiên (0.0–1.0, thấp = nhất quán hơn)|
| `GEMINI_MAX_OUTPUT_TOKENS`| `app.gemini.max-output-tokens`| `1024`             | Giới hạn token đầu ra                         |

### Models được hỗ trợ

| Model                    | Đặc điểm                              | Phù hợp               |
|--------------------------|---------------------------------------|-----------------------|
| `gemini-2.0-flash`       | Nhanh, rẻ, miễn phí tier              | Demo, production nhỏ  |
| `gemini-1.5-flash`       | Cân bằng tốc độ/chất lượng            | Production            |
| `gemini-1.5-pro`         | Chất lượng cao, chậm hơn              | Chất lượng cao        |

---

## 7. Luồng dữ liệu chi tiết

### 7.1 Thu thập tín hiệu sở thích (16.1)

| Tín hiệu           | Nguồn                           | Trọng số     |
|--------------------|---------------------------------|--------------|
| Trailer COMPLETE   | `POST /trailer-interactions`    | +5.0         |
| Trailer VIEW       | `POST /trailer-interactions`    | +1.0–5.0     |
| Trailer CLICK      | `POST /trailer-interactions`    | +1.0         |
| Trailer SKIP       | `POST /trailer-interactions`    | -1.0         |
| Booking PAID/USED  | Tự động sau thanh toán          | +4.0         |
| Wishlist           | `POST /wishlist`                | +3.0         |
| Review rating ≥ 4  | `POST /reviews`                 | rating × 1.5 |
| Review rating < 4  | `POST /reviews`                 | rating − 3.0 |

### 7.2 Hồ sơ sở thích (16.2)

Sau mỗi tín hiệu, `UserPreferenceProfile` được cập nhật:
- `genreScores`: điểm theo genre ID
- `actorScores`: điểm theo actor ID
- `directorScores`: điểm theo tên đạo diễn
- `cohortKey`: nhóm người dùng (vd: `"action-fan"`, `"drama-fan"`)

### 7.3 Quy trình re-ranking Gemini (16.3)

```
1. Lấy profile → buildContext(genreScores, actorScores, directorScores)
2. MockStrategy pre-filter → top 25 candidates có điểm > 0
3. Build prompt:
     - User taste profile (top 6 genres, top 5 actors, top 4 directors)
     - Movie candidates (id | title | genres | director | mô tả ngắn)
4. POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
5. Parse JSON array: [{id: X, reason: "..."}, ...]
6. Merge: Gemini ranking + RANK_BONUS (50 điểm → giảm dần)
7. Fallback về pre-scored nếu Gemini lỗi/timeout
```

### 7.4 Tác động của Review đến Recommendation (13.5)

```
User POST /reviews → ReviewService.createReview()
   └─ (sau khi lưu) → recommendationService.refreshProfileAsync(email)  [@Async]
         └─ Thu thập lại tất cả tín hiệu → cập nhật UserPreferenceProfile
```

---

## 8. Xử lý sự cố

### Lỗi: Gemini không được gọi dù đã bật

Kiểm tra log:
```
WARN  GeminiChatService : Gemini API key is not configured (app.gemini.api-key). Gemini calls will be skipped.
```

→ Kiểm tra `GEMINI_API_KEY` đã được set đúng chưa.

### Lỗi: HTTP 400 từ Gemini

```
WARN  GeminiChatService : Gemini API returned HTTP 400: ...
```

→ Thường do API key sai hoặc tên model không hợp lệ. Kiểm tra `GEMINI_MODEL`.

### Lỗi: HTTP 429 (Rate limit)

Free tier: 60 requests/phút. Nếu demo nhiều user cùng lúc, hạ `limit` trong request xuống 5–10.

### Gemini trả về kết quả không đúng format JSON

Hệ thống tự phát hiện và fallback về rule-based kết quả. Log sẽ hiển thị:
```
WARN  GeminiRecommendationStrategy : Failed to parse Gemini recommendation response: ...
```

→ Không ảnh hưởng đến chức năng, chỉ dùng rule-based thay thế.

### Recommendations không thay đổi dù đã bật Gemini

Thực hiện refresh profile thủ công:
```http
POST /api/v1/recommendations/preferences/refresh
Authorization: Bearer <JWT_TOKEN>
```

---

## Tóm tắt nhanh (Quick Start)

```bash
# 1. Tạo file .env tại thư mục cinemaAI/
cat > .env << 'EOF'
GEMINI_ENABLED=true
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL=gemini-2.0-flash
EOF

# 2. Chạy ứng dụng
mvn spring-boot:run

# 3. Kiểm tra
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/recommendations/movies?limit=5
```
