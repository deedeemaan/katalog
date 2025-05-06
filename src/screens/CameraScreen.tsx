// // src/screens/CameraScreen.tsx
// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert
// } from 'react-native';
// // Importăm tot namespace-ul expo-camera
// import * as ExpoCamera from 'expo-camera';

// const {
//   Camera,
//   useCameraPermissions,
//   PermissionStatus,
//   CameraType
// } = ExpoCamera;

// export default function CameraScreen() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [isReady, setIsReady] = useState(false);
//   const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);

//   // 1️⃣ Așteptăm starea permisiunii
//   if (!permission) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#fff" />
//       </View>
//     );
//   }
//   // 2️⃣ Dacă nu e acordată, afișăm buton de grant
//   if (permission.status !== PermissionStatus.GRANTED) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.text}>
//           This app needs camera access to take posture photos.
//         </Text>
//         <TouchableOpacity style={styles.button} onPress={requestPermission}>
//           <Text style={styles.buttonText}>Grant Camera Access</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // 3️⃣ Afișăm preview-ul camerei
//   return (
//     <Camera
//       ref={cameraRef}
//       style={styles.camera}
//       onCameraReady={() => setIsReady(true)}
//       type={CameraType.back}
//       ratio="16:9"
//     />
//   );
// }

// const styles = StyleSheet.create({
//   camera: {
//     flex: 1,
//   },
//   center: {
//     flex: 1,
//     backgroundColor: '#000',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//   },
//   text: {
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 6,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });
