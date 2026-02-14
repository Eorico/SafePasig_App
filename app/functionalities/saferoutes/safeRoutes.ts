// haversine formula
export function getDistance(
    lat1: number, long1: number, // point 1
    lat2:number, long2:number   // point 2
) {
    const R = 6371e3; // meters
    const latRadians1 = (lat1 * Math.PI) / 180; 
    const latRadians2 = (lat2 * Math.PI) / 180;
    const changeLat = ((lat2 - lat1) * Math.PI) /180; 
    const changeLong = ((long2 - long1) * Math.PI) /180; 

    const a = 
        Math.sin(changeLat / 2) * Math.sin(changeLat) +
        Math.cos(latRadians1) * Math.cos(latRadians2) *
        Math.sin(changeLong / 2) * Math.sin(changeLong / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}