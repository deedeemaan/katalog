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
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

// Tipurile pentru navigație și parametrii rutei
type CameraRouteProp = RouteProp<RootStackParamList, 'Camera'>;
type CameraNavProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

// Componenta principală pentru capturarea și analiza imaginilor
export default function CameraScreen({
  route,
  navigation
}: {
  route: CameraRouteProp;
  navigation: CameraNavProp;
}) {
  const { student_id, name } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [camera_type, setCameraType] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const [loading, setLoading] = useState(false);

  // Verificarea permisiunilor pentru cameră
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
        <Text style={styles.text}>Acces la cameră este necesar.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Permite accesul</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Funcția pentru capturarea și procesarea imaginii
  const snap = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    let photo_id: number | undefined;
    try {
      // 1️⃣ Capture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      const file_uri = photo.uri;

      // 2️⃣ Upload către /photos/upload
      const upload_data = new FormData();
      upload_data.append('student_id', String(student_id));
      upload_data.append('photo', {
        uri: file_uri,
        name: `student${student_id}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const upload_res = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        body: upload_data,
      });
      if (!upload_res.ok) 
        throw new Error(await upload_res.text());
      const upload_json = await upload_res.json();
      photo_id = upload_json.id;

      // 3️⃣ Analiza la /posture/:photo_id/analyze
      const analyze_data = new FormData();
      analyze_data.append('image', {
        uri: file_uri,
        name: `photo.jpg`,
        type: 'image/jpeg',
      } as any);

      const analyze_res = await fetch(`${API_URL}/posture/${photo_id}/analyze`, {
        method: 'POST',
        body: analyze_data,
      });
      if (!analyze_res.ok) {
        // Șterge poza de pe server dacă analiza a eșuat
        await fetch(`${API_URL}/photos/${photo_id}`, { method: 'DELETE' });
        throw new Error(await analyze_res.text() || 'Analiza posturală a eșuat.');
      }
      const analyze_json = await analyze_res.json();
      console.log('ANALYZE ANGLES:', analyze_json.angles);

      const overlayUri = analyze_json.overlay_uri;
      const angles = analyze_json.angles;
      const posture = analyze_json.posture;

      // Verificare suplimentară pentru photo_id
      if (!photo_id) {
        Alert.alert('Eroare', 'ID-ul pozei nu a fost generat corect.');
        return;
      }

      // 4️⃣ Navighează la PhotoReview, trimițând toate datele
      navigation.navigate('PhotoReview', {
        uri: file_uri,
        overlay: overlayUri,
        angles,
        posture,
        student_id,
        name,
        photo_id, 
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Nicio poziție detectată', 'Nu s-a putut captura sau analiza poza. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Returnarea UI-ului pentru capturarea imaginii
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={camera_type}
      />

      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Procesare poză…</Text>
        </View>
      )}

      {/* Grid overlay */}
      <View style={styles.gridContainer} pointerEvents="none">
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

      <View style={styles.controls} pointerEvents={loading ? 'none' : 'auto'}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  text: {
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontSize: 18,
    fontWeight: '600',
  },
  btn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '600' },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  gridLineCenterVertical: { width: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  gridLineCenterHorizontal: { height: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  controls: {
    position: 'absolute',
    bottom: 38,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 38,
    zIndex: 20,
  },
  sideBtn: {
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
  sideBtnIcon: {
    fontSize: 22,
    color: '#3b5bfd',
    fontWeight: 'bold',
  },
  snapBtn: {
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
  snapInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#27ae60',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16
  }
});
