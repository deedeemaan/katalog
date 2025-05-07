// src/screens/PhotoReviewScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp }                        from '@react-navigation/native';
import { RootStackParamList }                    from '../navigation/types';
import { API_URL }                               from '../services/api';

type ReviewRouteProp = RouteProp<RootStackParamList, 'PhotoReview'>;
type ReviewNavProp   = NativeStackNavigationProp<RootStackParamList, 'PhotoReview'>;

export default function PhotoReviewScreen({
  route,
  navigation
}: {
  route: ReviewRouteProp;
  navigation: ReviewNavProp;
}) {
  const { uri, studentId } = route.params;
  const [saving, setSaving] = useState(false);

  const savePhoto = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, uri })
      });
      if (!res.ok) throw new Error('Save failed');
      Alert.alert('Saved', 'Photo has been saved.');
      navigation.popToTop();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <Image source={{ uri }} style={styles.preview} />
        <View style={styles.gridContainer}>
          {Array.from({ length: 11 }).map((_, i) => (
            <View
              key={`v${i}`}
              style={[
                styles.gridLineVertical,
                { left: `${(i / 10) * 100}%` }
              ]}
            />
          ))}
          {Array.from({ length: 21 }).map((_, j) => (
            <View
              key={`h${j}`}
              style={[
                styles.gridLineHorizontal,
                { top: `${(j / 20) * 100}%` }
              ]}
            />
          ))}
        </View>
      </View>

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
          disabled={saving}
        >
          <Text style={styles.btnText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#000' },
  previewContainer:{ flex: 1 },
  preview:         { flex: 1, resizeMode: 'cover' },
  gridContainer:   {
    ...StyleSheet.absoluteFillObject
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
  buttons:         {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#111'
  },
  btn:             {
    flex: 1,
    marginHorizontal: 8,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center'
  },
  retake:          { backgroundColor: '#555' },
  save:            { backgroundColor: '#28A745' },
  btnText:         { color: '#fff', fontWeight: '600' }
});
