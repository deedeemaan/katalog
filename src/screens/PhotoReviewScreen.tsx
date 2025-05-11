// src/screens/PhotoReviewScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

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
      const data = new FormData();
      data.append('photo', {
        uri,
        name: `posture_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      data.append('student_id', studentId.toString());

      const res = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        // Nu specificăm manual Content-Type, FormData se ocupă de boundary
        body: data,
      });
      if (!res.ok) throw new Error('Failed to upload');

      Alert.alert('Saved', 'Photo has been saved.');
      // Pop 2 nivele: PhotoReview -> Camera -> StudentDetail
      navigation.pop(2);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.preview} />

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
  container:        { flex: 1, backgroundColor: '#000' },
  preview:          { flex: 1, resizeMode: 'contain' },
  buttons:          {
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      padding: 16,
                      backgroundColor: '#111'
                    },
  btn:              {
                      flex: 1,
                      marginHorizontal: 8,
                      padding: 14,
                      borderRadius: 6,
                      alignItems: 'center'
                    },
  retake:           { backgroundColor: '#555' },
  save:             { backgroundColor: '#28A745' },
  btnText:          { color: '#fff', fontWeight: '600' }
});