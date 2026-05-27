# Promotion Logic Guide (Local/Student Demo)

Muc tieu: ap dung promotion theo cach toi gian, de demo chay local va de dang mo rong sau nay.

## 1) Entity dang co

- `Promotion`: code, type, value, minOrderAmount, maxDiscountAmount, usageLimit, usedCount, startsAt, endsAt, status.
- `Booking`: subtotal, discountAmount, totalAmount.
- `BookingPromotion`: lien ket `Booking` + `Promotion`, luu `discountAmount`.

## 2) Quy tac kiem tra toi thieu

Truoc khi ap code, can pass cac check sau:

- `status == ACTIVE`
- `startsAt <= now <= endsAt`
- Neu `usageLimit != null` thi `usedCount < usageLimit`
- Neu `minOrderAmount != null` thi `subtotal >= minOrderAmount`

## 3) Tinh giam gia

Dung `PromotionType`:

- `PERCENTAGE`: `discount = subtotal * value / 100`
- `FIXED_AMOUNT`: `discount = value`
- `COMBO`: de toi gian, co the tam coi giong `FIXED_AMOUNT` hoac khong ap trong phase dau.

Sau do chot lai:

- Neu `maxDiscountAmount != null` thi `discount = min(discount, maxDiscountAmount)`
- `discount = min(discount, subtotal)` (tranh total am)

## 4) Apply flow toi gian

1. Nhan `promotionCode` tu user
2. `findActiveByCode(code, now)`
3. Validate theo muc 2
4. Tinh `discount` theo muc 3
5. Tao `BookingPromotion`
6. Update `Booking`:
   - `discountAmount = discount`
   - `totalAmount = subtotal - discount`
7. `promotion.increaseUsage()`

## 5) Bo/doi promotion (toi gian)

Neu cho phep bo promotion:

- Xoa `BookingPromotion`
- Set `booking.discountAmount = 0`
- Set `booking.totalAmount = subtotal`
- (Optional) giam `promotion.usedCount` neu muon chinh xac

## 6) Ghi chu mo rong sau nay (khong bat buoc)

- Gioi han 1 promotion/booking de don gian logic
- Neu can ap rieng cho do an/ve, them rule trong service (chua can entity moi)
- `COMBO` co the map sang `FoodCombo` sau khi logic on dinh

## 7) Pseudocode

```java
Promotion promo = promotionRepository.findActiveByCode(code, now)
    .orElseThrow(...);

validateMinOrder(promo, booking.getSubtotal());
validateUsageLimit(promo);

BigDecimal discount = calculateDiscount(promo, booking.getSubtotal());

booking.updateAmounts(
    booking.getSubtotal(),
    discount,
    booking.getSubtotal().subtract(discount)
);

bookingPromotionRepository.save(new BookingPromotion(booking, promo, discount));
promo.increaseUsage();
```

