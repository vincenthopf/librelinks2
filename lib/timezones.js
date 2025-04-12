/**
 * List of common timezones for selection.
 * Covers the range from UTC-12 to UTC+14 with representative cities.
 * Source: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
export const timezones = [
  { value: 'UTC', label: 'UTC' },

  // UTC-12 to UTC-1
  { value: 'Pacific/Kwajalein', label: 'Baker Island (UTC-12)' },
  { value: 'Pacific/Samoa', label: 'Samoa (UTC-11)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (UTC-10)' },
  { value: 'Pacific/Marquesas', label: 'Marquesas Islands (UTC-9:30)' },
  { value: 'America/Anchorage', label: 'Anchorage (UTC-9)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT | UTC-8)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT | UTC-7)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT | UTC-6)' },
  { value: 'America/New_York', label: 'New York (EST/EDT | UTC-5)' },
  { value: 'America/Caracas', label: 'Caracas (UTC-4)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
  { value: 'America/St_Johns', label: "St. John's (UTC-3:30)" },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' },
  { value: 'Atlantic/Cape_Verde', label: 'Cape Verde (UTC-1)' },

  // UTC+1 to UTC+14
  { value: 'Europe/London', label: 'London (GMT/BST | UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST | UTC+1/+2)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST | UTC+1/+2)' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST | UTC+2/+3)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK | UTC+3)' },
  { value: 'Asia/Tehran', label: 'Tehran (UTC+3:30)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST | UTC+4)' },
  { value: 'Asia/Kabul', label: 'Kabul (UTC+4:30)' },
  { value: 'Asia/Karachi', label: 'Karachi (UTC+5)' },
  { value: 'Asia/Kolkata', label: 'New Delhi (UTC+5:30)' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu (UTC+5:45)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (UTC+6)' },
  { value: 'Asia/Yangon', label: 'Yangon (UTC+6:30)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST | UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST | UTC+9)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (UTC+9:30)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT | UTC+10/+11)' },
  { value: 'Pacific/Norfolk', label: 'Norfolk Island (UTC+11)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT | UTC+12/+13)' },
  { value: 'Pacific/Chatham', label: 'Chatham Islands (UTC+12:45)' },
  { value: 'Pacific/Apia', label: 'Apia (UTC+13)' },
  { value: 'Pacific/Kiritimati', label: 'Kiritimati (UTC+14)' },
];
