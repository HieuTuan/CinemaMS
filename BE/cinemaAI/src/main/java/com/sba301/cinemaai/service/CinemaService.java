package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.cinema.CinemaRequest;
import com.sba301.cinemaai.dto.cinema.CinemaResponse;
import com.sba301.cinemaai.entity.Cinema;
import com.sba301.cinemaai.enums.CinemaStatus;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.mapper.CinemaMapper;
import com.sba301.cinemaai.repository.CinemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final CinemaMapper cinemaMapper;

    @Transactional(readOnly = true)
    public CinemaResponse getPublicCinema() {
        return cinemaMapper.toCinemaResponse(findActiveSingleton());
    }

    @Transactional(readOnly = true)
    public CinemaResponse getAdminCinema() {
        return cinemaMapper.toCinemaResponse(findSingleton());
    }

    @Transactional(readOnly = true)
    public CinemaResponse getCinema(Long id) {
        return cinemaMapper.toCinemaResponse(findSingletonById(id));
    }

    @Transactional
    public CinemaResponse create(CinemaRequest request) {
        return cinemaRepository.findFirstByOrderByIdAsc()
                .map(cinema -> cinemaMapper.toCinemaResponse(updateSingleton(cinema, request)))
                .orElseGet(() -> createSingleton(request));
    }

    @Transactional
    public CinemaResponse update(CinemaRequest request) {
        return cinemaMapper.toCinemaResponse(updateSingleton(findSingleton(), request));
    }

    @Transactional
    public CinemaResponse update(Long id, CinemaRequest request) {
        return cinemaMapper.toCinemaResponse(updateSingleton(findSingletonById(id), request));
    }

    @Transactional
    public CinemaResponse updateStatus(CinemaStatus status) {
        Cinema cinema = findSingleton();
        cinema.changeStatus(status);
        return cinemaMapper.toCinemaResponse(cinema);
    }

    @Transactional
    public CinemaResponse updateStatus(Long id, CinemaStatus status) {
        Cinema cinema = findSingletonById(id);
        cinema.changeStatus(status);
        return cinemaMapper.toCinemaResponse(cinema);
    }

    @Transactional
    public void delete() {
        findSingleton().changeStatus(CinemaStatus.INACTIVE);
    }

    @Transactional
    public void delete(Long id) {
        findSingletonById(id).changeStatus(CinemaStatus.INACTIVE);
    }

    public Cinema findSingleton() {
        return cinemaRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new NotFoundException("Cinema is not configured"));
    }

    public Cinema findActiveSingleton() {
        Cinema cinema = findSingleton();
        if (cinema.getStatus() != CinemaStatus.ACTIVE) {
            throw new NotFoundException("Active cinema is not configured");
        }
        return cinema;
    }

    public Cinema findSingletonById(Long id) {
        Cinema cinema = findSingleton();
        if (!cinema.getId().equals(id)) {
            throw new NotFoundException("Cinema not found");
        }
        return cinema;
    }

    private CinemaResponse createSingleton(CinemaRequest request) {
        Cinema cinema = new Cinema(request.name(), request.address(), request.city(), request.phone());
        cinema.changeStatus(request.status() == null ? CinemaStatus.ACTIVE : request.status());
        return cinemaMapper.toCinemaResponse(cinemaRepository.save(cinema));
    }

    private Cinema updateSingleton(Cinema cinema, CinemaRequest request) {
        cinema.updateInfo(request.name(), request.address(), request.city(), request.phone());
        cinema.changeStatus(request.status() == null ? cinema.getStatus() : request.status());
        return cinema;
    }
}
