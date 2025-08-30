/**
 * Utility functions for formatting data in both English and Arabic contexts
 */
// Date formatting utilities
export const formatDate = (date, locale = 'en') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return dateObj.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', options);
};
export const formatDateTime = (date, locale = 'en') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return dateObj.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', options);
};
export const formatTimeAgo = (date, locale = 'en') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };
    const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        numeric: 'auto',
    });
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return rtf.format(-interval, unit);
        }
    }
    return rtf.format(-diffInSeconds, 'second');
};
// Number formatting utilities
export const formatCurrency = (amount, currency = 'USD', locale = 'en') => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};
export const formatNumber = (number, locale = 'en') => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(number);
};
export const formatPercentage = (value, locale = 'en') => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value / 100);
};
// Text formatting utilities
export const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
export const truncateText = (text, maxLength, suffix = '...') => {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
};
export const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F]+/g, '-') // Include Arabic characters
        .replace(/^-+|-+$/g, '');
};
// File size formatting
export const formatFileSize = (bytes, locale = 'en') => {
    const units = locale === 'ar'
        ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
        : ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0)
        return `0 ${units[0]}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${formatNumber(size, locale)} ${units[i]}`;
};
// Phone number formatting
export const formatPhoneNumber = (phoneNumber, countryCode = 'US') => {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format based on country code
    if (countryCode === 'SA') {
        // Saudi Arabia format: +966 XX XXX XXXX
        if (cleaned.length === 9) {
            return `+966 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
        }
    }
    else if (countryCode === 'US') {
        // US format: (XXX) XXX-XXXX
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
    }
    return phoneNumber; // Return original if no formatting applied
};
// Address formatting
export const formatAddress = (address, locale = 'en') => {
    const parts = [];
    if (address.street)
        parts.push(address.street);
    parts.push(address.city);
    if (address.state)
        parts.push(address.state);
    if (address.zipCode)
        parts.push(address.zipCode);
    parts.push(address.country);
    return parts.join(', ');
};
// Duration formatting
export const formatDuration = (minutes, locale = 'en') => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (locale === 'ar') {
        if (hours > 0 && remainingMinutes > 0) {
            return `${hours} ساعة ${remainingMinutes} دقيقة`;
        }
        else if (hours > 0) {
            return `${hours} ساعة`;
        }
        else {
            return `${remainingMinutes} دقيقة`;
        }
    }
    else {
        if (hours > 0 && remainingMinutes > 0) {
            return `${hours}h ${remainingMinutes}m`;
        }
        else if (hours > 0) {
            return `${hours}h`;
        }
        else {
            return `${remainingMinutes}m`;
        }
    }
};
//# sourceMappingURL=formatting.js.map