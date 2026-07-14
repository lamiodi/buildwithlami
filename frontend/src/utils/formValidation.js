// ─── utils/formValidation.js ────────────────────────────
// Lightweight form validation utilities for booking/contact forms.
// Returns { valid, errors } — `errors` is keyed by field name.
// ──────────────────────────────────────────────────────────

/**
 * Validate an email address (basic RFC 5322)
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    // RFC 5322 simplified regex — covers 99% of real addresses
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Validate phone number (E.164 international format)
 * Accepts: +2348012345678, +1 555 123 4567, (555) 123-4567, 08012345678
 */
export function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const digits = phone.replace(/\D/g, '');
    // Allow 7-15 digits (ITU-T E.164 standard)
    return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validate a full name (at least 2 chars, at least one space OR is a single name ≥3 chars)
 */
export function isValidFullName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2) return false;
    return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed);
}

/**
 * Validate a date is in the future (for preferred_date)
 */
export function isFutureDate(dateStr) {
    if (!dateStr) return true; // optional
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
}

/**
 * Sanitize a string to prevent XSS in non-sanitized backends
 * Strips HTML tags, trims, collapses whitespace
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .trim()
        .replace(/[<>]/g, '')  // strip angle brackets
        .replace(/\s+/g, ' ');  // collapse whitespace
}

/**
 * Validate a booking form
 * @param {Object} data - { full_name, email, phone, service, location, preferred_date, notes }
 * @param {Object} options - { requirePhone: bool, requireLocation: bool }
 * @returns {Object} { valid: bool, errors: Object }
 */
export function validateBooking(data, options = {}) {
    const { requirePhone = false, requireLocation = false } = options;
    const errors = {};

    // Full name
    if (!data.full_name || !data.full_name.trim()) {
        errors.full_name = 'Full name is required.';
    } else if (!isValidFullName(data.full_name)) {
        errors.full_name = 'Please enter a valid name (letters only).';
    } else if (data.full_name.trim().length < 2) {
        errors.full_name = 'Name must be at least 2 characters.';
    }

    // Email
    if (!data.email || !data.email.trim()) {
        errors.email = 'Email is required.';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address.';
    }

    // Phone (optional by default)
    if (requirePhone) {
        if (!data.phone || !data.phone.trim()) {
            errors.phone = 'Phone number is required.';
        } else if (!isValidPhone(data.phone)) {
            errors.phone = 'Please enter a valid phone number (7-15 digits).';
        }
    } else if (data.phone && data.phone.trim() && !isValidPhone(data.phone)) {
        errors.phone = 'Please enter a valid phone number.';
    }

    // Service
    if (!data.service || !data.service.trim()) {
        errors.service = 'Please select a service.';
    }

    // Location (optional by default)
    if (requireLocation && (!data.location || !data.location.trim())) {
        errors.location = 'Project location is required.';
    }

    // Preferred date
    if (data.preferred_date && !isFutureDate(data.preferred_date)) {
        errors.preferred_date = 'Please select a future date.';
    }

    // Notes (optional, just sanitize if provided)
    if (data.notes && data.notes.length > 1000) {
        errors.notes = 'Notes must be under 1000 characters.';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Get a user-friendly error message for a field
 */
export function getFieldError(errors, field) {
    return errors[field] || '';
}

/**
 * Real-time validation for a single field (onBlur/onChange)
 */
export function validateField(name, value, options = {}) {
    switch (name) {
        case 'full_name':
            if (!value || !value.trim()) return 'Full name is required.';
            if (!isValidFullName(value)) return 'Please enter a valid name.';
            return '';
        case 'email':
            if (!value || !value.trim()) return 'Email is required.';
            if (!isValidEmail(value)) return 'Please enter a valid email address.';
            return '';
        case 'phone':
            if (!value || !value.trim()) return options.requirePhone ? 'Phone is required.' : '';
            if (!isValidPhone(value)) return 'Please enter a valid phone number.';
            return '';
        case 'service':
            if (!value || !value.trim()) return 'Please select a service.';
            return '';
        case 'preferred_date':
            if (value && !isFutureDate(value)) return 'Please select a future date.';
            return '';
        case 'notes':
            if (value && value.length > 1000) return 'Notes must be under 1000 characters.';
            return '';
        default:
            return '';
    }
}