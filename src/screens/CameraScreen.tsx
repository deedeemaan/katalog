// src/screens/CameraScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  PermissionStatus
} from 'expo-camera';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp }                      from '@react-navigation/native';
import { RootStackParamList }                  from '../navigation/types';

type CameraRouteProp = RouteProp<RootStackParamList, 'Camera'>;
type CameraNavProp   = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export default function CameraScreen({
  route,
  navigation
}: {
  route: CameraRouteProp;
  navigation: CameraNavProp;
}) {
  const { studentId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType]     = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);

  // 1️⃣ Așteptăm permisiunile
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  // 2️⃣ Cerem permisiunea dacă nu e încă acordată
  if (permission.status !== PermissionStatus.GRANTED) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera access is required.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3️⃣ Capturează poza și navighează spre PhotoReview
  const snap = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true
      });
      navigation.navigate('PhotoReview', {
        uri: photo.uri,
        studentId,
      });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
      >
        {/* Grid overlay: 10cm×10cm squares */}
        <View style={styles.gridContainer}>
          {Array.from({ length: 11 }).map((_, i) => (
            <View
              key={`v${i}`}
              style={[
                styles.gridLineVertical,
                { left: `${(i / 10) * 100}%` },
                i === 5 && styles.gridLineCenterVertical
              ]}
            />
          ))}
          {Array.from({ length: 21 }).map((_, j) => (
            <View
              key={`h${j}`}
              style={[
                styles.gridLineHorizontal,
                { top: `${(j / 20) * 100}%` },
                j === 10 && styles.gridLineCenterHorizontal
              ]}
            />
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() =>
              setCameraType(ct => (ct === 'back' ? 'front' : 'back'))
            }
          >
            <Text style={styles.btnText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={snap}>
            <Text style={styles.btnText}>Snap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:                 { flex: 1, backgroundColor: '#000' },
  camera:                    { flex: 1 },
  center:                    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  text:                      { color: '#fff', marginBottom: 12, textAlign: 'center' },
  btn:                       { backgroundColor: '#007AFF', padding: 12, borderRadius: 6 },
  btnText:                   { color: '#fff', fontWeight: '600' },
  gridContainer:             { ...StyleSheet.absoluteFillObject },
  gridLineVertical:          {
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                width: 1,
                                backgroundColor: 'rgba(255,255,255,0.5)'
                              },
  gridLineHorizontal:        {
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                height: 1,
                                backgroundColor: 'rgba(255,255,255,0.5)'
                              },
  gridLineCenterVertical:    { width: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  gridLineCenterHorizontal:  { height: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  controls:                  {
                                position: 'absolute',
                                bottom: 32,
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-around'
                              },
  controlBtn:                {
                                backgroundColor: '#ffffff80',
                                padding: 10,
                                borderRadius: 6
                              }
});
