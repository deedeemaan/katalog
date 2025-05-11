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

import { API_URL } from '../services/api';

export default function GalleryImportScreen() {
  const [photos, setPhotos]     = useState<string[]>([]);
  const [results, setResults]   = useState<any[]>([]);
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
        const formData = new FormData();
        formData.append('image', {
          uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
  
        const res = await fetch(`${API_URL}/analyze-posture`, {
          method: 'POST',
          // nu seta Content-Type!
          body: formData,
        });
  
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
        const json = await res.json();
        all.push({ uri, ...json });
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
          {results.map((r, i) => (
            <Text key={i}>
              Img {i+1}: 
              Umăr: {r.angles.shoulderTilt}°, 
              Șold: {r.angles.hipTilt}°
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#fff' },
  button: {
    backgroundColor: '#007AFF',
    padding:12,
    borderRadius:6,
    alignItems:'center',
    marginBottom:12
  },
  analyzeButton: { backgroundColor:'#28A745' },
  buttonText: { color:'#fff', fontWeight:'600' },
  count: { marginBottom:12, fontSize:16 },
  grid: { flexDirection:'row', flexWrap:'wrap' },
  thumb: { width:100, height:100, margin:4, borderRadius:4 },
  results: { marginTop:20 },
  subtitle: { fontWeight:'bold', marginBottom:8 }
});
