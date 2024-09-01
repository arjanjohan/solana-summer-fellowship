import { request, PERMISSIONS } from 'react-native-permissions';

export const requestPermissions = async () => {
    try {
        // const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
        const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        
        if (
            // cameraPermission === 'granted' && 
            locationPermission === 'granted') {
            console.log('All permissions granted');
        } else {
            console.log('Permissions not granted');
        }
    } catch (error) {
        console.error("Permission error: ", error);
    }
};
