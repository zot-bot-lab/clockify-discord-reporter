// Sri Lankan Public Holidays for 2026
// Format: YYYY-MM-DD
const HOLIDAYS_2026 = [
    "2026-01-02", // Duruthu Full Moon Poya Day
    "2026-02-01", // Navam Full Moon Poya Day
    "2026-02-04", // Independence Day
    "2026-03-03", // Medin Full Moon Poya Day
    "2026-04-01", // Bak Full Moon Poya Day
    "2026-04-13", // Day prior to Sinhala and Tamil New Year Day
    "2026-04-14", // Sinhala and Tamil New Year Day
    "2026-05-01", // May Day AND Vesak Full Moon Poya Day
    "2026-05-02", // Day following Vesak Full Moon Poya Day
    "2026-05-30", // Adhi Poson Full Moon Poya Day
    "2026-06-29", // Poson Full Moon Poya Day
    "2026-07-29", // Esala Full Moon Poya Day
    "2026-08-27", // Nikini Full Moon Poya Day
    "2026-09-26", // Binara Full Moon Poya Day
    "2026-10-25", // Vap Full Moon Poya Day
    "2026-11-24", // Ill Full Moon Poya Day
    "2026-12-23", // Unduvap Full Moon Poya Day
    "2026-12-25"  // Christmas Day
];

// Estimated Public Holidays for 2027
const HOLIDAYS_2027 = [
    "2027-01-22", // Duruthu Full Moon Poya Day
    "2027-02-04", // Independence Day
    "2027-02-20", // Navam Full Moon Poya Day
    "2027-03-21", // Madin Full Moon Poya Day
    "2027-03-26", // Bak Full Moon Poya Day AND Good Friday
    "2027-04-13", // Day prior to Sinhala and Tamil New Year Day
    "2027-04-14", // Sinhala and Tamil New Year Day
    "2027-05-01", // May Day
    "2027-05-21", // Vesak Full Moon Poya Day
    "2027-05-22", // Day following Vesak Full Moon Poya Day
    "2027-07-18", // Poson Full Moon Poya Day
    "2027-08-15", // Esala Full Moon Poya Day AND Milad-Un-Nabi
    "2027-09-15", // Binara Full Moon Poya Day
    "2027-10-15", // Vap Full Moon Poya Day
    "2027-11-14", // Ill Full Moon Poya Day (Estimate)
    "2027-12-13", // Unduvap Full Moon Poya Day (Estimate)
    "2027-12-25"  // Christmas Day
];

// Estimated Public Holidays for 2028
const HOLIDAYS_2028 = [
    "2028-01-12", // Duruthu Full Moon Poya Day
    "2028-02-04", // Independence Day
    "2028-02-25", // Navam Full Moon Poya Day
    "2028-03-24", // Medin Full Moon Poya Day
    "2028-04-10", // Bak Full Moon Poya Day
    "2028-04-13", // Day prior to Sinhala and Tamil New Year Day
    "2028-04-14", // Sinhala and Tamil New Year Day
    "2028-05-01", // May Day
    "2028-05-08", // Vesak Full Moon Poya Day
    "2028-05-09", // Day following Vesak Full Moon Poya Day (Estimate)
    "2028-06-05", // Poson Full Moon Poya Day
    "2028-07-02", // Esala Full Moon Poya Day
    "2028-08-01", // Nikini Full Moon Poya Day
    "2028-08-30", // Binara Full Moon Poya Day
    "2028-09-28", // Vap Full Moon Poya Day
    "2028-10-27", // Ill Full Moon Poya Day AND Deepavali (Estimate)
    "2028-11-25", // Unduvap Full Moon Poya Day
    "2028-12-25"  // Christmas Day
];

const ALL_HOLIDAYS = [
    ...HOLIDAYS_2026,
    ...HOLIDAYS_2027,
    ...HOLIDAYS_2028
];

/**
 * Checks if a given date string is a public holiday in Sri Lanka.
 * @param {string} dateStr - Date string in YYYY-MM-DD format (e.g., "2026-01-14")
 * @returns {boolean} - True if the date is a public holiday, false otherwise.
 */
function isPublicHoliday(dateStr) {
    return ALL_HOLIDAYS.includes(dateStr);
}

module.exports = { isPublicHoliday };
