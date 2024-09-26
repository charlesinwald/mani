import axios from 'axios';

export const getWeather = async (coordinates: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://wttr.in/${coordinates}?format=%C+%t`,
    );
    return response.data; // Ensure this returns the weather string
  } catch (error) {
    console.error('Error fetching weather:', error);
    return 'Weather not available'; // Fallback value in case of error
  }
};
