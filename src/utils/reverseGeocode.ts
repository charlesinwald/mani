export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
    );
    const data = await response.json();
    console.log('Reverse geocoding data:', data);
    return `${data?.address?.city}, ${data?.address?.state}`; // This is the full address
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
};
