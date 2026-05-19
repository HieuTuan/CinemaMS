package com.sba301.cinemaai.entity;

import com.sba301.cinemaai.enums.MovieStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "movies",
        indexes = {
                @Index(name = "idx_movies_status", columnList = "status"),
                @Index(name = "idx_movies_release_date", columnList = "release_date")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Movie extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Lob
    private String description;

    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(length = 50)
    private String language;

    @Column(name = "subtitle_language", length = 50)
    private String subtitleLanguage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MovieStatus status = MovieStatus.UPCOMING;

    @Column(name = "age_rating", length = 20)
    private String ageRating;

    private String director;

    @Lob
    @Column(name = "cast_list")
    private String castList;

    public Movie(String title, int durationMinutes, MovieStatus status) {
        this.title = title;
        this.durationMinutes = durationMinutes;
        this.status = status;
    }

    public void updateDetails(String title, String description, int durationMinutes, LocalDate releaseDate) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.releaseDate = releaseDate;
    }

    public void updateMedia(String trailerUrl, String posterUrl) {
        this.trailerUrl = trailerUrl;
        this.posterUrl = posterUrl;
    }

    public void updateMetadata(
            String language,
            String subtitleLanguage,
            String ageRating,
            String director,
            String castList
    ) {
        this.language = language;
        this.subtitleLanguage = subtitleLanguage;
        this.ageRating = ageRating;
        this.director = director;
        this.castList = castList;
    }

    public void changeStatus(MovieStatus status) {
        this.status = status;
    }
}
