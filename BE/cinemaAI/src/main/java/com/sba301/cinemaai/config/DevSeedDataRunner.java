package com.sba301.cinemaai.config;

import com.sba301.cinemaai.entity.Cinema;
import com.sba301.cinemaai.entity.Genre;
import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.entity.MovieGenre;
import com.sba301.cinemaai.entity.Role;
import com.sba301.cinemaai.entity.Room;
import com.sba301.cinemaai.entity.Seat;
import com.sba301.cinemaai.entity.Showtime;
import com.sba301.cinemaai.enums.MovieStatus;
import com.sba301.cinemaai.enums.RoleName;
import com.sba301.cinemaai.enums.RoomType;
import com.sba301.cinemaai.enums.SeatType;
import com.sba301.cinemaai.enums.ShowtimeStatus;
import com.sba301.cinemaai.repository.CinemaRepository;
import com.sba301.cinemaai.repository.GenreRepository;
import com.sba301.cinemaai.repository.MovieGenreRepository;
import com.sba301.cinemaai.repository.MovieRepository;
import com.sba301.cinemaai.repository.RoleRepository;
import com.sba301.cinemaai.repository.RoomRepository;
import com.sba301.cinemaai.repository.SeatRepository;
import com.sba301.cinemaai.repository.ShowtimeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
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

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedGenres();
        seedMovies();
        seedCinemaSchedule();
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
}
