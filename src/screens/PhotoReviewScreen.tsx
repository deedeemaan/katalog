// src/screens/PhotoReviewScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

// Tipurile pentru navigație și parametrii rutei
type ReviewRouteProp = RouteProp<RootStackParamList, 'PhotoReview'>;
type ReviewNavProp = NativeStackNavigationProp<RootStackParamList, 'PhotoReview'>;

// Componenta principală pentru revizuirea și salvarea analizei imaginilor
export default function PhotoReviewScreen({
  route,
  navigation
}: {
  route: ReviewRouteProp;
  navigation: ReviewNavProp;
}) {
  const { uri, overlay, angles, posture, student_id, name, photo_id } = route.params; // Parametrii imaginii și analizei
  const [saving, setSaving] = useState(false); // Indicator pentru procesul de salvare

  // 1. Dacă unghiurile nu sunt disponibile, afișăm un loader
  if (!angles) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // 2. Extragem valorile unghiurilor
  const { shoulderTilt, hipTilt, spineTilt } = angles as {
    shoulderTilt?: number;
    hipTilt?: number;
    spineTilt?: number;
  };

  // Verificăm dacă datele unghiurilor sunt incomplete
  if (
    shoulderTilt === undefined ||
    hipTilt === undefined ||
    spineTilt === undefined
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Datele pentru unghiuri nu sunt complete.</Text>
      </View>
    );
  }

  // Funcția pentru salvarea analizei imaginii
  const savePhoto = async () => {
    Alert.alert('Succes', 'Poza a fost salvată cu succes.');
    navigation.navigate('StudentDetail', { id: student_id, name });
  };

  // Funcția pentru afișarea unghiurilor
  const renderAngle = (label: string, value?: number) => (
    <Text style={styles.resultText}>
      {label}: {value !== undefined ? `${value.toFixed(2)}°` : 'N/A'}
    </Text>
  );

  // Funcția pentru afișarea butoanelor
  const renderButton = (label: string, onPress: () => void, style: object, disabled = false) => (
    <TouchableOpacity style={[styles.btn, style]} onPress={onPress} disabled={disabled}>
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );

  // Returnarea UI-ului pentru revizuirea imaginii
  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        {/* Poza originală */}
        <Image source={{ uri }} style={styles.preview} />
        {/* Overlay-ul peste poza */}
        <Image
          source={{ uri: overlay }}
          style={[styles.preview, { position: 'absolute', top: 0, left: 0 }]}
        />
        {saving && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Salvare în curs…</Text>
          </View>
        )}
      </View>

      {/* Afișarea unghiurilor */}
      <View style={styles.results}>
        {renderAngle('Deficiență unghi umeri', shoulderTilt)}
        {renderAngle('Deficiență unghi șolduri', hipTilt)}
        {renderAngle('Deficiență unghi coloană', spineTilt)}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Această analiză are rol orientativ și nu constituie un diagnostic medical.
          Deciziile terapeutice rămân responsabilitatea specialistului uman.
        </Text>
      </View>

      {/* Butoane pentru acțiuni */}
      <View style={styles.buttons}>
        {renderButton('Retake', () => navigation.replace('Camera', { student_id, name }), styles.retake)}
        {renderButton(saving ? 'Saving...' : 'Save', savePhoto, styles.save, saving)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  previewContainer: { 
    flex: 1, 
    position: 'relative' 
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain', 
    backgroundColor: '#f0f0f0', 
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)', 
    zIndex: 20,
  },
  loadingText: {
    color: '#333', 
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  results: {
    backgroundColor: '#fff', 
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  resultText: { 
    color: '#333', 
    fontSize: 18, 
    fontWeight: '600', 
    marginVertical: 4 
  },
  disclaimer: {
    backgroundColor: '#fffbea', 
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  disclaimerText: { 
    color: '#856404', 
    fontSize: 14, 
    textAlign: 'center' 
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  btn: {
    flex: 1,
    marginHorizontal: 8,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3e8ff', 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: { 
    color: '#3b5bfd', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  retake: { 
    backgroundColor: '#ffeaea' 
  },
  save: { 
    backgroundColor: '#e3e8ff' 
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9', 
  },
  errorText: { 
    color: '#d9534f', 
    fontSize: 16 
  },
});
