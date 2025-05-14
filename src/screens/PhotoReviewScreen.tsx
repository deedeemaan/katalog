// src/screens/PhotoReviewScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

type ReviewRouteProp = RouteProp<RootStackParamList, 'PhotoReview'>;
type ReviewNavProp   = NativeStackNavigationProp<RootStackParamList, 'PhotoReview'>;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function PhotoReviewScreen({
  route,
  navigation
}: {
  route: ReviewRouteProp;
  navigation: ReviewNavProp;
}) {
  const { uri, studentId } = route.params;
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Analizează poza la mount
  useEffect(() => {
    const analyze = async () => {
      setAnalyzing(true);
      try {
        const data = new FormData();
        data.append('photo', {
          uri,
          name: `review_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        const res = await fetch(`${API_URL}/analyze-posture`, {
          method: 'POST',
          body: data,
        });
        if (!res.ok) throw new Error('Eroare analiză');
        const json = await res.json();
        setResult(json);
      } catch (err: any) {
        setResult(null);
        Alert.alert('Eroare', err.message);
      } finally {
        setAnalyzing(false);
      }
    };
    analyze();
  }, [uri]);

  const savePhoto = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      data.append('photo', {
        uri,
        name: `posture_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      data.append('student_id', studentId.toString());

      const res = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to upload');

      Alert.alert('Saved', 'Photo has been saved.');
      navigation.pop(2);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Grid rendering
  const renderGrid = () => (
    <View style={styles.gridContainer} pointerEvents="none">
      {Array.from({ length: 11 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={[
            styles.gridLineVertical,
            { left: `${(i / 10) * 100}%` },
            i === 5 && styles.gridLineCenterVertical,
          ]}
        />
      ))}
      {Array.from({ length: 21 }).map((_, j) => (
        <View
          key={`h${j}`}
          style={[
            styles.gridLineHorizontal,
            { top: `${(j / 20) * 100}%` },
            j === 10 && styles.gridLineCenterHorizontal,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <Image source={{ uri }} style={styles.preview} />
        {renderGrid()}
        {analyzing && (
          <ActivityIndicator style={styles.loaderOverlay} size="large" color="#fff" />
        )}
      </View>

      {result && result.angles && (
        <View style={styles.results}>
          <Text style={styles.resultText}>Umăr: {result.angles.shoulderTilt?.toFixed(2)}°</Text>
          <Text style={styles.resultText}>Șold: {result.angles.hipTilt?.toFixed(2)}°</Text>
          <Text style={styles.resultText}>Coloană: {result.angles.spineTilt?.toFixed(2)}°</Text>
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.retake]}
          onPress={() => navigation.replace('Camera', { studentId })}
        >
          <Text style={styles.btnText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.save]}
          onPress={savePhoto}
          disabled={saving || analyzing || !result?.angles}
        >
          <Text style={styles.btnText}>
            {saving ? 'Saving...' : analyzing ? 'Analizez...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#000' },
  previewContainer: { flex: 1, position: 'relative' },
  preview:          { flex: 1, width: '100%', height: '100%', resizeMode: 'cover', backgroundColor: '#111' },
  gridContainer:    {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  gridLineCenterVertical: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: 2,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  gridLineCenterHorizontal: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    height: 2,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
  results: {
    backgroundColor: '#222c',
    padding: 14,
    borderRadius: 10,
    margin: 16,
    alignItems: 'center',
  },
  resultText: { color: '#fff', fontSize: 16, marginVertical: 2 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#111'
  },
  btn: {
    flex: 1,
    marginHorizontal: 8,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center'
  },
  retake: { backgroundColor: '#555' },
  save:   { backgroundColor: '#28A745' },
  btnText: { color: '#fff', fontWeight: '600' }
});