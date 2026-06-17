package com.sba301.cinemaai.staff;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.cinemaai.dto.request.auth.LoginRequest;
import com.sba301.cinemaai.entity.Role;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.entity.UserRole;
import com.sba301.cinemaai.enums.RoleName;
import com.sba301.cinemaai.repository.RoleRepository;
import com.sba301.cinemaai.repository.UserRepository;
import com.sba301.cinemaai.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReportIntegrationTests {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRoleRepository userRoleRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void shouldReturnDashboardSummary() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/reports/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRevenue").exists())
                .andExpect(jsonPath("$.data.totalBookings").exists())
                .andExpect(jsonPath("$.data.totalStaff").exists())
                .andExpect(jsonPath("$.data.occupancyRate").exists())
                .andExpect(jsonPath("$.data.totalShowtimes").exists())
                .andExpect(jsonPath("$.data.activeMovies").exists());
    }

    @Test
    void shouldReturnRevenueReportGroupedByDay() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/reports/revenue")
                        .header("Authorization", "Bearer " + token)
                        .param("groupBy", "day"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRevenue").exists())
                .andExpect(jsonPath("$.data.totalBookings").exists())
                .andExpect(jsonPath("$.data.periods").isArray());
    }

    @Test
    void shouldReturnRevenueReportGroupedByMonth() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/reports/revenue")
                        .header("Authorization", "Bearer " + token)
                        .param("groupBy", "month")
                        .param("from", "2026-01-01")
                        .param("to", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.periods").isArray());
    }

    @Test
    void shouldReturnOccupancyReport() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/reports/occupancy")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.overallOccupancyRate").exists())
                .andExpect(jsonPath("$.data.totalSeats").exists())
                .andExpect(jsonPath("$.data.occupiedSeats").exists())
                .andExpect(jsonPath("$.data.showtimes").isArray());
    }

    @Test
    void shouldReturnMoviePerformanceReport() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/reports/movie-performance")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.movies").isArray());
    }

    @Test
    void shouldReturnRecommendationEffectivenessReport() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/reports/recommendation-effectiveness")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.avgDelta").exists())
                .andExpect(jsonPath("$.data.analyzedMovieCount").exists())
                .andExpect(jsonPath("$.data.movies").isArray());
    }

    @Test
    void shouldRequireAuthForReports() throws Exception {
        for (String path : new String[]{
                "/api/v1/admin/reports/dashboard",
                "/api/v1/admin/reports/revenue",
                "/api/v1/admin/reports/occupancy",
                "/api/v1/admin/reports/movie-performance",
                "/api/v1/admin/reports/recommendation-effectiveness"
        }) {
            mockMvc.perform(get(path))
                    .andExpect(result -> {
                        int s = result.getResponse().getStatus();
                        assert s == 401 || s == 403 : "Expected 401 or 403 for " + path + ", got " + s;
                    });
        }
    }

    // ---- helpers ----

    private String loginAsAdmin() throws Exception {
        String email    = "report.admin." + System.nanoTime() + "@example.com";
        String password = "Password123";
        Role adminRole  = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ADMIN)));

        User admin = new User(email, passwordEncoder.encode(password), "Report Admin", "0911000111");
        admin.activateEmail();
        User saved = userRepository.save(admin);
        userRoleRepository.save(new UserRole(saved, adminRole));

        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).at("/data/accessToken").asText();
    }
}
