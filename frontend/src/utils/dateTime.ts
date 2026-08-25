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

/**
 * Formats a notification date & time with 'Today at HH:MM AM/PM' or 'DD MMM YYYY, HH:MM AM/PM'.
 */
export const formatNotificationDateTime = (
  dateInput?: string | Date | number | null,
  timezone = 'Asia/Kolkata'
): string => {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const validTz = getCanonicalTimezone(timezone);

  try {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: validTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const timeStr = timeFormatter.format(date);

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: validTz,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    return `${dateFormatter.format(date)}, ${timeStr}`;
  } catch (_) {
    return date.toLocaleString();
  }
};

/**
 * Formats a timestamp into clean, relative time (e.g., 'Just now', '2 min ago', '1 hour ago', 'Yesterday', 'Aug 22, 2026').
 */
export const formatRelativeTime = (dateInput?: string | Date | number | null): string => {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0 || diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};
