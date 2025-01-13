/**
 * Maps trip type IDs to their corresponding database strings
 */
const TRIP_TYPE_MAP = {
    1: 'short',
    2: 'day',
    3: 'sunrise',
    4: 'overnight'
  };
  
  export const mapTripTypesToDatabaseStrings = (tripTypeIds) => {
    try {
      const ids = typeof tripTypeIds === 'string' ? JSON.parse(tripTypeIds) : tripTypeIds;
      
      if (!Array.isArray(ids)) {
        console.error('tripTypeIds is not an array:', ids);
        return [];
      }
  
      return ids
        .filter(id => TRIP_TYPE_MAP[id])
        .map(id => TRIP_TYPE_MAP[id]);
    } catch (error) {
      console.error('Error parsing tripTypeIds:', error);
      return [];
    }
  };
