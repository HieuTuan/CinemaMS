package com.sba301.cinemaai.config;

import com.sba301.cinemaai.entity.*;
import com.sba301.cinemaai.enums.*;
import com.sba301.cinemaai.repository.*;
import com.sba301.cinemaai.service.UserRoleService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class DevSeedDataRunner implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final UserRepository userRepository;
    private final UserRoleService userRoleService;
    private final PasswordEncoder passwordEncoder;

    private final PromotionRepository promotionRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedGenres();
        seedMovies();
        seedCinemaSchedule();
        seedUsers();
        seedPromotions();
        seedBookings();
    }

    private void seedUsers() {
        String email = "string@string.string";
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = userRepository.save(new User(
                email,
                passwordEncoder.encode("12345678"),
                "Demo User",
                "0123456789"
        ));
        user.activateEmail();
        userRoleService.assignRole(user, RoleName.CUSTOMER);
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (!roleRepository.existsByName(roleName)) {
                roleRepository.save(new Role(roleName));
            }
        }
    }

    private void seedGenres() {
        Map<String, String> genres = Map.of(
                "Action", "Action movies",
                "Drama", "Drama movies",
                "Comedy", "Comedy movies",
                "Horror", "Horror movies",
                "Romance", "Romance movies",
                "Sci-Fi", "Science fiction movies"
        );

        genres.forEach((name, description) -> {
            if (!genreRepository.existsByName(name)) {
                genreRepository.save(new Genre(name, description));
            }
        });
    }

    private void seedMovies() {
        seedMovie(new MovieSeed(
                "The Last Orbit",
                "A rescue mission crosses the edge of known space.",
                128,
                MovieStatus.NOW_SHOWING,
                LocalDate.now().minusDays(14),
                "English",
                "Vietnamese",
                "13+",
                "A. Nguyen",
                "Action,Sci-Fi"
        ));
        seedMovie(new MovieSeed(
                "Saigon Midnight",
                "A quiet detective story set across one rainy night.",
                112,
                MovieStatus.NOW_SHOWING,
                LocalDate.now().minusDays(7),
                "Vietnamese",
                "English",
                "16+",
                "L. Tran",
                "Drama"
        ));
        seedMovie(new MovieSeed(
                "Weekend Laughs",
                "A group of friends turn a simple trip into chaos.",
                96,
                MovieStatus.UPCOMING,
                LocalDate.now().plusDays(10),
                "Vietnamese",
                "English",
                "P",
                "M. Pham",
                "Comedy"
        ));
    }

    private void seedMovie(MovieSeed seed) {
        Movie movie = movieRepository.findByTitle(seed.title())
                .orElseGet(() -> movieRepository.save(new Movie(seed.title(), seed.durationMinutes(), seed.status())));
        movie.updateDetails(seed.title(), seed.description(), seed.durationMinutes(), seed.releaseDate());
        movie.updateMetadata(seed.language(), seed.subtitleLanguage(), seed.ageRating(), seed.director(), "Sample lead actors", "Sample cast");
        movie.changeStatus(seed.status());

        for (String genreName : seed.genreNames().split(",")) {
            genreRepository.findByName(genreName.trim()).ifPresent(genre -> {
                if (!movieGenreRepository.existsByMovieAndGenre(movie, genre)) {
                    movieGenreRepository.save(new MovieGenre(movie, genre));
                }
            });
        }
    }

    private void seedCinemaSchedule() {
        Cinema cinema = cinemaRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> new Cinema(
                        "CineAI Central",
                        "1 Nguyen Hue, District 1",
                        "Ho Chi Minh City",
                        "0900000000"
                ));
        cinema.updateInfo(
                "CineAI Central",
                "1 Nguyen Hue, District 1",
                "Ho Chi Minh City",
                "0900000000"
        );
        Cinema savedCinema = cinemaRepository.save(cinema);

        Room room = roomRepository.findByCinemaAndName(savedCinema, "Room A")
                .orElseGet(() -> roomRepository.save(new Room(savedCinema, "Room A", RoomType.TWO_D, 5, 8)));

        seedSeats(room);
        seedShowtimes(room);
    }

    private void seedSeats(Room room) {
        for (char row = 'A'; row <= 'E'; row++) {
            for (int number = 1; number <= 8; number++) {
                String rowLabel = Character.toString(row);
                if (!seatRepository.existsByRoomAndRowLabelAndSeatNumber(room, rowLabel, number)) {
                    SeatType seatType = row == 'E' ? SeatType.VIP : SeatType.NORMAL;
                    seatRepository.save(new Seat(room, rowLabel, number, seatType));
                }
            }
        }
    }

    private void seedShowtimes(Room room) {
        movieRepository.findByTitle("The Last Orbit").ifPresent(movie ->
                seedShowtime(room, movie, LocalDateTime.now().plusDays(1).withHour(18).withMinute(30).withSecond(0).withNano(0))
        );
        movieRepository.findByTitle("Saigon Midnight").ifPresent(movie ->
                seedShowtime(room, movie, LocalDateTime.now().plusDays(2).withHour(20).withMinute(0).withSecond(0).withNano(0))
        );
    }

    private void seedShowtime(Room room, Movie movie, LocalDateTime startTime) {
        if (showtimeRepository.existsByRoomAndMovieAndStartTime(room, movie, startTime)) {
            return;
        }

        LocalDateTime endTime = startTime.plusMinutes(movie.getDurationMinutes()).plusMinutes(15);
        Showtime showtime = new Showtime(movie, room, startTime, endTime, BigDecimal.valueOf(90000));
        showtime.changeStatus(ShowtimeStatus.OPEN);
        showtimeRepository.save(showtime);
    }

    private record MovieSeed(
            String title,
            String description,
            int durationMinutes,
            MovieStatus status,
            LocalDate releaseDate,
            String language,
            String subtitleLanguage,
            String ageRating,
            String director,
            String genreNames
    ) {
    }
    private void seedPromotions() {
        seedPromotion(new PromotionSeed(
                "WELCOME50",
                "Welcome - 50% off up to 50k",
                PromotionType.PERCENTAGE,
                new BigDecimal("50"),
                new BigDecimal("50000"),
                null,
                10,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(30)
        ));

        seedPromotion(new PromotionSeed(
                "FLAT30K",
                "Flat 30,000 VND off any order",
                PromotionType.FIXED_AMOUNT,
                new BigDecimal("30000"),
                null,
                new BigDecimal("100000"),
                20,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(30)
        ));

        seedPromotion(new PromotionSeed(
                "COMBO99K",
                "Combo ticket deal - fixed 99k discount",
                PromotionType.COMBO,
                new BigDecimal("99000"),
                null,
                new BigDecimal("200000"),
                5,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(14)
        ));

        seedPromotion(new PromotionSeed(
                "EXPIRED10",
                "Expired promo - for testing only",
                PromotionType.FIXED_AMOUNT,
                new BigDecimal("10000"),
                null,
                null,
                100,
                LocalDateTime.now().minusDays(30),
                LocalDateTime.now().minusDays(1)
        ));
    }

    private void seedPromotion(PromotionSeed seed) {
        if (promotionRepository.existsByCode(seed.code())) {
            return;
        }

        Promotion promotion = new Promotion(
                seed.code(),
                seed.name(),
                seed.type(),
                seed.value(),
                seed.startsAt(),
                seed.endsAt()
        );

        if (seed.maxDiscountAmount() != null) {
            promotion.updateMaxDiscount(seed.maxDiscountAmount());
        }
        if (seed.minOrderAmount() != null) {
            promotion.updateMinOrder(seed.minOrderAmount());
        }
        if (seed.usageLimit() != null) {
            promotion.updateUsageLimit(seed.usageLimit());
        }

        promotionRepository.save(promotion);
    }

    private record PromotionSeed(
            String code,
            String name,
            PromotionType type,
            BigDecimal value,
            BigDecimal maxDiscountAmount,
            BigDecimal minOrderAmount,
            Integer usageLimit,
            LocalDateTime startsAt,
            LocalDateTime endsAt
    ) {}

    private void seedBookings() {
        User user = userRepository.findByEmail("string@string.string").orElse(null);
        if (user == null) return;

        movieRepository.findByTitle("The Last Orbit").ifPresent(movie ->
                showtimeRepository.findByRoomAndMovieAndStartTime(
                        roomRepository.findByCinemaAndName(
                                cinemaRepository.findByName("CineAI Central").orElse(null), "Room A"
                        ).orElse(null),
                        movie,
                        LocalDateTime.now().plusDays(1).withHour(18).withMinute(30).withSecond(0).withNano(0)
                ).ifPresent(showtime -> seedBooking("BOOK-DEMO-001", user, showtime,
                        List.of("A1", "A2")))
        );

        movieRepository.findByTitle("Saigon Midnight").ifPresent(movie ->
                showtimeRepository.findByRoomAndMovieAndStartTime(
                        roomRepository.findByCinemaAndName(
                                cinemaRepository.findByName("CineAI Central").orElse(null), "Room A"
                        ).orElse(null),
                        movie,
                        LocalDateTime.now().plusDays(2).withHour(20).withMinute(0).withSecond(0).withNano(0)
                ).ifPresent(showtime -> seedBooking("BOOK-DEMO-002", user, showtime,
                        List.of("B1", "B2", "B3")))
        );
    }

    private void seedBooking(String bookingCode, User user, Showtime showtime, List<String> seatLabels) {
        if (bookingRepository.existsByBookingCode(bookingCode)) {
            return;
        }

        Booking booking = bookingRepository.save(
                new Booking(bookingCode, user, showtime, LocalDateTime.now().plusMinutes(10))
        );

        List<Seat> seats = seatRepository.findByRoom(showtime.getRoom()).stream()
                .filter(seat -> seatLabels.contains(seat.getRowLabel() + seat.getSeatNumber()))
                .toList();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (Seat seat : seats) {
            bookingSeatRepository.save(new BookingSeat(booking, showtime, seat, showtime.getBasePrice()));
            subtotal = subtotal.add(showtime.getBasePrice());
        }

        booking.updateAmounts(subtotal, BigDecimal.ZERO, subtotal);
    }
}
