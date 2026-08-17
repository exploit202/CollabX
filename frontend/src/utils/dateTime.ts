/**
 * Centralized Date & Time Formatting System
 * Formats dates and timestamps in the user's selected canonical IANA timezone.
 */

export const IANA_TIMEZONE_MAP: Record<string, string> = {
  'Asia/Kolkata': 'Asia/Kolkata',
  'America/New_York': 'America/New_York',
  'Europe/London': 'Europe/London',
  UTC: 'UTC',
  'Asia/Kolkata (IST)': 'Asia/Kolkata',
  'America/New_York (EST)': 'America/New_York',
  'Europe/London (GMT)': 'Europe/London'
};

export const getCanonicalTimezone = (tz?: string): string => {
  if (!tz) return 'Asia/Kolkata';
  return IANA_TIMEZONE_MAP[tz] || tz;
};

/**
 * Formats a date into a localized date string according to the specified IANA timezone.
 */
export const formatDate = (
  dateInput?: string | Date | number | null,
  timezone = 'Asia/Kolkata'
): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const validTz = getCanonicalTimezone(timezone);

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: validTz,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (_) {
    return date.toLocaleDateString('en-GB');
  }
};

/**
 * Formats a date & time into a localized string according to the specified IANA timezone.
 */
export const formatDateTime = (
  dateInput?: string | Date | number | null,
  timezone = 'Asia/Kolkata'
): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const validTz = getCanonicalTimezone(timezone);

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: validTz,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return formatter.format(date);
  } catch (_) {
    return date.toLocaleString();
  }
};
