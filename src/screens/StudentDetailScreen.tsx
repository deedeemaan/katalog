// src/screens/StudentDetailScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Dimensions
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

type DetailRouteProp = RouteProp<RootStackParamList, 'StudentDetail'>;
type DetailNavProp = NativeStackNavigationProp<RootStackParamList, 'StudentDetail'>;

type Measurement = { id: number; created_at: string; height: number; weight: number; };
type Session     = { id: number; session_date: string; notes: string; };
type Photo       = { id: number; uri: string; created_at: string; };

export default function StudentDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavProp>();
  const { id, name } = route.params;

  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedUri, setSelectedUri] = useState<string|null>(null);

  // Normalizează URI-ul
  const getPhotoUri = (uri: string) => {
    if (uri.startsWith('http') || uri.startsWith('file://')) return uri;
    return `${API_URL}${uri}`;
  };

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, sRes, pRes] = await Promise.all([
        fetch(`${API_URL}/students/${id}/measurements`),
        fetch(`${API_URL}/students/${id}/sessions`),
        fetch(`${API_URL}/students/${id}/photos`)
      ]);
      if (!mRes.ok || !sRes.ok || !pRes.ok) throw new Error('Fetch failed');
      setMeasurements(await mRes.json());
      setSessions(await sRes.json());
      setPhotos(await pRes.json());
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Cannot load details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    React.useCallback(() => { fetchDetails(); }, [fetchDetails])
  );

  const deletePhoto = (photoId: number) => {
    Alert.alert(
      'Șterge poza',
      'Ești sigur că vrei să ștergi această fotografie?',
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Șterge', style: 'destructive', onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/photos/${photoId}`, { method: 'DELETE' });
              if (!res.ok) throw new Error('Delete failed');
              // actualizează lista local
              setPhotos(curr => curr.filter(p => p.id !== photoId));
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{name}</Text>

      {/* Measurements */}
      <Text style={styles.subheader}>Measurements</Text>
      <FlatList
        data={measurements}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
            <Text>H: {item.height} cm · W: {item.weight} kg</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddMeasurement', { studentId: id })}
      >
        <Text style={styles.buttonText}>+ Add Measurement</Text>
      </TouchableOpacity>

      {/* Sessions */}
      <Text style={styles.subheader}>Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{new Date(item.session_date).toLocaleDateString()}</Text>
            <Text>{item.notes}</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddSession', { studentId: id })}
      >
        <Text style={styles.buttonText}>+ Add Session</Text>
      </TouchableOpacity>

      {/* Posture History */}
      <Text style={styles.subheader}>Posture History</Text>
      <FlatList
        data={photos}
        horizontal
        keyExtractor={p => p.id.toString()}
        contentContainerStyle={styles.photoList}
        renderItem={({ item }) => (
          <View style={styles.photoWrapper}>
            <TouchableOpacity
              style={styles.photoCard}
              onPress={() => setSelectedUri(getPhotoUri(item.uri))}
            >
              <Image
                source={{ uri: getPhotoUri(item.uri) }}
                style={styles.photoThumb}
              />
              <Text style={styles.photoDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deletePhoto(item.id)}
            >
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Camera & Import */}
      <TouchableOpacity
        style={[styles.button, styles.cameraButton]}
        onPress={() => navigation.navigate('Camera', { studentId: id })}
      >
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.importButton]}
        onPress={() => navigation.navigate('GalleryImport')}
      >
        <Text style={styles.buttonText}>Încarcă poze din galerie</Text>
      </TouchableOpacity>

      {/* Modal Preview */}
      <Modal visible={!!selectedUri} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Image
            source={{ uri: selectedUri! }}
            style={[styles.preview, { width, height }]}
          />
          <View style={[styles.gridContainer, { width, height }]}>
            {Array.from({ length: 11 }).map((_, i) => (
              <View
                key={`v${i}`}
                style={[
                  styles.gridLineVertical,
                  { left: `${(i/10)*100}%`, height },
                  i===5 && styles.gridLineCenterVertical
                ]}
              />
            ))}
            {Array.from({ length: 21 }).map((_, j) => (
              <View
                key={`h${j}`}
                style={[
                  styles.gridLineHorizontal,
                  { top: `${(j/20)*100}%`, width },
                  j===10 && styles.gridLineCenterHorizontal
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelectedUri(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:              { flex:1, padding:16, backgroundColor:'#fff' },
  loaderContainer:        { flex:1, justifyContent:'center', alignItems:'center' },
  header:                 { fontSize:24, fontWeight:'bold', marginBottom:12 },
  subheader:              { fontSize:18, fontWeight:'600', marginTop:16, marginBottom:8 },
  card:                   { backgroundColor:'#f0f0f0', padding:10, borderRadius:6, marginVertical:4 },
  button:                 { backgroundColor:'#007AFF', padding:12, borderRadius:6, alignItems:'center', marginTop:12 },
  cameraButton:           { backgroundColor:'#28A745' },
  importButton:           { backgroundColor:'#6A5ACD' },
  buttonText:             { color:'#fff', fontWeight:'600' },
  photoList:              { paddingVertical:8 },
  photoWrapper:           { marginRight:12 },
  photoCard:              { alignItems:'center' },
  photoThumb:             { width:80, height:100, borderRadius:4 },
  photoDate:              { marginTop:4, fontSize:12, color:'#555' },
  deleteBtn:              { position:'absolute', top:0, right:0, padding:4 },
  deleteText:             { fontSize:16, color:'#f00' },

  modalOverlay:           { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.9)', justifyContent:'center', alignItems:'center' },
  preview:                { position:'absolute', resizeMode:'contain' },
  gridContainer:          { position:'absolute' },
  gridLineVertical:       { position:'absolute', width:1, backgroundColor:'rgba(255,255,255,0.5)' },
  gridLineHorizontal:     { position:'absolute', height:1, backgroundColor:'rgba(255,255,255,0.5)' },
  gridLineCenterVertical: { width:3, backgroundColor:'rgba(255,255,255,0.8)' },
  gridLineCenterHorizontal:{ height:3, backgroundColor:'rgba(255,255,255,0.8)' },
  closeBtn:               { position:'absolute', top:40, right:20, backgroundColor:'#ffffff80', borderRadius:20, padding:8 },
  closeText:              { fontSize:18, fontWeight:'bold', color:'#000' }
});
