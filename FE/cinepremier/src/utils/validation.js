export const MAX_NAME_LENGTH = 100;
export const PHONE_PREFIXES = ['03', '05', '08', '09'];
export const VIETNAM_PHONE_REGEX = /^(03|05|08|09)\d{8}$/;

export const normalizePhoneInput = (value) => value.replace(/\D/g, '').slice(0, 10);

export const normalizeNameInput = (value) => value.slice(0, MAX_NAME_LENGTH);

export const isValidVietnamPhone = (value) => VIETNAM_PHONE_REGEX.test(value.trim());

export const PHONE_VALIDATION_MESSAGE = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 08 hoặc 09.';
export const NAME_VALIDATION_MESSAGE = `Tên không được vượt quá ${MAX_NAME_LENGTH} ký tự.`;
