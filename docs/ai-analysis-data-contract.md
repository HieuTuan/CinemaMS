# Đặc tả dữ liệu trang Admin - Phân tích AI phim

Tài liệu này gom toàn bộ số liệu UI cần để hiển thị trang `/admin/ai-analysis`. Backend có thể dùng làm data contract khi xây API cho FE.

## 1. Mục tiêu màn hình

Trang AI cần hiển thị:

- Số liệu tổng quan admin ở đầu trang.
- Thông tin trạng thái sidebar/admin session.
- Danh sách phim để chọn phân tích.
- Chi tiết phân tích AI của 1 phim đang chọn.
- Biểu đồ cảm xúc theo timeline.
- Nhãn nội dung, cảnh tiêu biểu, tóm tắt AI.
- Trạng thái phân tích, thao tác phân tích lại và phê duyệt/xuất bản.

## 2. Endpoint đề xuất

### 2.1. Lấy toàn bộ dữ liệu trang AI

```http
GET /api/v1/admin/ai-analysis/dashboard
Authorization: Bearer <accessToken>
```

Response trả về đủ dữ liệu để render trang lần đầu.

### 2.2. Lấy chi tiết AI của một phim

```http
GET /api/v1/admin/ai-analysis/movies/{movieId}
Authorization: Bearer <accessToken>
```

Response trả về `selectedAnalysis`.

### 2.3. Yêu cầu phân tích lại

```http
POST /api/v1/admin/ai-analysis/movies/{movieId}/reanalyze
Authorization: Bearer <accessToken>
```

Response nên trả về job hiện tại hoặc kết quả mới nếu xử lý đồng bộ.

### 2.4. Phê duyệt và xuất bản điểm AI

```http
POST /api/v1/admin/ai-analysis/movies/{movieId}/publish
Authorization: Bearer <accessToken>
```

Response trả về trạng thái publish mới.

## 3. Query/Param cần hỗ trợ

| API | Param | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- | --- |
| `GET /dashboard` | `movieId` | string/number | Không | Nếu có thì chọn sẵn phim đó |
| `GET /dashboard` | `includeAuditLogs` | boolean | Không | Mặc định `true` |
| `GET /movies/{movieId}` | `movieId` | string/number | Có | ID phim |
| `POST /reanalyze` | `movieId` | string/number | Có | ID phim cần chạy lại AI |
| `POST /publish` | `movieId` | string/number | Có | ID phim cần public kết quả |

## 4. Cấu trúc response tổng

```json
{
  "adminSession": {},
  "overviewMetrics": {},
  "auditLog": {},
  "movieOptions": [],
  "selectedAnalysis": {}
}
```

## 5. `adminSession`

Dữ liệu hiển thị ở sidebar bên trái.

| Field | Kiểu | Bắt buộc | Ví dụ | Ghi chú |
| --- | --- | --- | --- | --- |
| `adminId` | string | Có | `CP-99210-ADMIN` | ID quản trị viên |
| `displayName` | string | Có | `Quản trị viên` | Tên hiển thị |
| `avatarInitial` | string | Không | `A` | Chữ trong ô avatar |
| `environment` | string | Có | `PRODUCTION` | Môi trường hiện tại |
| `serverHealthPercent` | number | Có | `99.8` | Hiển thị `99.8% ONLINE` |
| `category` | string | Có | `ADMIN` | Hạng mục |
| `databaseSyncStatus` | string | Có | `OK` | Trạng thái đồng bộ DB |
| `cloudRunCoresActive` | number | Có | `4` | Hiển thị `04 Active` |

## 6. `overviewMetrics`

4 thẻ số liệu phía trên màn hình.

| Field | Kiểu | Bắt buộc | Ví dụ | Ghi chú |
| --- | --- | --- | --- | --- |
| `linkedRevenue` | number | Có | `42450000` | Tổng doanh thu liên kết, đơn vị VND |
| `linkedRevenueGrowthPercent` | number | Có | `12.4` | So với tuần trước |
| `ticketOutputCount` | number | Có | `342` | Sản lượng vé xuất xưởng |
| `newTicketCount` | number | Không | `48` | Số vé mới |
| `fillRatePercent` | number | Có | `78.4` | Hệ số lấp đầy rạp |
| `optimizationWarning` | string | Không | `KHUNG GIỜ VÀNG QUÁ TẢI` | Cảnh báo tối ưu |
| `movieLibraryCount` | number | Có | `3` | Tổng số tác phẩm |
| `upcomingMovieCount` | number | Có | `1` | Phim sắp chiếu |
| `showingMovieCount` | number | Có | `2` | Phim đang chiếu |

## 7. `auditLog`

Dòng nhật ký ngắn phía trên panel AI.

| Field | Kiểu | Bắt buộc | Ví dụ |
| --- | --- | --- | --- |
| `time` | string | Có | `03:15:02` |
| `action` | string | Có | `Khởi tạo hệ thống` |
| `target` | string | Có | `Cơ sở dữ liệu CinePremier v2.0` |
| `actor` | string | Có | `Quản trị viên` |

## 8. `movieOptions`

Danh sách phim trong dropdown "Chọn phim khảo sát".

| Field | Kiểu | Bắt buộc | Ví dụ |
| --- | --- | --- | --- |
| `id` | string/number | Có | `weekend-laughs` |
| `title` | string | Có | `Weekend Laughs` |

## 9. `selectedAnalysis`

Chi tiết phim và kết quả AI đang hiển thị.

### 9.1. Metadata phim

| Field | Kiểu | Bắt buộc | Ví dụ | Ghi chú |
| --- | --- | --- | --- | --- |
| `movieId` | string/number | Có | `weekend-laughs` | ID phim |
| `title` | string | Có | `Weekend Laughs` | Tên phim |
| `englishTitle` | string | Không | `Weekend Laughs` | Tiêu đề quốc tế |
| `primaryGenre` | string | Có | `COMEDY` | Chip thể loại chính |
| `genres` | string[] | Có | `["COMEDY"]` | Danh sách thể loại |
| `ageRating` | string | Có | `P` | Nhãn độ tuổi |
| `durationMinutes` | number | Có | `96` | Thời lượng |
| `releaseDate` | string | Có | `2026-06-07` | ISO date |
| `releaseDateLabel` | string | Không | `Dự kiến: 2026-06-07` | FE có thể tự format nếu không trả |
| `country` | string | Có | `Việt Nam` | Quốc gia |
| `subtitle` | string | Có | `EN Sub` | Phụ đề |
| `isHot` | boolean | Không | `false` | Hiện chấm ping/mở bán trước |

### 9.2. Điểm AI analytics

| Field | Kiểu | Bắt buộc | Ví dụ | Rule |
| --- | --- | --- | --- | --- |
| `scores.overall` | number | Có | `8.8` | 1.0 - 10.0 |
| `scores.story` | number | Có | `8.6` | 1.0 - 10.0 |
| `scores.acting` | number | Có | `8.5` | 1.0 - 10.0 |
| `scores.visual` | number | Có | `8.8` | 1.0 - 10.0 |
| `scores.audio` | number | Có | `8.7` | 1.0 - 10.0 |
| `scores.modelVersion` | string | Có | `CineAI Engine v4.2 PRO` | Dòng footer |
| `scores.status` | enum | Có | `COMPLETED` | `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `PUBLISHED` |
| `scores.lastAnalyzedAt` | datetime | Không | `2026-05-28T10:15:02Z` | Lần phân tích gần nhất |

### 9.3. Khán giả mục tiêu

UI hiện 2 nhóm khán giả. Backend nên trả mảng để mở rộng.

| Field | Kiểu | Bắt buộc | Ví dụ |
| --- | --- | --- | --- |
| `targetAudiences[].title` | string | Có | `Thành niên trẻ (18 - 35 tuổi)` |
| `targetAudiences[].description` | string | Có | `Mức độ lan truyền... đạt 94%...` |
| `targetAudiences[].matchPercent` | number | Không | `94` |
| `targetAudiences[].icon` | string | Không | `users` |

### 9.4. Biểu đồ cảm xúc `emotionTimeline`

Biểu đồ cần 3 series:

- `tension`: căng thẳng, màu đỏ/hồng.
- `sadness`: bi kịch/buồn, màu cyan.
- `excitement`: hào hứng, màu hồng/tím.

| Field | Kiểu | Bắt buộc | Ví dụ | Ghi chú |
| --- | --- | --- | --- | --- |
| `emotionTimeline.durationMinutes` | number | Có | `120` | Trục X |
| `emotionTimeline.markers` | number[] | Có | `[0, 30, 60, 90, 120]` | Mốc phút hiển thị |
| `emotionTimeline.series[].key` | string | Có | `tension` | Key cố định |
| `emotionTimeline.series[].label` | string | Có | `Căng thẳng` | Label legend |
| `emotionTimeline.series[].color` | string | Không | `#f43f5e` | FE có thể dùng theme |
| `emotionTimeline.series[].points[].minute` | number | Có | `92` | Mốc phút |
| `emotionTimeline.series[].points[].value` | number | Có | `87` | 0 - 100 |
| `emotionTimeline.peak.minute` | number | Có | `92` | Tooltip cao trào |
| `emotionTimeline.peak.title` | string | Có | `MỐC CAO TRÀO [92 PHÚT]` | Tooltip |
| `emotionTimeline.peak.tensionPercent` | number | Không | `87` | Tooltip |
| `emotionTimeline.peak.excitementPercent` | number | Không | `95` | Tooltip |
| `emotionTimeline.peak.description` | string | Có | `Phân cảnh đảo chiều` | Tooltip |

### 9.5. Tóm tắt AI

| Field | Kiểu | Bắt buộc | Ví dụ |
| --- | --- | --- | --- |
| `summary.title` | string | Có | `Tóm tắt thủ thuật quang học AI` |
| `summary.content` | string | Có | Đoạn mô tả dài |

### 9.6. Nhãn nội dung AI

| Field | Kiểu | Bắt buộc | Ví dụ |
| --- | --- | --- | --- |
| `contentTags` | string[] | Có | `["Visual_Peak", "Căng_Não", "Âm_thanh_vòm"]` |

### 9.7. Cảnh quay đặc trưng

| Field | Kiểu | Bắt buộc | Ví dụ |
| --- | --- | --- | --- |
| `featuredScenes[].sceneCode` | string | Có | `Cảnh 42` |
| `featuredScenes[].title` | string | Có | `Visual Peak` |
| `featuredScenes[].description` | string | Có | `Thị giác` |
| `featuredScenes[].minute` | number | Không | `42` |
| `featuredScenes[].thumbnailUrl` | string | Không | URL ảnh |

### 9.8. Trạng thái thao tác

| Field | Kiểu | Bắt buộc | Ví dụ |
| --- | --- | --- | --- |
| `actions.canReanalyze` | boolean | Có | `true` |
| `actions.canPublish` | boolean | Có | `true` |
| `actions.publishStatus` | enum | Có | `DRAFT` |
| `actions.lastPublishedAt` | datetime/null | Không | `null` |

## 10. Response mẫu đầy đủ

```json
{
  "adminSession": {
    "adminId": "CP-99210-ADMIN",
    "displayName": "Quản trị viên",
    "avatarInitial": "A",
    "environment": "PRODUCTION",
    "serverHealthPercent": 99.8,
    "category": "ADMIN",
    "databaseSyncStatus": "OK",
    "cloudRunCoresActive": 4
  },
  "overviewMetrics": {
    "linkedRevenue": 42450000,
    "linkedRevenueGrowthPercent": 12.4,
    "ticketOutputCount": 342,
    "newTicketCount": 48,
    "fillRatePercent": 78.4,
    "optimizationWarning": "KHUNG GIỜ VÀNG QUÁ TẢI",
    "movieLibraryCount": 3,
    "upcomingMovieCount": 1,
    "showingMovieCount": 2
  },
  "auditLog": {
    "time": "03:15:02",
    "action": "Khởi tạo hệ thống",
    "target": "Cơ sở dữ liệu CinePremier v2.0",
    "actor": "Quản trị viên"
  },
  "movieOptions": [
    {
      "id": "weekend-laughs",
      "title": "Weekend Laughs"
    },
    {
      "id": "neon-horizon",
      "title": "Neon Horizon"
    }
  ],
  "selectedAnalysis": {
    "movieId": "weekend-laughs",
    "title": "Weekend Laughs",
    "englishTitle": "Weekend Laughs",
    "primaryGenre": "COMEDY",
    "genres": ["COMEDY"],
    "ageRating": "P",
    "durationMinutes": 96,
    "releaseDate": "2026-06-07",
    "releaseDateLabel": "Dự kiến: 2026-06-07",
    "country": "Việt Nam",
    "subtitle": "EN Sub",
    "isHot": false,
    "scores": {
      "overall": 8.8,
      "story": 8.6,
      "acting": 8.5,
      "visual": 8.8,
      "audio": 8.7,
      "modelVersion": "CineAI Engine v4.2 PRO",
      "status": "COMPLETED",
      "lastAnalyzedAt": "2026-05-28T10:15:02Z"
    },
    "targetAudiences": [
      {
        "title": "Thành niên trẻ (18 - 35 tuổi)",
        "description": "Mức độ lan truyền và tỷ lệ nhận thức nội dung đạt 94% thông qua các kênh số.",
        "matchPercent": 94,
        "icon": "users"
      },
      {
        "title": "Fan thể loại hài và giải trí nhẹ",
        "description": "Phù hợp nhóm khách hàng cần trải nghiệm thư giãn, dễ chia sẻ trên mạng xã hội.",
        "matchPercent": 88,
        "icon": "sparkles"
      }
    ],
    "emotionTimeline": {
      "durationMinutes": 120,
      "markers": [0, 30, 60, 90, 120],
      "series": [
        {
          "key": "tension",
          "label": "Căng thẳng",
          "color": "#f43f5e",
          "points": [
            { "minute": 0, "value": 20 },
            { "minute": 30, "value": 65 },
            { "minute": 60, "value": 35 },
            { "minute": 90, "value": 72 },
            { "minute": 120, "value": 58 }
          ]
        },
        {
          "key": "sadness",
          "label": "Bi kịch / Buồn",
          "color": "#06b6d4",
          "points": [
            { "minute": 0, "value": 40 },
            { "minute": 30, "value": 18 },
            { "minute": 60, "value": 68 },
            { "minute": 90, "value": 42 },
            { "minute": 120, "value": 24 }
          ]
        },
        {
          "key": "excitement",
          "label": "Hào hứng",
          "color": "#ec4899",
          "points": [
            { "minute": 0, "value": 8 },
            { "minute": 30, "value": 78 },
            { "minute": 60, "value": 35 },
            { "minute": 90, "value": 70 },
            { "minute": 120, "value": 95 }
          ]
        }
      ],
      "peak": {
        "minute": 92,
        "title": "MỐC CAO TRÀO [92 PHÚT]",
        "tensionPercent": 87,
        "excitementPercent": 95,
        "description": "Phân cảnh đảo chiều"
      }
    },
    "summary": {
      "title": "Tóm tắt thủ thuật quang học AI",
      "content": "Tác phẩm \"Weekend Laughs\" đã được mô hình máy học kiểm định cấu trúc phân kịch. Hệ thống đánh giá cao nhịp dẫn, khả năng giữ chân khán giả và mức độ lan truyền trong nhóm khách hàng trẻ."
    },
    "contentTags": [
      "Visual_Peak",
      "Căng_Não",
      "Âm_thanh_vòm",
      "Phản_ứng_bùng_nổ"
    ],
    "featuredScenes": [
      {
        "sceneCode": "Cảnh 42",
        "title": "Visual Peak",
        "description": "Thị giác",
        "minute": 42,
        "thumbnailUrl": null
      },
      {
        "sceneCode": "Cảnh 105",
        "title": "Emotion High",
        "description": "Cao trào",
        "minute": 105,
        "thumbnailUrl": null
      },
      {
        "sceneCode": "Cảnh 13",
        "title": "Atmospheric",
        "description": "Mở màn",
        "minute": 13,
        "thumbnailUrl": null
      }
    ],
    "actions": {
      "canReanalyze": true,
      "canPublish": true,
      "publishStatus": "DRAFT",
      "lastPublishedAt": null
    }
  }
}
```

## 11. Mapping nhanh với FE hiện tại

| FE hiện tại | BE nên trả |
| --- | --- |
| `moviesList` dropdown | `movieOptions` |
| `m.title` | `selectedAnalysis.title` |
| `m.englishTitle` | `selectedAnalysis.englishTitle` |
| `m.genre[0]` | `selectedAnalysis.primaryGenre` |
| `m.ageRating` | `selectedAnalysis.ageRating` |
| `m.duration` | `selectedAnalysis.durationMinutes` |
| `m.releaseDate` | `selectedAnalysis.releaseDate` |
| `m.ratings.aiOverall` | `selectedAnalysis.scores.overall` |
| `m.ratings.aiStory` | `selectedAnalysis.scores.story` |
| `m.ratings.aiActing` | `selectedAnalysis.scores.acting` |
| `m.ratings.aiVisual` | `selectedAnalysis.scores.visual` |
| `m.ratings.aiAudio` | `selectedAnalysis.scores.audio` |
| `m.aiAnalysisTags` | `selectedAnalysis.contentTags` |
| hard-code chart SVG | `selectedAnalysis.emotionTimeline` |
| hard-code cảnh 42/105/13 | `selectedAnalysis.featuredScenes` |
| hard-code summary | `selectedAnalysis.summary.content` |

## 12. Rule hiển thị quan trọng

- Tất cả điểm AI dùng số thập phân 1 chữ số, range `1.0` đến `10.0`.
- Tất cả phần trăm dùng range `0` đến `100`.
- `releaseDate` nên là ISO `YYYY-MM-DD`.
- `lastAnalyzedAt` và `lastPublishedAt` nên là ISO datetime.
- Nếu `scores.status = RUNNING`, FE hiển thị loading cho gauge và biểu đồ.
- Nếu `publishStatus = PUBLISHED`, nút phê duyệt có thể disable hoặc đổi thành "Đã xuất bản".
- `emotionTimeline.series[].points` nên có ít nhất 5 điểm để vẽ mượt.
- `contentTags` không cần có dấu `#`; FE sẽ tự thêm khi render.
