const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const STORAGE_KEYS = {
  accessToken: 'cinepremier_access_token',
  refreshToken: 'cinepremier_refresh_token',
  user: 'cinepremier_auth_user',
  roles: 'cinepremier_auth_roles'
};

const resolveRole = (roles = []) => {
  const normalized = roles.map((role) => String(role).toUpperCase());
  if (normalized.includes('ADMIN') || normalized.includes('ROLE_ADMIN')) return 'admin';
  if (normalized.includes('STAFF') || normalized.includes('ROLE_STAFF')) return 'staff';
  return 'user';
};

export const normalizeUser = (user, roles = user?.roles || []) => {
  if (!user) return null;
  const resolvedRoles = roles?.length ? roles : user.roles || [];

  return {
    ...user,
    roles: resolvedRoles,
    name: user.fullName || user.name || user.email,
    role: resolveRole(resolvedRoles),
    emailVerified: Boolean(user.emailVerified)
  };
};

const parseResponse = async (response) => {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok || payload?.success === false) {
    const fieldErrors = payload?.fieldErrors
      ? Object.values(payload.fieldErrors).flat().join(', ')
      : Array.isArray(payload?.errors)
        ? payload.errors.map((error) => error.message || `${error.field}: invalid`).join(', ')
      : '';
    const error = new Error(fieldErrors || payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return payload?.data ?? payload;
};

const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  return parseResponse(response);
};

export const saveAuthSession = (authData) => {
  if (!authData) return null;

  const user = normalizeUser(authData.user, authData.roles);
  localStorage.setItem(STORAGE_KEYS.accessToken, authData.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, authData.refreshToken);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(authData.roles || user?.roles || []));

  return user;
};

export const clearAuthSession = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

export const getStoredAuth = () => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  const roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.roles) || '[]');
  const storedUser = localStorage.getItem(STORAGE_KEYS.user);
  const user = storedUser ? normalizeUser(JSON.parse(storedUser), roles) : null;

  return { accessToken, refreshToken, roles, user };
};

export const authApi = {
  register: (payload) => request('/api/v1/auth/register', { method: 'POST', body: payload }),
  verifyEmail: (email, otp) => request('/api/v1/auth/verify-email', { method: 'POST', body: { email, otp } }),
  requestEmailVerification: (email) => request('/api/v1/auth/verify-email/request', {
    method: 'POST',
    body: { email }
  }),
  login: (payload) => request('/api/v1/auth/login', { method: 'POST', body: payload }),
  loginWithGoogle: (credential) => request('/api/v1/auth/google', {
    method: 'POST',
    body: { credential }
  }),
  verifyGoogleLoginOtp: (email, otp) => request('/api/v1/auth/google/verify', {
    method: 'POST',
    body: { email, otp }
  }),
  refresh: (refreshToken) => request('/api/v1/auth/refresh', { method: 'POST', body: { refreshToken } }),
  logout: (refreshToken) => request('/api/v1/auth/logout', { method: 'POST', body: { refreshToken } }),
  requestPasswordReset: (email) => request('/api/v1/auth/password-reset/request', {
    method: 'POST',
    body: { email }
  }),
  confirmPasswordReset: (token, newPassword) => request('/api/v1/auth/password-reset/confirm', {
    method: 'POST',
    body: { token, newPassword }
  }),
  getMyProfile: (token) => request('/api/v1/users/me', { token }),
  updateMyProfile: (token, payload) => request('/api/v1/users/me', {
    method: 'PUT',
    token,
    body: payload
  }),
  getAdminGenres: (token) => request('/api/v1/admin/genres', { token }),
  createAdminGenre: (token, payload) => request('/api/v1/admin/genres', {
    method: 'POST',
    token,
    body: payload
  }),
  updateAdminGenre: (token, genreId, payload) => request(`/api/v1/admin/genres/${genreId}`, {
    method: 'PUT',
    token,
    body: payload
  }),
  deleteAdminGenre: (token, genreId) => request(`/api/v1/admin/genres/${genreId}`, {
    method: 'DELETE',
    token
  }),
  getFoodItems: () => request('/api/v1/foods/items'),
  getFoodCombos: () => request('/api/v1/foods/combos'),
  getAdminFoodItems: (token) => request('/api/v1/admin/foods/items', { token }),
  getAdminFoodCombos: (token) => request('/api/v1/admin/foods/combos', { token }),
  createAdminFoodItem: (token, payload) => request('/api/v1/admin/foods/items', {
    method: 'POST',
    token,
    body: payload
  }),
  createAdminFoodCombo: (token, payload) => request('/api/v1/admin/foods/combos', {
    method: 'POST',
    token,
    body: payload
  }),
  updateAdminFoodItem: (token, itemId, payload) => request(`/api/v1/admin/foods/items/${itemId}`, {
    method: 'PUT',
    token,
    body: payload
  }),
  updateAdminFoodCombo: (token, comboId, payload) => request(`/api/v1/admin/foods/combos/${comboId}`, {
    method: 'PUT',
    token,
    body: payload
  })
};
