/**
 * Upazila Coordinates and Geographical Ranges for Kushtia District
 * Contains center coordinates and geographical bounds for the 6 upazilas
 * Bounds format: { minLat, maxLat, minLng, maxLng }
 */

const upazilasCoordinates = {
  // Bengali names - each entry contains center coords and geographical range
  'কুষ্টিয়া সদর': {
    center: { lat: 23.9000, lng: 89.1333 },
    bounds: { minLat: 23.7, maxLat: 23.9833, minLng: 88.9167, maxLng: 89.0667 }
  },
  'ভেড়ামারা': {
    center: { lat: 24.0167, lng: 88.9917 },
    bounds: { minLat: 23.9833, maxLat: 24.1167, minLng: 88.0, maxLng: 89.2 }
  },
  'দৌলতপুর': {
    center: { lat: 24.0014, lng: 88.8750 },
    bounds: { minLat: 23.8667, maxLat: 24.2, minLng: 88.7, maxLng: 88.9667 }
  },
  'খোকসা': {
    center: { lat: 23.8000, lng: 89.2833 },
    bounds: { minLat: 23.7333, maxLat: 23.8833, minLng: 89.25, maxLng: 89.3667 }
  },
  'কুমারখালী': {
    center: { lat: 23.8542, lng: 89.2417 },
    bounds: { minLat: 23.7333, maxLat: 23.9667, minLng: 89.15, maxLng: 89.3667 }
  },
  'মিরপুর': {
    center: { lat: 23.9333, lng: 89.0000 },
    bounds: { minLat: 23.75, maxLat: 24.0, minLng: 88.8333, maxLng: 89.1 }
  },

  // English names
  'Kushtia Sadar': {
    center: { lat: 23.9000, lng: 89.1333 },
    bounds: { minLat: 23.7, maxLat: 23.9833, minLng: 88.9167, maxLng: 89.0667 }
  },
  'Bheramara': {
    center: { lat: 24.0167, lng: 88.9917 },
    bounds: { minLat: 23.9833, maxLat: 24.1167, minLng: 88.0, maxLng: 89.2 }
  },
  'Daulatpur': {
    center: { lat: 24.0014, lng: 88.8750 },
    bounds: { minLat: 23.8667, maxLat: 24.2, minLng: 88.7, maxLng: 88.9667 }
  },
  'Khoksa': {
    center: { lat: 23.8000, lng: 89.2833 },
    bounds: { minLat: 23.7333, maxLat: 23.8833, minLng: 89.25, maxLng: 89.3667 }
  },
  'Kumarkhali': {
    center: { lat: 23.8542, lng: 89.2417 },
    bounds: { minLat: 23.7333, maxLat: 23.9667, minLng: 89.15, maxLng: 89.3667 }
  },
  'Mirpur': {
    center: { lat: 23.9333, lng: 89.0000 },
    bounds: { minLat: 23.75, maxLat: 24.0, minLng: 88.8333, maxLng: 89.1 }
  }
};

module.exports = upazilasCoordinates;
