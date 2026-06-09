IF OBJECT_ID('dbo.fk_seats_room', 'F') IS NOT NULL
ALTER TABLE dbo.seats DROP CONSTRAINT fk_seats_room;

IF OBJECT_ID('dbo.uk_seats_room_position', 'UQ') IS NOT NULL
ALTER TABLE dbo.seats DROP CONSTRAINT uk_seats_room_position;

IF OBJECT_ID('dbo.uk_seats_row_position', 'UQ') IS NULL
ALTER TABLE dbo.seats
ADD CONSTRAINT uk_seats_row_position UNIQUE (seat_row_id, seat_number);

IF COL_LENGTH('dbo.seats', 'room_id') IS NOT NULL
ALTER TABLE dbo.seats DROP COLUMN room_id;
