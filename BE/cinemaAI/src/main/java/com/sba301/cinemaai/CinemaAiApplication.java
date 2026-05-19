package com.sba301.cinemaai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class CinemaAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CinemaAiApplication.class, args);
	}

}
