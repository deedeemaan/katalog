// src/screens/GalleryImportScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRoute } from '@react-navigation/native';

import { API_URL } from '../services/api';

export default function GalleryImportScreen() {
  const route = useRoute<any>();
  const { studentId } = route.params;

  const [photos, setPhotos] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisiune refuzată', 'Trebuie să acorzi acces la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 50,
    });

    if (!result.canceled) {
      // expo SDK >= 48 uses result.assets
      const uris = result.assets.map(a => a.uri);
      setPhotos(uris);
    }
  };

  const analyzePhotos = async () => {
    if (photos.length === 0) {
      Alert.alert('Oops', 'Nici o poză selectată.');
      return;
    }
    setAnalyzing(true);
    try {
      const all: Array<any> = [];
      for (const uri of photos) {
        let fileUri = uri;
        if (!fileUri.startsWith('file://')) {
          const newPath = FileSystem.cacheDirectory + `import_${Date.now()}.jpg`;
          await FileSystem.copyAsync({ from: uri, to: newPath });
          fileUri = newPath;
        }

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          Alert.alert('Eroare', `Fișierul nu există: ${fileUri}`);
          continue;
        }

        console.log('fileUri:', fileUri);

        const uploadData = new FormData();
        uploadData.append('photo', {
          uri: fileUri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
        uploadData.append('studentId', String(studentId)); 

        const uploadRes = await fetch(`${API_URL}/photos/upload`, {
          method: 'POST',
          body: uploadData,
        });
        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error('Upload error: ' + errText);
        }
        const uploadJson = await uploadRes.json();
        const photoId = uploadJson.id;

        // 2. Analyze photo
        const analyzeData = new FormData();
        analyzeData.append('image', {
          uri: fileUri, // <-- folosește fileUri, nu uri!
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
        analyzeData.append('photoId', String(photoId));

        const analyzeRes = await fetch(`${API_URL}/posture/${photoId}/analyze`, {
          method: 'POST',
          body: analyzeData,
          // NU seta manual Content-Type!
        }); // presupunând că backend ia imaginea din DB direct pe baza ID-ului

        if (!analyzeRes.ok) {
          const errText = await analyzeRes.text();
          throw new Error('Analyze error: ' + errText);
        }
        const analyzeJson = await analyzeRes.json();

        all.push({
          uri,
          angles: analyzeJson.angles,
          overlay: analyzeJson.overlay,    // Base64-ul pe care-l primești
          posture: analyzeJson.posture,    // dacă ai și entitatea salvată
        });
      }
      setResults(all);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare la analiză', err.message);
    } finally {
      setAnalyzing(false);
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>Importă poze din galerie</Text>
      </TouchableOpacity>
      <Text style={styles.count}>Selectate: {photos.length} poze</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {photos.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.thumb} />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, styles.analyzeButton]}
        onPress={analyzePhotos}
        disabled={analyzing}
      >
        <Text style={styles.buttonText}>
          {analyzing ? 'Analizez…' : 'Analizează pozele'}
        </Text>
      </TouchableOpacity>


      {results.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.subtitle}>Rezultate:</Text>
          {results.map((r, i) => {
            if (r.angles && r.overlay) {
              return (
                <View key={i} style={{ marginBottom: 16, alignItems: 'center' }}>
                  <Text>Poza {i + 1}:</Text>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${r.overlay}` }}
                    style={{ width: 200, height: 200, marginVertical: 8 }}
                  />
                  <Text>
                    Deficiență umăr: {r.angles.shoulderTilt.toFixed(2)}°,
                  </Text>
                  <Text>
                    Deficiență șold: {r.angles.hipTilt.toFixed(2)}°,
                  </Text>
                  <Text>
                    Deficiență coloană: {r.angles.spineTilt.toFixed(2)}°,
                  </Text>
                </View>
              );
            } else {
              return (
                <Text key={i} style={{ color: 'red' }}>
                  Poza {i + 1}: Analiza a eșuat sau nu există unghiuri.
                </Text>
              );
            }
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12
  },
  analyzeButton: { backgroundColor: '#28A745' },
  buttonText: { color: '#fff', fontWeight: '600' },
  count: { marginBottom: 12, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  thumb: { width: 100, height: 100, margin: 4, borderRadius: 4 },
  results: { marginTop: 20 },
  subtitle: { fontWeight: 'bold', marginBottom: 8 }
});
