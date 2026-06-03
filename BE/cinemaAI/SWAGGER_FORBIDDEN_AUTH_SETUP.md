# Swagger Forbidden (403) Authentication Setup

## Overview
This document describes the Swagger/OpenAPI documentation setup for forbidden (403) authentication responses in the CineAI API.

## Changes Made

### 1. OpenAPI Configuration (OpenApiConfig.java)
Updated the OpenAPI configuration to include JWT Bearer authentication security scheme:

```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI cineAiOpenApi() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token")))
                .info(new Info()
                        .title("CineAI API")
                        .version("v1")
                        .description("Cinema booking platform with AI movie analysis"));
    }
}
```

**Key Features:**
- Defines `Bearer Authentication` as a global security requirement
- Sets HTTP Bearer scheme with JWT format
- Provides clear description for API consumers

### 2. Admin Controllers Updated
The following admin controllers now include complete Swagger annotations:

#### **AdminMovieController**
- Security requirement: ADMIN role only
- All endpoints documented with 403 Forbidden response

```java
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin Movies", description = "Admin movie management endpoints - requires ADMIN role")
```

#### **AdminGenreController**
- Document CRUD operations for genres
- Includes 403 Forbidden and 401 Unauthorized responses

#### **AdminCinemaController**
- Cinema management endpoints
- Full error documentation including 403/401

#### **AdminFoodController**
- Food items and combos management
- 403 Forbidden for unauthorized access

#### **AdminRoomController**
- Room and seat management
- Complete security documentation

#### **AdminShowtimeController**
- Showtime management with filtering
- 403 Forbidden for non-admin users

#### **AdminUserController**
- User management endpoints
- Security and role-based access documentation

#### **AdminMovieAnalysisController**
- AI analysis endpoints for movies
- 403 responses for non-admin users

### 3. Staff Check-In Controller
Updated **StaffCheckInController** with:
- Security requirement: ADMIN or STAFF role
- 403 Forbidden for users without proper role
- Clear documentation of who can access the endpoint

```java
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Check-In", description = "Check-in endpoints - requires ADMIN or STAFF role")
```

## Response Documentation

### Standard Response Codes Documented:

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request body |
| 401 | Unauthorized - JWT token missing or invalid |
| **403** | **Forbidden - User does not have required role** |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |

## Example Swagger Documentation

Each endpoint now includes:

```java
@Operation(summary = "Create movie (Admin)", description = "Create a new movie (Admin only)")
@ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Movie created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User does not have ADMIN role"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - Resource already exists")
})
```

## Security Configuration Reference

Based on `SecurityConfig.java`, the following access levels are enforced:

### Public Access (No Authentication Required)
- `GET /api/v1/movies/**`
- `GET /api/v1/genres/**`
- `GET /api/v1/cinemas/**`
- `GET /api/v1/showtimes/**`
- `GET /api/v1/foods/**`
- `POST /api/v1/auth/**`
- Swagger UI: `/swagger-ui/**`, `/v3/api-docs/**`

### Admin Only (403 if not ADMIN)
- `POST /api/v1/admin/**`
- `PUT /api/v1/admin/**`
- `PATCH /api/v1/admin/**`
- `DELETE /api/v1/admin/**`

### Staff or Admin (403 if neither ADMIN nor STAFF)
- `/api/v1/staff/**`
- `/api/v1/admin/check-in`

### Authenticated (403 if not authenticated)
- All other endpoints require valid JWT token

## Testing in Swagger UI

1. Navigate to `/swagger-ui.html`
2. Click the "Authorize" button
3. Enter your JWT token in format: `Bearer <your-jwt-token>`
4. Try unauthorized requests to see 403 responses
5. All endpoints now show clear 403 Forbidden documentation

## Files Modified

1. `src/main/java/com/sba301/cinemaai/config/OpenApiConfig.java`
2. `src/main/java/com/sba301/cinemaai/controller/AdminMovieController.java`
3. `src/main/java/com/sba301/cinemaai/controller/AdminGenreController.java`
4. `src/main/java/com/sba301/cinemaai/controller/AdminCinemaController.java`
5. `src/main/java/com/sba301/cinemaai/controller/AdminFoodController.java`
6. `src/main/java/com/sba301/cinemaai/controller/AdminRoomController.java`
7. `src/main/java/com/sba301/cinemaai/controller/AdminShowtimeController.java`
8. `src/main/java/com/sba301/cinemaai/controller/AdminUserController.java`
9. `src/main/java/com/sba301/cinemaai/controller/AdminMovieAnalysisController.java`
10. `src/main/java/com/sba301/cinemaai/controller/StaffCheckInController.java`

## Benefits

✅ Clear documentation of all authentication requirements
✅ 403 Forbidden responses explicitly documented
✅ JWT Bearer token security scheme defined
✅ Role-based access control clearly communicated
✅ Better API consumer experience
✅ Automatic Swagger UI Bearer token input field
✅ Complete error response documentation
✅ Professional API documentation

## Next Steps (Optional)

To further enhance the API documentation, consider:
1. Adding custom error response DTO documentation
2. Adding request/response examples
3. Adding more detailed descriptions for each endpoint
4. Creating API consumer guides
5. Adding deprecation notices for old endpoints (if any)

