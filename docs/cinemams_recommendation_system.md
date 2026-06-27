# CinemaMS Recommendation System — Level 2 Machine Learning Version

> Tài liệu tổng hợp hoàn chỉnh cho Recommendation System trong dự án CinemaMS/CinemaAI.
> Phiên bản này tập trung vào **Mức 2: Machine Learning-based Recommendation System**.
> Các công thức trọng số thủ công đã được loại khỏi công thức chính và thay bằng các công thức có cơ sở học thuật.

---

## 1. Tổng quan

Recommendation System trong **CinemaMS/CinemaAI** là module đề xuất phim cá nhân hóa cho khách hàng dựa trên dữ liệu hành vi người dùng và thông tin nội dung phim.

Thay vì hiển thị cùng một danh sách phim cho mọi người dùng, hệ thống phân tích các hành vi như rating, booking, wishlist, trailer watch, click và impression để dự đoán user có khả năng quan tâm hoặc đặt vé phim nào nhất.

```text
CinemaMS
├── Authentication
├── Movie Management
├── Showtime Management
├── Booking
├── Payment
├── Review
├── Wishlist
└── Recommendation System
```

Mục tiêu chính:

```text
Thu thập dữ liệu hành vi user
↓
Tạo feature vector cho từng user-movie pair
↓
Train Machine Learning model
↓
Dự đoán xác suất user quan tâm từng phim
↓
Xếp hạng phim theo predicted score
↓
Trả về danh sách Recommended For You
```

---

## 2. Vấn đề nghiệp vụ cần giải quyết

Trong hệ thống đặt vé xem phim, nếu tất cả user đều thấy cùng một danh sách phim thì trải nghiệm thiếu cá nhân hóa. User có thể mất thời gian tìm phim phù hợp, còn hệ thống chưa tận dụng được dữ liệu sẵn có như booking, rating, wishlist và trailer watch.

Recommendation System giải quyết các vấn đề sau:

```text
User không biết nên xem phim nào
User mất thời gian tìm phim phù hợp
Trang chủ hiển thị phim giống nhau cho mọi user
Phim phù hợp với user nhưng không được chú ý
Hệ thống chưa tận dụng dữ liệu hành vi người dùng
```

Sau khi triển khai, hệ thống có thể:

```text
Gợi ý phim theo sở thích cá nhân
Tăng khả năng click vào phim
Tăng khả năng thêm wishlist
Tăng tỷ lệ đặt vé
Cá nhân hóa khu vực Recommended For You
Tạo dữ liệu để cải thiện model theo thời gian
```

Recommendation System khác với tìm kiếm phim và ranking phim phổ biến:

```text
Movie Search
→ User nhập từ khóa
→ Hệ thống trả phim khớp từ khóa

Popular Movie Ranking
→ Danh sách giống nhau cho mọi user
→ Dựa trên rating, lượt xem hoặc booking count

Recommendation System
→ User không cần nhập từ khóa
→ Hệ thống tự phân tích hành vi
→ Danh sách đề xuất khác nhau cho từng user
```

---

## 3. Phạm vi

Recommendation System không thay thế Movie Management, Booking, Payment, Review hoặc Wishlist. Module này sử dụng dữ liệu từ các module đó để tạo danh sách phim đề xuất.

Phạm vi chính:

```text
Thu thập hành vi user
Ghi nhận recommendation events
Tạo training samples
Train Machine Learning model
Serve model qua ML Service
Spring Boot gọi ML Service để lấy predicted score
Fallback về Content-Based Recommendation nếu ML Service lỗi
Đánh giá chất lượng đề xuất bằng Precision@K, Recall@K và AUC
```

Các module cung cấp dữ liệu:

```text
Movie Management
→ genre, actor, director, metadata, status

Review Module
→ rating và feedback

Booking Module
→ lịch sử đặt vé

Wishlist Module
→ phim user quan tâm

Trailer Watch Tracking
→ thời lượng xem trailer

Showtime Module
→ phim có suất chiếu hợp lệ hay không

Recommendation Event Tracking
→ impression, click, book, wishlist, trailer_watch, rating
```

---

## 4. Hướng tiếp cận chính

Hệ thống được thiết kế theo hướng:

> **Machine Learning-enhanced Hybrid Content-Based Recommendation**

Nghĩa là hệ thống kết hợp:

```text
Content-Based Recommendation
├── Genre
├── Actor
├── Director
├── Tags
└── Movie metadata

User Behavior Signals
├── Rating
├── Review
├── Booking
├── Wishlist
├── Trailer watch
├── Click
└── Impression

Machine Learning Ranker
├── Training samples
├── Feature vectors
├── Labels
└── Logistic Regression
```

Trong bản **Level 2**, Logistic Regression là model chính để xếp hạng phim.

Content-Based Recommendation bằng Cosine Similarity vẫn được giữ lại làm fallback khi:

```text
ML Service lỗi
Model chưa train
User quá mới và thiếu dữ liệu
Training samples chưa đủ
```

---

## 5. Quyết định thiết kế quan trọng

Các công thức trọng số thủ công không còn dùng làm công thức chính:

```text
InteractionScore =
    0.35 * RatingScore
  + 0.25 * TrailerScore
  + 0.20 * BookingScore
  + 0.10 * TicketQuantityScore
  + 0.10 * WishlistScore
```

```text
RecommendationScore =
    0.40 * GenreMatch
  + 0.30 * ActorMatch
  + 0.15 * DirectorMatch
  + 0.10 * RatingPopularity
  + 0.05 * RecencyScore
```

Lý do:

```text
Các trọng số như 0.35, 0.25, 0.40, 0.30 là do nhóm tự chọn,
không có bài báo chứng minh riêng cho CinemaMS.
```

Thay vào đó, hệ thống dùng các công thức có cơ sở học thuật:

```text
F1. Min-Max Normalization
F2. Cosine Similarity
F3. Rocchio Relevance Feedback
F4. Implicit Feedback Preference and Confidence
F5. Logistic Regression
F6. Matrix Factorization, future enhancement
F7. Precision@K
F8. Recall@K
F9. AUC / ROC-AUC
```

---

# PHẦN A — MACHINE LEARNING PIPELINE

---

## 6. Luồng Level 2 tổng thể

```text
User tương tác với hệ thống
↓
Spring Boot lưu behavior data và recommendation events
↓
Generate recommendation_training_samples
↓
Python train.py đọc training samples từ PostgreSQL
↓
Train Logistic Regression model
↓
Lưu model recommendation_model.joblib
↓
FastAPI ML Service load model
↓
Spring Boot build candidate features
↓
Spring Boot gọi ML Service để score movies
↓
ML Service trả predicted score
↓
Spring Boot sort movies theo score
↓
Trả về Recommended For You
```

Runtime khi user gọi API:

```text
GET /api/recommendations/movies
↓
RecommendationController
↓
RecommendationService
↓
Load candidate movies
↓
Build ML feature vector cho từng movie
↓
Call Recommendation ML Service
├── Success → dùng Logistic Regression score
└── Failed  → fallback về Cosine Similarity
↓
Return top recommended movies
```

---

## 7. Dữ liệu đầu vào cho Machine Learning

### 7.1. User behavior data

```text
rating
review
booking history
wishlist
trailer watch duration
click
impression
```

### 7.2. Movie content data

```text
genre
actor
director
tags
description
release date
average rating
movie status
showtime availability
```

### 7.3. System constraint data

```text
movie active/inactive
showtime còn hợp lệ hay không
movie đã bị xóa hay chưa
age restriction nếu có
```

---

## 8. Recommendation Events

Bảng `recommendation_events` dùng để ghi nhận các hành vi của user liên quan đến recommendation.

Các event chính:

```text
IMPRESSION     → phim được hiển thị cho user
CLICK          → user click vào phim
BOOK           → user đặt vé
WISHLIST       → user thêm phim vào wishlist
TRAILER_WATCH  → user xem trailer
RATING         → user rating phim
```

Ý nghĩa:

```text
IMPRESSION giúp biết phim nào user đã thấy.
CLICK, BOOK, WISHLIST, TRAILER_WATCH, RATING giúp biết user có quan tâm phim không.
```

Bảng này đặc biệt quan trọng để tạo negative samples:

```text
Phim đã hiển thị nhưng user không click
→ có thể dùng làm negative sample
```

---

## 9. Training Samples

Machine Learning cần dữ liệu dạng:

```text
X = feature vector
y = label
```

Mỗi dòng trong bảng `recommendation_training_samples` đại diện cho một cặp:

```text
user_id + movie_id
```

Ví dụ:

```text
user_id = 5
movie_id = 10
genre_similarity = 0.90
actor_similarity = 0.60
director_similarity = 0.70
normalized_rating = 0.85
trailer_interaction = 1.00
wishlist_signal = 1.00
booking_signal = 1.00
recency = 0.80
showtime_availability = 1.00
label = 1
```

---

## 10. Label Definition

Label thể hiện user có quan tâm phim hay không.

Positive label:

```text
label = 1 nếu:
- user đã booking phim
- hoặc user wishlist phim
- hoặc user rating tích cực
- hoặc user click phim từ recommendation
- hoặc user xem trailer đáng kể
```

Negative label:

```text
label = 0 nếu:
- phim đã hiển thị nhưng user không click
- hoặc user rating tiêu cực
- hoặc user bỏ qua phim nhiều lần
- hoặc phim active nhưng user không có tương tác sau impression
```

Rule đề xuất cho CinemaMS:

```text
Positive:
booking = true
OR wishlist = true
OR rating >= 4
OR trailer_watch_ratio >= 0.8
OR click = true

Negative:
rating <= 2
OR impression exists AND no click/wishlist/booking/trailer_watch
```

---

## 11. Feature Vector

Feature vector cho Logistic Regression:

```text
x1 = genre_similarity
x2 = actor_similarity
x3 = director_similarity
x4 = normalized_rating
x5 = trailer_interaction
x6 = wishlist_signal
x7 = booking_signal
x8 = recency
x9 = showtime_availability
```

Ý nghĩa từng feature:

| Feature                 | Ý nghĩa                                   | Nguồn dữ liệu              |
| ----------------------- | ----------------------------------------- | -------------------------- |
| `genre_similarity`      | Phim có gần với thể loại user thích không | movie_genres, user history |
| `actor_similarity`      | Phim có actor user thường quan tâm không  | actors, movie_casts        |
| `director_similarity`   | Phim có director user thích không         | movies/directors           |
| `normalized_rating`     | Rating trung bình phim đã chuẩn hóa       | reviews                    |
| `trailer_interaction`   | User có xem trailer phim này không        | trailer_watch_logs         |
| `wishlist_signal`       | User có wishlist phim không               | wishlists                  |
| `booking_signal`        | User có booking phim không                | bookings                   |
| `recency`               | Phim mới hay cũ                           | release_date               |
| `showtime_availability` | Phim có suất chiếu hợp lệ không           | showtimes                  |

---

# PHẦN B — CÔNG THỨC CÓ NGUỒN HỌC THUẬT

---

## 12. F1 — Min-Max Normalization

### Công thức

```text
x' = (x - min(X)) / (max(X) - min(X))
```

Trong đó:

```text
x      = giá trị ban đầu
x'     = giá trị sau khi chuẩn hóa
min(X) = giá trị nhỏ nhất của feature
max(X) = giá trị lớn nhất của feature
```

### Áp dụng

Dùng để chuẩn hóa:

```text
rating
average rating
trailer watch ratio
booking count
wishlist count
recency
popularity
```

Ví dụ với rating 1–5:

```text
RatingScore = (rating - 1) / (5 - 1)
```

```text
Rating 5 sao → 1.0
Rating 1 sao → 0.0
```

### Nguồn

```text
Patro, S. G. K., & Sahu, K. K. (2015).
Normalization: A Preprocessing Stage.
arXiv:1503.06462.
https://arxiv.org/abs/1503.06462
```

---

## 13. F2 — Cosine Similarity

### Công thức

```text
sim(u, m) = (u · v_m) / (||u|| ||v_m||)
```

Trong đó:

```text
u       = user preference vector
v_m     = movie feature vector
u · v_m = tích vô hướng giữa hai vector
||u||   = độ dài vector user
||v_m|| = độ dài vector movie
```

### Áp dụng

Cosine Similarity dùng để:

```text
Tính similarity giữa user và movie
Tạo feature genre_similarity, actor_similarity, director_similarity
Làm fallback khi ML Service lỗi
```

Ý nghĩa:

```text
Similarity càng cao
→ phim càng giống sở thích của user
→ phim được xếp hạng cao hơn trong fallback
```

### Nguồn

```text
Salton, G., Wong, A., & Yang, C. S. (1975).
A Vector Space Model for Automatic Indexing.
Communications of the ACM, 18(11), 613–620.
https://cacm.acm.org/research/a-vector-space-model-for-automatic-indexing/

Pazzani, M. J., & Billsus, D. (2007).
Content-Based Recommendation Systems.
The Adaptive Web, Lecture Notes in Computer Science, vol 4321.
https://link.springer.com/chapter/10.1007/978-3-540-72079-9_10
```

---

## 14. F3 — Rocchio Relevance Feedback

### Công thức

```text
u = αu0 + (β / |P_u|) Σ v_i - (γ / |N_u|) Σ v_j
```

Trong đó:

```text
u       = user preference vector sau khi cập nhật
u0      = user preference vector ban đầu
P_u     = tập phim user tương tác tích cực
N_u     = tập phim user tương tác tiêu cực
v_i     = vector phim tích cực
v_j     = vector phim tiêu cực
α, β, γ = hệ số điều chỉnh
```

### Áp dụng

Positive set `P_u`:

```text
phim user đã booking
phim user wishlist
phim user rating cao
phim user xem trailer nhiều
phim user click từ recommendation
```

Negative set `N_u`:

```text
phim user rating thấp
phim đã hiển thị nhưng không click
phim user bỏ qua nhiều lần
```

Rocchio giúp user vector:

```text
Gần hơn với phim user thích
Xa hơn với phim user không thích
```

### Nguồn

```text
Rocchio, J. J. (1971).
Relevance Feedback in Information Retrieval.
In G. Salton (Ed.), The SMART Retrieval System: Experiments in Automatic Document Processing.
Prentice-Hall.

Manning, C. D., Raghavan, P., & Schütze, H. (2008).
Introduction to Information Retrieval.
Cambridge University Press.
https://nlp.stanford.edu/IR-book/html/htmledition/the-rocchio71-algorithm-1.html
```

---

## 15. F4 — Implicit Feedback Preference and Confidence

### Công thức preference

```text
p_ui = 1 nếu r_ui > 0
p_ui = 0 nếu r_ui = 0
```

### Công thức confidence

```text
c_ui = 1 + αr_ui
```

Trong đó:

```text
p_ui = preference nhị phân của user u với movie i
c_ui = confidence level
r_ui = mức độ tương tác quan sát được
α    = hệ số điều chỉnh confidence
```

### Áp dụng

`r_ui` có thể lấy từ:

```text
booking
wishlist
trailer watch
click
impression
rating
```

Ví dụ:

```text
User đã booking phim
→ p_ui = 1
→ confidence cao

User chỉ thấy phim nhưng không click
→ p_ui = 0
→ có thể là negative sample
```

### Nguồn

```text
Hu, Y., Koren, Y., & Volinsky, C. (2008).
Collaborative Filtering for Implicit Feedback Datasets.
IEEE International Conference on Data Mining.
https://yifanhu.net/PUB/cf.pdf
```

---

## 16. F5 — Logistic Regression Ranker

### Công thức

```text
P(y = 1 | x) = 1 / (1 + e^-(w0 + w1x1 + w2x2 + ... + wnxn))
```

Trong đó:

```text
x       = feature vector của user-movie pair
y       = label
y = 1   = user có khả năng quan tâm hoặc đặt vé phim
w0      = bias
w1..wn  = trọng số model học từ training data
```

### Áp dụng

Logistic Regression là model chính của Level 2.

Input:

```text
genre_similarity
actor_similarity
director_similarity
normalized_rating
trailer_interaction
wishlist_signal
booking_signal
recency
showtime_availability
```

Output:

```text
predicted_score = P(y = 1 | x)
```

Ví dụ:

```text
Movie A → 0.91
Movie B → 0.74
Movie C → 0.42
```

Hệ thống sort giảm dần:

```text
Movie A
Movie B
Movie C
```

### Điểm khác với công thức thủ công

```text
Bản cũ:
Trọng số do nhóm tự đặt.

Bản ML:
Trọng số w1, w2, ..., wn do model tự học từ training data.
```

### Nguồn

```text
Cox, D. R. (1958).
The Regression Analysis of Binary Sequences.
Journal of the Royal Statistical Society: Series B, 20(2), 215–242.
https://rss.onlinelibrary.wiley.com/doi/abs/10.1111/j.2517-6161.1958.tb00292.x
```

---

## 17. F6 — Matrix Factorization, Future Enhancement

### Công thức

```text
r_hat_ui = μ + b_u + b_i + q_i^T p_u
```

Trong đó:

```text
r_hat_ui = rating hoặc preference dự đoán của user u cho movie i
μ        = rating trung bình toàn hệ thống
b_u      = bias của user
b_i      = bias của movie
p_u      = latent vector của user
q_i      = latent vector của movie
q_i^T p_u = tích vô hướng giữa latent vector movie và user
```

### Áp dụng

Matrix Factorization là hướng mở rộng sau Logistic Regression, phù hợp khi có nhiều user và nhiều interaction.

Không triển khai trong scope hiện tại nếu dữ liệu còn ít.

### Nguồn

```text
Koren, Y., Bell, R., & Volinsky, C. (2009).
Matrix Factorization Techniques for Recommender Systems.
Computer, 42(8), 30–37.
https://datajobs.com/data-science-repo/Recommender-Systems-%5BNetflix%5D.pdf
```

---

## 18. Evaluation Metrics

### F7 — Precision@K

```text
Precision@K = số item relevant trong top K / K
```

Ví dụ:

```text
Top 10 phim được recommend
User click hoặc booking 4 phim trong đó

Precision@10 = 4 / 10 = 0.4
```

### F8 — Recall@K

```text
Recall@K = số item relevant trong top K / tổng số item relevant của user
```

Ví dụ:

```text
User thật sự quan tâm 8 phim
Hệ thống recommend đúng 4 phim trong top 10

Recall@10 = 4 / 8 = 0.5
```

### F9 — AUC / ROC-AUC

```text
AUC = Area Under ROC Curve
```

Ý nghĩa:

```text
AUC càng gần 1
→ model càng phân biệt tốt positive sample và negative sample.
```

### Nguồn

```text
Herlocker, J. L., Konstan, J. A., Terveen, L. G., & Riedl, J. T. (2004).
Evaluating Collaborative Filtering Recommender Systems.
ACM Transactions on Information Systems, 22(1), 5–53.
https://grouplens.org/site-content/uploads/evaluating-TOIS-20041.pdf

Fawcett, T. (2006).
An Introduction to ROC Analysis.
Pattern Recognition Letters, 27(8), 861–874.
https://people.inf.elte.hu/kiss/13dwhdm/roc.pdf
```

---

# PHẦN C — KIẾN TRÚC TRIỂN KHAI

---

## 19. Kiến trúc tổng thể

```text
Frontend
↓
Spring Boot CinemaMS Backend
↓
RecommendationService
↓
Recommendation ML Service, FastAPI
↓
Logistic Regression Model
↓
PostgreSQL
```

Vai trò từng thành phần:

```text
Frontend
→ hiển thị Recommended For You và gửi event click/impression

Spring Boot Backend
→ xử lý nghiệp vụ, auth, movie, booking, review, wishlist, recommendation API

Recommendation ML Service
→ train/load model và score candidate movies

PostgreSQL
→ lưu movie data, user behavior, events, training samples
```

---

## 20. Cấu trúc backend đề xuất

Package chính của project:

```text
com.sba301.cinemaai
```

Cấu trúc đề xuất:

```text
controller
└── RecommendationController.java

dto
├── RecommendedMovieResponse.java
├── TrailerWatchRequest.java
├── RecommendationEventRequest.java
└── ml
    ├── MlRecommendationRequest.java
    ├── MlRecommendationCandidate.java
    └── MlRecommendationResponse.java

entity
├── TrailerWatchLog.java
├── RecommendationEvent.java
└── RecommendationTrainingSample.java

enums
└── RecommendationEventType.java

repository
├── TrailerWatchLogRepository.java
├── RecommendationEventRepository.java
└── RecommendationTrainingSampleRepository.java

service
├── RecommendationService.java
├── TrailerWatchService.java
├── RecommendationEventService.java
└── RecommendationTrainingSampleService.java

recommendation
├── FeatureNormalizer.java
├── UserPreferenceProfileBuilder.java
├── ContentBasedSimilarityEngine.java
├── ImplicitFeedbackBuilder.java
├── RecommendationFeatureBuilder.java
└── RecommendationReasonBuilder.java

client
└── RecommendationMlClient.java
```

ML service:

```text
BE/cinemaAI/ml
├── requirements.txt
├── train.py
├── app.py
├── README.md
└── model
    └── recommendation_model.joblib
```

---

## 21. Database cần bổ sung

### 21.1. recommendation_events

```sql
CREATE TABLE recommendation_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    position INT,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Index đề xuất:

```sql
CREATE INDEX idx_recommendation_events_user
ON recommendation_events(user_id);

CREATE INDEX idx_recommendation_events_user_movie
ON recommendation_events(user_id, movie_id);

CREATE INDEX idx_recommendation_events_type
ON recommendation_events(event_type);
```

### 21.2. trailer_watch_logs

```sql
CREATE TABLE trailer_watch_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    watch_seconds INT NOT NULL,
    trailer_duration_seconds INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 21.3. recommendation_training_samples

```sql
CREATE TABLE recommendation_training_samples (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,

    genre_similarity DOUBLE PRECISION NOT NULL,
    actor_similarity DOUBLE PRECISION NOT NULL,
    director_similarity DOUBLE PRECISION NOT NULL,
    normalized_rating DOUBLE PRECISION NOT NULL,
    trailer_interaction DOUBLE PRECISION NOT NULL,
    wishlist_signal DOUBLE PRECISION NOT NULL,
    booking_signal DOUBLE PRECISION NOT NULL,
    recency DOUBLE PRECISION NOT NULL,
    showtime_availability DOUBLE PRECISION NOT NULL,

    label INT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Index đề xuất:

```sql
CREATE INDEX idx_recommendation_training_samples_user
ON recommendation_training_samples(user_id);

CREATE INDEX idx_recommendation_training_samples_movie
ON recommendation_training_samples(movie_id);

CREATE INDEX idx_recommendation_training_samples_label
ON recommendation_training_samples(label);
```

---

## 22. API cần có

### 22.1. Lấy phim đề xuất

```http
GET /api/recommendations/movies
```

Response mẫu:

```json
[
  {
    "movieId": 10,
    "title": "Dune",
    "score": 0.91,
    "reason": "Because this movie is similar to your preferred Sci-Fi movies.",
    "posterUrl": "...",
    "genres": ["Sci-Fi", "Adventure"],
    "showtimeAvailable": true
  }
]
```

### 22.2. Ghi nhận trailer watch

```http
POST /api/movies/{movieId}/trailer-watch
```

Request:

```json
{
  "watchSeconds": 95,
  "trailerDurationSeconds": 100
}
```

### 22.3. Ghi nhận recommendation event

```http
POST /api/recommendations/events
```

Request:

```json
{
  "movieId": 10,
  "eventType": "CLICK",
  "position": 3,
  "source": "HOME_RECOMMENDED_FOR_YOU"
}
```

### 22.4. Admin generate training samples

```http
POST /api/admin/recommendations/training-samples/generate
```

### 22.5. Admin rebuild model

```http
POST /api/admin/recommendations/rebuild
```

---

## 23. Python ML Service

### 23.1. requirements.txt

```txt
fastapi
uvicorn
pandas
scikit-learn
sqlalchemy
psycopg2-binary
joblib
```

### 23.2. train.py

```python
import os
import joblib
import pandas as pd

from sqlalchemy import create_engine
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


DB_URL = os.getenv(
    "DB_URL",
    "postgresql://postgres:123456@localhost:5432/cinema_ai"
)

MODEL_PATH = "model/recommendation_model.joblib"


def load_training_data():
    engine = create_engine(DB_URL)

    query = """
    SELECT
        genre_similarity,
        actor_similarity,
        director_similarity,
        normalized_rating,
        trailer_interaction,
        wishlist_signal,
        booking_signal,
        recency,
        showtime_availability,
        label
    FROM recommendation_training_samples
    """

    return pd.read_sql(query, engine)


def train():
    df = load_training_data()

    feature_columns = [
        "genre_similarity",
        "actor_similarity",
        "director_similarity",
        "normalized_rating",
        "trailer_interaction",
        "wishlist_signal",
        "booking_signal",
        "recency",
        "showtime_availability"
    ]

    X = df[feature_columns]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=1000))
    ])

    model.fit(X_train, y_train)

    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.5).astype(int)

    print("AUC:", roc_auc_score(y_test, y_prob))
    print("Precision:", precision_score(y_test, y_pred))

    os.makedirs("model", exist_ok=True)

    joblib.dump(
        {
            "model": model,
            "features": feature_columns
        },
        MODEL_PATH
    )

    print("Model saved to", MODEL_PATH)


if __name__ == "__main__":
    train()
```

### 23.3. app.py

```python
import joblib
import pandas as pd

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List


MODEL_PATH = "model/recommendation_model.joblib"

loaded = joblib.load(MODEL_PATH)
model = loaded["model"]
feature_names = loaded["features"]

app = FastAPI(title="Cinema Recommendation ML Service")


class CandidateFeature(BaseModel):
    movieId: int
    genreSimilarity: float
    actorSimilarity: float
    directorSimilarity: float
    normalizedRating: float
    trailerInteraction: float
    wishlistSignal: float
    bookingSignal: float
    recency: float
    showtimeAvailability: float


class ScoreRequest(BaseModel):
    userId: int
    candidates: List[CandidateFeature]


class ScoreResponseItem(BaseModel):
    movieId: int
    score: float


@app.post("/recommendations/score", response_model=List[ScoreResponseItem])
def score_candidates(request: ScoreRequest):
    rows = []

    for candidate in request.candidates:
        rows.append({
            "movieId": candidate.movieId,
            "genre_similarity": candidate.genreSimilarity,
            "actor_similarity": candidate.actorSimilarity,
            "director_similarity": candidate.directorSimilarity,
            "normalized_rating": candidate.normalizedRating,
            "trailer_interaction": candidate.trailerInteraction,
            "wishlist_signal": candidate.wishlistSignal,
            "booking_signal": candidate.bookingSignal,
            "recency": candidate.recency,
            "showtime_availability": candidate.showtimeAvailability
        })

    df = pd.DataFrame(rows)

    if df.empty:
        return []

    X = df[feature_names]
    scores = model.predict_proba(X)[:, 1]

    result = []

    for movie_id, score in zip(df["movieId"], scores):
        result.append({
            "movieId": int(movie_id),
            "score": float(score)
        })

    result.sort(key=lambda item: item["score"], reverse=True)

    return result
```

Chạy ML service:

```bash
cd BE/cinemaAI/ml
pip install -r requirements.txt
python train.py
uvicorn app:app --reload --port 8001
```

---

## 24. Spring Boot tích hợp ML Service

Trong `application.properties`:

```properties
recommendation.ml.base-url=http://localhost:8001
```

DTO đề xuất:

```java
package com.sba301.cinemaai.dto.ml;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MlRecommendationRequest {
    private Long userId;
    private List<MlRecommendationCandidate> candidates;
}
```

```java
package com.sba301.cinemaai.dto.ml;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MlRecommendationCandidate {
    private Long movieId;
    private Double genreSimilarity;
    private Double actorSimilarity;
    private Double directorSimilarity;
    private Double normalizedRating;
    private Double trailerInteraction;
    private Double wishlistSignal;
    private Double bookingSignal;
    private Double recency;
    private Double showtimeAvailability;
}
```

```java
package com.sba301.cinemaai.dto.ml;

import lombok.Data;

@Data
public class MlRecommendationResponse {
    private Long movieId;
    private Double score;
}
```

Luồng service:

```java
public List<RecommendedMovieResponse> getRecommendedMovies(Long userId) {
    List<Movie> candidates = movieRepository.findRecommendableMovies();

    List<MlRecommendationCandidate> mlCandidates = candidates.stream()
            .map(movie -> recommendationFeatureBuilder.build(userId, movie))
            .toList();

    MlRecommendationRequest request = MlRecommendationRequest.builder()
            .userId(userId)
            .candidates(mlCandidates)
            .build();

    try {
        List<MlRecommendationResponse> mlScores = recommendationMlClient.score(request);
        return buildResponseFromMlScores(mlScores, candidates);
    } catch (Exception ex) {
        return getRecommendedMoviesByCosineSimilarity(userId, candidates);
    }
}
```

---

# PHẦN D — RUNTIME, FALLBACK VÀ RULES

---

## 25. Runtime Flow

```text
GET /api/recommendations/movies
↓
RecommendationController
↓
RecommendationService
↓
Load user behavior data
↓
Load candidate movies
↓
Build feature vector
↓
Call ML Service
├── Success
│   └── Use Logistic Regression predicted score
│
└── Failed
    └── Use Cosine Similarity fallback score
↓
Sort by score
↓
Apply business filters
↓
Return top recommended movies
```

---

## 26. Business Filters

Chỉ recommend phim hợp lệ:

```text
Phim active
Phim đang chiếu hoặc sắp chiếu
Phim có showtime hợp lệ
Phim chưa bị xóa
Phim chưa hết lịch chiếu
Phim phù hợp độ tuổi user nếu có age restriction
Không recommend phim user vừa booking quá gần đây nếu cần
```

---

## 27. Cold Start

### 27.1. User mới

User chưa có lịch sử tương tác.

Giải pháp:

```text
Dùng phim đang chiếu hoặc sắp chiếu
Ưu tiên phim có rating cao
Ưu tiên phim có nhiều booking
Ưu tiên phim có showtime hợp lệ
```

Đây là fallback nghiệp vụ, không phải công thức học thuật chính.

### 27.2. Movie mới

Movie mới chưa có interaction data.

Giải pháp:

```text
Dùng Content-Based Recommendation
vì movie vẫn có metadata như genre, actor, director, tags, release date.
```

### 27.3. ML Service lỗi

```text
Fallback về Cosine Similarity.
```

Không fallback về công thức trọng số thủ công trong báo cáo chính.

---

## 28. Ví dụ minh họa

User A có hành vi:

```text
Rating Dune 5 sao
Booking Interstellar
Thêm The Martian vào wishlist
Xem trailer Oppenheimer 90%
Click nhiều phim Sci-Fi
```

Hệ thống suy ra user A quan tâm:

```text
Sci-Fi
Adventure
Drama
Space-related movies
Đạo diễn hoặc diễn viên tương tự
```

Candidate movies:

```text
Dune: Part Two
Avatar
Fast & Furious
Inside Out
```

Kết quả có thể là:

```text
1. Dune: Part Two
2. Avatar
3. Oppenheimer
4. Interstellar Re-release
```

User B thường xem phim hoạt hình/gia đình có thể nhận:

```text
1. Inside Out
2. Elemental
3. Kung Fu Panda
4. Doraemon
```

Điều này cho thấy recommendation là cá nhân hóa, không phải popular ranking.

---

# PHẦN E — EVALUATION

---

## 29. Đánh giá model

Các metric chính:

```text
Precision@K
Recall@K
AUC / ROC-AUC
```

Cách đánh giá:

```text
1. Lưu danh sách phim đã recommend cho user.
2. Ghi nhận user có click, wishlist, booking, trailer watch hay không.
3. So sánh top-K recommendation với actual interactions.
4. Tính Precision@K và Recall@K.
5. Với Logistic Regression, dùng predicted score và label để tính AUC.
```

Ví dụ:

```text
Top 10 phim recommend
User tương tác với 4 phim

Precision@10 = 4 / 10 = 0.4
```

---

## 30. Điều kiện để Level 2 được xem là hoàn thành

Level 2 được xem là hoàn thành khi có đủ:

```text
Có recommendation_events
Có trailer_watch_logs
Có recommendation_training_samples
Có rule tạo label positive/negative
Có feature vector cho user-movie pair
Có Python train.py
Có model recommendation_model.joblib
Có FastAPI ML Service
Có Spring Boot RecommendationMlClient
Có fallback về Cosine Similarity
Có evaluation bằng Precision@K, Recall@K, AUC
```

---

## 31. Checklist triển khai

### Backend

```text
[ ] Entity RecommendationEvent
[ ] Entity TrailerWatchLog
[ ] Entity RecommendationTrainingSample
[ ] Enum RecommendationEventType
[ ] Repository cho 3 entity trên
[ ] RecommendationEventService
[ ] TrailerWatchService
[ ] RecommendationTrainingSampleService
[ ] RecommendationFeatureBuilder
[ ] RecommendationMlClient
[ ] RecommendationService call ML Service
[ ] Fallback về Cosine Similarity
```

### Database

```text
[ ] Table recommendation_events
[ ] Table trailer_watch_logs
[ ] Table recommendation_training_samples
[ ] Index cho user_id, movie_id, event_type, label
```

### ML Service

```text
[ ] ml/requirements.txt
[ ] ml/train.py
[ ] ml/app.py
[ ] ml/model/recommendation_model.joblib
[ ] Endpoint POST /recommendations/score
```

### API

```text
[ ] GET /api/recommendations/movies
[ ] POST /api/movies/{movieId}/trailer-watch
[ ] POST /api/recommendations/events
[ ] POST /api/admin/recommendations/training-samples/generate
[ ] POST /api/admin/recommendations/rebuild
```

### Evaluation

```text
[ ] Lưu impression
[ ] Lưu click
[ ] Lưu booking/wishlist/trailer/rating event
[ ] Tính Precision@K
[ ] Tính Recall@K
[ ] Tính AUC
```

---

## 32. Roadmap triển khai đề xuất

```text
Phase 1:
Thêm recommendation_events và trailer_watch_logs.

Phase 2:
Thêm recommendation_training_samples.

Phase 3:
Viết RecommendationFeatureBuilder để tạo feature vector.

Phase 4:
Viết RecommendationTrainingSampleService để generate label và samples.

Phase 5:
Tạo Python ML service với train.py và app.py.

Phase 6:
Train Logistic Regression model.

Phase 7:
Spring Boot gọi ML service qua RecommendationMlClient.

Phase 8:
RecommendationService dùng ML score để ranking.

Phase 9:
Fallback về Cosine Similarity nếu ML lỗi.

Phase 10:
Thêm evaluation metrics Precision@K, Recall@K, AUC.
```

---

## 33. Formula Traceability Matrix

| ID | Công thức                                                   | Dùng ở đâu trong CinemaMS                                     | Nguồn học thuật                               |            |        |                                  |                                       |   |    |                                                   |                                                |
| -- | ----------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------- | ---------- | ------ | -------------------------------- | ------------------------------------- | - | -- | ------------------------------------------------- | ---------------------------------------------- |
| F1 | `x' = (x - min(X)) / (max(X) - min(X))`                     | Chuẩn hóa rating, popularity, recency, trailer, booking count | Patro & Sahu (2015)                           |            |        |                                  |                                       |   |    |                                                   |                                                |
| F2 | `sim(u,m) = (u · v_m) / (                                   |                                                               | u                                             |            |        |                                  | v_m                                   |   | )` | Tính similarity, fallback, tạo feature similarity | Salton et al. (1975), Pazzani & Billsus (2007) |
| F3 | `u = αu0 + (β/                                              | P_u                                                           | )Σv_i - (γ/                                   | N_u        | )Σv_j` | Cập nhật user preference profile | Rocchio (1971), Manning et al. (2008) |   |    |                                                   |                                                |
| F4 | `p_ui = 1 nếu r_ui > 0, p_ui = 0 nếu r_ui = 0`              | Chuyển implicit feedback thành preference                     | Hu, Koren & Volinsky (2008)                   |            |        |                                  |                                       |   |    |                                                   |                                                |
| F4 | `c_ui = 1 + αr_ui`                                          | Tính confidence cho implicit feedback                         | Hu, Koren & Volinsky (2008)                   |            |        |                                  |                                       |   |    |                                                   |                                                |
| F5 | `P(y=1                                                      | x)=1/(1+e^-(w0+w1x1+...+wnxn))`                               | ML ranker dự đoán xác suất user quan tâm phim | Cox (1958) |        |                                  |                                       |   |    |                                                   |                                                |
| F6 | `r_hat_ui = μ + b_u + b_i + q_i^T p_u`                      | Future enhancement collaborative filtering                    | Koren, Bell & Volinsky (2009)                 |            |        |                                  |                                       |   |    |                                                   |                                                |
| F7 | `Precision@K = relevant items in top K / K`                 | Đánh giá top-K recommendation                                 | Herlocker et al. (2004)                       |            |        |                                  |                                       |   |    |                                                   |                                                |
| F8 | `Recall@K = relevant items in top K / total relevant items` | Đánh giá độ bao phủ item relevant                             | Herlocker et al. (2004)                       |            |        |                                  |                                       |   |    |                                                   |                                                |
| F9 | `AUC = Area Under ROC Curve`                                | Đánh giá classifier/ranker                                    | Fawcett (2006)                                |            |        |                                  |                                       |   |    |                                                   |                                                |

---

## 34. Cách trả lời khi giảng viên hỏi

### Công thức có nguồn không?

> Dạ có. Nhóm đã thay các công thức trọng số thủ công bằng các công thức có cơ sở học thuật. Feature được chuẩn hóa bằng Min-Max Normalization. Content-Based Recommendation dùng Cosine Similarity trên user preference vector và movie feature vector. User profile được cập nhật bằng Rocchio Relevance Feedback. Implicit feedback được mô hình hóa theo Hu, Koren & Volinsky với preference nhị phân và confidence level. Bản Machine Learning dùng Logistic Regression để model tự học trọng số từ training data. Hệ thống được đánh giá bằng Precision@K, Recall@K và AUC.

### Machine Learning nằm ở đâu?

> Machine Learning nằm ở Recommendation ML Service. Hệ thống tạo training samples từ dữ liệu tương tác user-movie, sau đó train Logistic Regression để dự đoán xác suất user quan tâm hoặc đặt vé một phim. Khác với công thức trọng số thủ công, trọng số trong Logistic Regression được học từ dữ liệu.

### Vì sao không dùng công thức trọng số cũ?

> Vì các trọng số thủ công như 0.35, 0.25, 0.40 là giả định nghiệp vụ của nhóm và không có paper chứng minh riêng cho CinemaMS. Vì vậy nhóm dùng Logistic Regression để model tự học trọng số từ dữ liệu, còn Cosine Similarity được dùng làm fallback có cơ sở học thuật.

### Dữ liệu cho ML lấy từ đâu?

> Dữ liệu được lấy từ các module có sẵn như booking, review, wishlist, movie metadata, showtime và bảng bổ sung như trailer_watch_logs, recommendation_events, recommendation_training_samples.

---

## 35. Đoạn đưa vào báo cáo

> Recommendation System trong CinemaMS được triển khai theo hướng Machine Learning-enhanced Hybrid Content-Based Recommendation. Hệ thống thu thập dữ liệu hành vi người dùng như rating, booking, wishlist, trailer watch, click và impression, kết hợp với thông tin nội dung phim như genre, actor, director, metadata và showtime availability. Các dữ liệu này được chuyển đổi thành feature vector cho từng cặp user-movie. Ở phiên bản Level 2, hệ thống sử dụng Logistic Regression để dự đoán xác suất người dùng quan tâm hoặc đặt vé một bộ phim. Các trọng số của model được học từ training data thay vì được nhóm tự đặt thủ công. Trong trường hợp ML Service không khả dụng, hệ thống fallback về Content-Based Recommendation sử dụng Cosine Similarity giữa user preference vector và movie feature vector. Chất lượng hệ thống được đánh giá bằng Precision@K, Recall@K và AUC.

---

## 36. References

```text
[R1] Patro, S. G. K., & Sahu, K. K. (2015).
Normalization: A Preprocessing Stage.
arXiv:1503.06462.
https://arxiv.org/abs/1503.06462

[R2] Salton, G., Wong, A., & Yang, C. S. (1975).
A Vector Space Model for Automatic Indexing.
Communications of the ACM, 18(11), 613–620.
https://cacm.acm.org/research/a-vector-space-model-for-automatic-indexing/

[R3] Pazzani, M. J., & Billsus, D. (2007).
Content-Based Recommendation Systems.
The Adaptive Web, Lecture Notes in Computer Science, vol 4321.
https://link.springer.com/chapter/10.1007/978-3-540-72079-9_10

[R4] Rocchio, J. J. (1971).
Relevance Feedback in Information Retrieval.
In G. Salton (Ed.), The SMART Retrieval System: Experiments in Automatic Document Processing.
Prentice-Hall.

[R5] Manning, C. D., Raghavan, P., & Schütze, H. (2008).
Introduction to Information Retrieval.
Cambridge University Press.
https://nlp.stanford.edu/IR-book/html/htmledition/the-rocchio71-algorithm-1.html

[R6] Hu, Y., Koren, Y., & Volinsky, C. (2008).
Collaborative Filtering for Implicit Feedback Datasets.
IEEE International Conference on Data Mining.
https://yifanhu.net/PUB/cf.pdf

[R7] Cox, D. R. (1958).
The Regression Analysis of Binary Sequences.
Journal of the Royal Statistical Society: Series B, 20(2), 215–242.
https://rss.onlinelibrary.wiley.com/doi/abs/10.1111/j.2517-6161.1958.tb00292.x

[R8] Koren, Y., Bell, R., & Volinsky, C. (2009).
Matrix Factorization Techniques for Recommender Systems.
Computer, 42(8), 30–37.
https://datajobs.com/data-science-repo/Recommender-Systems-%5BNetflix%5D.pdf

[R9] Herlocker, J. L., Konstan, J. A., Terveen, L. G., & Riedl, J. T. (2004).
Evaluating Collaborative Filtering Recommender Systems.
ACM Transactions on Information Systems, 22(1), 5–53.
https://grouplens.org/site-content/uploads/evaluating-TOIS-20041.pdf

[R10] Fawcett, T. (2006).
An Introduction to ROC Analysis.
Pattern Recognition Letters, 27(8), 861–874.
https://people.inf.elte.hu/kiss/13dwhdm/roc.pdf
```

---

## 37. Kết luận

Bản Level 2 của Recommendation System thỏa các yêu cầu:

```text
Có Machine Learning thật bằng Logistic Regression
Có training samples và labels
Có feature vector rõ ràng
Có event tracking để tạo dữ liệu học
Có ML Service riêng bằng Python FastAPI
Có Spring Boot ML Client
Có fallback về Cosine Similarity
Có evaluation metrics
Mọi công thức chính đều có nguồn học thuật
Không dùng công thức trọng số thủ công làm công thức báo cáo chính
```

Câu chốt:

> Recommendation System Level 2 của CinemaMS là một Machine Learning-based Recommendation System. Hệ thống sử dụng dữ liệu hành vi người dùng và metadata phim để tạo feature vector cho từng cặp user-movie, sau đó train Logistic Regression để dự đoán xác suất user quan tâm hoặc đặt vé phim. Các công thức chính đều có cơ sở học thuật, còn các trọng số thủ công ban đầu đã được loại khỏi công thức chính và thay bằng trọng số do model học từ dữ liệu.
