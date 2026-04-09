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
 * Apply random variation to coordinates (±10%)
 * Adds small random offsets to latitude and longitude to prevent
 * multiple projects from the same upazila appearing at exact same location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Object with varied { lat, lng }
 */
function applyCoordinateVariation(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { lat, lng };
  }

  // Calculate 10% variation range
  const latVariation = Math.abs(lat) * 0.1;
  const lngVariation = Math.abs(lng) * 0.1;

  // Generate random variation between -10% and +10%
  const latOffset = (Math.random() - 0.5) * 2 * latVariation;
  const lngOffset = (Math.random() - 0.5) * 2 * lngVariation;

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  };
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
  // Round to 4 decimal places for consistency
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/**
 * Auto-populate lat/lng based on upazila name
 * Returns formatted coordinates string if upazila is found and lat_lng is not provided
 * Applies ±10% random variation to prevent all projects from same upazila
 * appearing at exact same location on maps
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
    // Apply ±10% random variation to coordinates
    const varied = applyCoordinateVariation(coordinates.lat, coordinates.lng);
    return formatCoordinates(varied.lat, varied.lng);
  }

  return null;
}

module.exports = {
  getUpazilaCordinates,
  applyCoordinateVariation,
  formatCoordinates,
  autoPopulateLatLng,
};
