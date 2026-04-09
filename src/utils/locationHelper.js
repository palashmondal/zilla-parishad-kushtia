/**
 * Location Helper Utilities
 * Provides functions for mapping upazila names to geographic coordinates
 */

const upazilasCoordinates = require('../data/upazila-coordinates');

/**
 * Get latitude and longitude for a given upazila name
 * @param {string} upazilName - The upazila name (Bengali or English)
 * @returns {Object|null} Object with { lat, lng } or null if not found
 */
function getUpazilaCordinates(upazilName) {
  if (!upazilName || typeof upazilName !== 'string') {
    return null;
  }

  // Trim and normalize the input
  const normalizedName = upazilName.trim();

  // Try exact match first (case-insensitive for English names)
  if (upazilasCoordinates[normalizedName]) {
    return upazilasCoordinates[normalizedName];
  }

  // Try case-insensitive match for English names
  for (const [key, coordinates] of Object.entries(upazilasCoordinates)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return coordinates;
    }
  }

  // No match found
  return null;
}

/**
 * Format coordinates as a string (lat,lng) for database storage
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Formatted coordinates string
 */
function formatCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }
  return `${lat},${lng}`;
}

/**
 * Auto-populate lat/lng based on upazila name
 * Returns formatted coordinates string if upazila is found and lat_lng is not provided
 * @param {string} upazila - The upazila name
 * @param {string} lat_lng - Existing lat_lng value (if any)
 * @returns {string|null} Formatted coordinates or original lat_lng if provided
 */
function autoPopulateLatLng(upazila, lat_lng) {
  // If lat_lng is already provided, don't override it
  if (lat_lng && lat_lng.trim()) {
    return lat_lng;
  }

  // If upazila is not provided, return null
  if (!upazila || !upazila.trim()) {
    return null;
  }

  // Try to get coordinates for the upazila
  const coordinates = getUpazilaCordinates(upazila);

  if (coordinates) {
    return formatCoordinates(coordinates.lat, coordinates.lng);
  }

  return null;
}

module.exports = {
  getUpazilaCordinates,
  formatCoordinates,
  autoPopulateLatLng,
};
