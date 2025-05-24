// src/screens/CameraScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  PermissionStatus
} from 'expo-camera';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp }                  from '@react-navigation/native';
import { RootStackParamList }              from '../navigation/types';
import { API_URL }                         from '../services/api';

type CameraRouteProp = RouteProp<RootStackParamList, 'Camera'>;
type CameraNavProp   = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export default function CameraScreen({
  route, navigation
}: {
  route: CameraRouteProp;
  navigation: CameraNavProp;
}) {
  const { studentId, name } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType]     = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
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

  const snap = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      // 1️⃣ Capture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true
      });
      let fileUri = photo.uri;

      // 2️⃣ Upload
      const uploadData = new FormData();
      uploadData.append('photo', {
        uri: fileUri,
        name: `student${studentId}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      uploadData.append('studentId', String(studentId));

      const uploadRes = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        body: uploadData
      });
      if (!uploadRes.ok) throw new Error(await uploadRes.text());
      const { id: photoId } = await uploadRes.json();

      // 3️⃣ Analyze + overlay
      const analyzeData = new FormData();
      analyzeData.append('image', {
        uri: fileUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
      analyzeData.append('photoId', String(photoId));

      const analyzeRes = await fetch(`${API_URL}/posture/${photoId}/analyze`, {
        method: 'POST',
        body: analyzeData
      });
      if (!analyzeRes.ok) throw new Error(await analyzeRes.text());
      const analyzeJson = await analyzeRes.json();
      // { posture, angles, overlay }

      // 4️⃣ Navigate to PhotoReview
      navigation.navigate('PhotoReview', {
        uri:     photo.uri,
        overlay: analyzeJson.overlay,
        angles:  analyzeJson.angles,
        posture: analyzeJson.posture,
        studentId,
        name
      });

    } catch (e: any) {
      console.error(e);
      Alert.alert('Eroare', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
      >
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

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
            style={styles.sideBtn}
            onPress={() => setCameraType(ct => (ct === 'back' ? 'front' : 'back'))}
            activeOpacity={0.7}
          >
            <Text style={styles.sideBtnIcon}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.snapBtn}
            onPress={snap}
            activeOpacity={0.7}
            disabled={loading}
          >
            <View style={styles.snapInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.7}
          >
            <Text style={styles.sideBtnIcon}>✖️</Text>
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
  text:                      {
                                color: '#fff',
                                marginBottom: 12,
                                textAlign: 'center',
                                textShadowColor: '#000',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 4,
                                fontSize: 18,
                                fontWeight: '600',
                              },
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
                                bottom: 38,
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                paddingHorizontal: 38,
                                zIndex: 10,
                              },
  sideBtn:                   {
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: '#f3f4f6',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#e0e0e0',
                                shadowColor: '#000',
                                shadowOpacity: 0.08,
                                shadowRadius: 3,
                                elevation: 1,
                              },
  sideBtnIcon:               {
                                fontSize: 22,
                                color: '#3b5bfd',
                                fontWeight: 'bold',
                              },
  snapBtn:                   {
                                width: 74,
                                height: 74,
                                borderRadius: 37,
                                borderWidth: 4,
                                borderColor: '#27ae60',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                shadowColor: '#27ae60',
                                shadowOpacity: 0.13,
                                shadowRadius: 8,
                                elevation: 4,
                              },
  snapInner:                 {
                                width: 54,
                                height: 54,
                                borderRadius: 27,
                                backgroundColor: '#27ae60',
                              },
  loadingOverlay:            {
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 10
                              }
});
