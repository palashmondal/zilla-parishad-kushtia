/**
 * Location Helper Utilities
 * Provides functions for mapping upazila names to geographic coordinates
 */

const upazilasCoordinates = require('../data/upazila-coordinates');

/**
 * Get coordinates data (center + bounds) for a given upazila name
 * @param {string} upazilName - The upazila name (Bengali or English)
 * @returns {Object|null} Object with { center, bounds } or null if not found
 */
function getUpazilaCordinates(upazilName) {
  if (!upazilName || typeof upazilName !== 'string') {
    return null;
  }

  // Trim and normalize the input
  const normalizedName = upazilName.trim();

  // Try exact match first
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
 * Generate random coordinates within upazila's geographical bounds
 * Prevents multiple projects from same upazila appearing at exact same location
 * by distributing them across the upazila's actual geographical range
 * @param {Object} coordinateData - Object with { center, bounds }
 * @returns {Object} Object with random { lat, lng } within bounds
 */
function generateRandomCoordinateWithinBounds(coordinateData) {
  if (!coordinateData || !coordinateData.bounds) {
    return null;
  }

  const { bounds } = coordinateData;
  const { minLat, maxLat, minLng, maxLng } = bounds;

  // Generate random lat/lng within the geographical bounds
  const randomLat = minLat + Math.random() * (maxLat - minLat);
  const randomLng = minLng + Math.random() * (maxLng - minLng);

  return {
    lat: randomLat,
    lng: randomLng,
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
 * Generates random coordinates within the upazila's geographical bounds
 * to prevent all projects from same upazila appearing at exact same location
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

  // Try to get coordinates data for the upazila
  const coordinateData = getUpazilaCordinates(upazila);

  if (coordinateData) {
    // Generate random coordinates within the upazila's geographical bounds
    const randomCoords = generateRandomCoordinateWithinBounds(coordinateData);
    if (randomCoords) {
      return formatCoordinates(randomCoords.lat, randomCoords.lng);
    }
  }

  return null;
}

module.exports = {
  getUpazilaCordinates,
  generateRandomCoordinateWithinBounds,
  formatCoordinates,
  autoPopulateLatLng,
};
