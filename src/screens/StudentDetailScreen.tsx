import React, { useCallback, useState, useLayoutEffect } from 'react';
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
  Dimensions,
  ScrollView,
  RefreshControl
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

type Measurement = {
  id: number;
  student_id: number;
  height: number;
  weight: number;
  head_circumference: number;
  chest_circumference: number;
  abdominal_circumference: number;
  physical_disability: string;
  created_at: string;
};

type Session = {
  id: number;
  student_id: number;
  session_date: string;
  notes: string;
  session_type?: string;
};

type PostureEntry = {
  id: number;
  photo_id: number;
  shoulder_tilt: string;
  hip_tilt: string;
  spine_tilt: string;
  created_at: string;
  overlay_uri?: string;
};


type Photo = {
  id: number;
  student_id: number;
  uri: string;
  created_at: string;
  history?: PostureEntry[];
};



export default function StudentDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavProp>();
  const { id, name } = route.params;

  // Schimbă titlul header-ului
  useLayoutEffect(() => {
    navigation.setOptions({ title: `Detalii elev` });
  }, [navigation, name]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);

  // Ensure we return a fully qualified URI
  const getPhotoUri = (uri: string) =>
    uri.startsWith('http') || uri.startsWith('file://')
      ? uri
      : `${API_URL}/uploads/${uri}`;

  const getFullUri = (relativePath: string) => `${API_URL}${relativePath}`;

  // Fetch all data; silent=true skips the full-screen spinner
  const fetchDetails = useCallback(
    async (opts: { silent: boolean }) => {
      if (!opts.silent) setInitialLoading(true);
      try {
        const [mRes, sRes, pRes] = await Promise.all([
          fetch(`${API_URL}/students/${id}/measurements`),
          fetch(`${API_URL}/students/${id}/sessions`),
          fetch(`${API_URL}/students/${id}/photos`)
        ]);
        if (!mRes.ok || !sRes.ok || !pRes.ok) throw new Error('Fetch failed');

        setMeasurements(await mRes.json());
        setSessions(await sRes.json());

        const photosList: Photo[] = await pRes.json();
        // pentru fiecare poză, aducem history
        const photosWithHistory = await Promise.all(
          photosList.map(async p => {
            const hRes = await fetch(`${API_URL}/posture/${p.id}/history`);
            const { history } = await hRes.json(); // istoricul include overlay_uri
            return { ...p, history };
          })
        );
        setPhotos(photosWithHistory);

      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        if (!opts.silent) setInitialLoading(false);
        if (opts.silent) setRefreshing(false);
      }
    },
    [id]
  );


  // On screen focus: first time full spinner, then silent refresh
  useFocusEffect(
    React.useCallback(() => {
      fetchDetails({ silent: !initialLoading });
    }, [fetchDetails, initialLoading])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDetails({ silent: true });
  }, [fetchDetails]);

  // Confirmation & deletion helpers
  const confirmDeleteMeasurement = (mid: number) => {
    Alert.alert('Confirm Delete', 'Șterge această măsurătoare?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${API_URL}/measurements/${mid}`, { method: 'DELETE' });
          fetchDetails({ silent: true });
        }
      }
    ]);
  };
  const confirmDeleteSession = (sid: number) => {
    Alert.alert('Confirm Delete', 'Șterge această sesiune?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${API_URL}/sessions/${sid}`, { method: 'DELETE' });
          fetchDetails({ silent: true });
        }
      }
    ]);
  };
  const confirmDeletePhoto = () => {
    if (!selectedPhotoId) return;
    Alert.alert('Confirm Delete', 'Șterge această poză?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${API_URL}/photos/${selectedPhotoId}`, { method: 'DELETE' });
          setSelectedUri(null);
          setSelectedPhotoId(null);
          fetchDetails({ silent: true });
        }
      }
    ]);
  };

  const uploadPhoto = async (photo: any, student_id: number) => {
    const data = new FormData();
    data.append('photo', {
      uri: photo.uri,
      name: `posture_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
    data.append('student_id', String(student_id));

    try {
      // 1. Upload photo
      const uploadRes = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        body: data,
      });
      const uploadData = await uploadRes.json();
      const photo_id = uploadData.id;

      // 2. Analyze photo
      if (photo_id) {
        const analyzeData = new FormData();
        analyzeData.append('image', {
          uri: photo.uri,
          name: `posture_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);

        const analyzeRes = await fetch(`${API_URL}/posture/${photo_id}/analyze`, {
          method: 'POST',
          body: analyzeData,
        });
        const analyzeDataJson = await analyzeRes.json();
        console.log('Analyze result:', analyzeDataJson);
      }

      fetchDetails({ silent: true });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { width, height } = Dimensions.get('window');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>{name}</Text>

      {/* Measurements */}
      <Text style={styles.subheader}>Măsurători</Text>
      <FlatList
        data={measurements}
        keyExtractor={m => m.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Data măsurătorilor: {new Date(item.created_at).toLocaleDateString()}</Text>
            <Text>Înălțime: {item.height} cm</Text>
            <Text>Greutate: {item.weight} kg</Text>
            <Text>Circumferință cap: {item.head_circumference} cm</Text>
            <Text>Circumferință piept: {item.chest_circumference} cm</Text>
            <Text>Circumferință abdomen: {item.abdominal_circumference} cm</Text>
            <Text>Afecțiune fizică: {item.physical_disability || '—'}</Text>
            <View style={styles.rowBtns}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() =>
                  navigation.navigate('EditMeasurement', { measurement: item })
                }
              >
                <Text style={styles.iconCircleText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconCircle, styles.iconDelete]}
                onPress={() => confirmDeleteMeasurement(item.id)}
              >
                <Text style={styles.iconCircleText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddMeasurement', { student_id: id })}
      >
        <Text style={styles.buttonText}>+ Adaugă Măsurătoare</Text>
      </TouchableOpacity>

      {/* Sessions */}
      <Text style={styles.subheader}>Sesiuni</Text>
      <FlatList
        data={sessions}
        keyExtractor={s => s.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Data sesiunii: {new Date(item.session_date).toLocaleDateString()}</Text>
            <Text style={{ fontWeight: '600', color: '#28A745', marginBottom: 2 }}>
              Tip sesiune: {item.session_type && item.session_type.trim() !== ''
                ? item.session_type.charAt(0).toUpperCase() + item.session_type.slice(1)
                : '—'}
            </Text>
            <Text>Notițe: {item.notes}</Text>
            <View style={styles.rowBtns}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => navigation.navigate('EditSession', { session: item })}
              >
                <Text style={styles.smallBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallBtn, styles.deleteBtn]}
                onPress={() => confirmDeleteSession(item.id)}
              >
                <Text style={[styles.smallBtnText, { color: '#ff6b6b' }]}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddSession', { student_id: id })}
      >
        <Text style={styles.buttonText}>+ Adaugă Sesiune</Text>
      </TouchableOpacity>

      {/* Photo History */}
      <Text style={styles.subheader}>Istoric Poze</Text>
      <FlatList
        data={photos}
        horizontal
        keyExtractor={p => p.id.toString()}
        renderItem={({ item }) => {
          const last = item.history?.[0]; // cea mai recentă analiză
          const uri = last?.overlay_uri ? getFullUri(last.overlay_uri) : undefined;

          return (
            <TouchableOpacity
              onPress={() => {
                if (uri) {
                  setSelectedUri(uri); // setează URI-ul imaginii selectate
                  setSelectedPhotoId(item.id); // setează ID-ul imaginii selectate
                }
              }}
            >
              <View style={styles.photoCard}>
                <Image
                  source={{ uri }}
                  style={styles.photoThumb}
                  onError={(error) => console.error('Failed to load image:', uri, error.nativeEvent)}
                />
                {last && (
                  <View style={styles.anglesBox}>
                    <Text
                      style={[
                        styles.angleText,
                        Number(last.shoulder_tilt) > 15 && { color: 'red' }, // Umăr
                      ]}
                    >
                      Deficiență umăr: {Number(last.shoulder_tilt).toFixed(1)}°
                    </Text>
                    <Text
                      style={[
                        styles.angleText,
                        Number(last.hip_tilt) > 15 && { color: 'red' }, // Șold
                      ]}
                    >
                      Deficiență șold: {Number(last.hip_tilt).toFixed(1)}°
                    </Text>
                    <Text
                      style={[
                        styles.angleText,
                        Number(last.spine_tilt) > 15 && { color: 'red' }, // Coloană
                      ]}
                    >
                      Deficiență coloană: {Number(last.spine_tilt).toFixed(1)}°
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(last.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />


      {/* Footer Buttons */}
      <View style={styles.footerBtns}>
        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={() => navigation.navigate('Camera', { student_id: id, name })}
        >
          <Text style={styles.buttonText}>Deschide Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.importButton]}
          onPress={() => navigation.navigate('GalleryImport', { student_id: id })}
        >
          <Text style={styles.buttonText}>Încarcă Poze</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pentru afișarea imaginii selectate */}
      <Modal visible={!!selectedUri} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Image
            source={{ uri: selectedUri! }}
            style={[styles.preview, { width, height }]}
          />
          <View style={styles.modalBtns}>
            {/* Buton pentru închidere */}
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => setSelectedUri(null)}
            >
              <Text style={styles.smallBtnText}>✖️</Text>
            </TouchableOpacity>

            {/* Buton pentru ștergere */}
            <TouchableOpacity
              style={[styles.smallBtn, styles.deleteBtn]}
              onPress={confirmDeletePhoto}
            >
              <Text style={[styles.smallBtnText, { color: '#ff6b6b' }]}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', margin: 20, color: '#3b5bfd', letterSpacing: 1 },
  subheader: { fontSize: 18, fontWeight: '700', marginHorizontal: 20, marginTop: 20, marginBottom: 8, color: '#222', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 16, marginHorizontal: 16, marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  info: { fontSize: 14, color: '#666' },
  infoValue: { fontWeight: '500' },
  rowBtns: { flexDirection: 'row', marginTop: 12, gap: 8 },
  smallBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e3e8ff', alignItems: 'center', justifyContent: 'center', marginHorizontal: 2, borderWidth: 1, borderColor: '#3b5bfd', shadowColor: '#3b5bfd', shadowOpacity: 0.10, shadowRadius: 4, elevation: 1 },
  deleteBtn: { backgroundColor: '#ffeaea', borderColor: '#ff6b6b', shadowColor: '#ff6b6b' },
  smallBtnText: { color: '#3b5bfd', fontWeight: 'bold', fontSize: 16 },
  button: { backgroundColor: '#3b5bfd', padding: 16, borderRadius: 14, alignItems: 'center', margin: 20, shadowColor: '#3b5bfd', shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 },
  cameraButton: { backgroundColor: '#28A745' },
  importButton: { backgroundColor: '#6A5ACD' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerBtns: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32, marginTop: 8, gap: 12 },
  photoList: { paddingHorizontal: 20, paddingVertical: 8 },
  photoCard: { marginRight: 16, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 6, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#e0e0e0' },
  photoThumb: {
    width: 90,
    height: 110,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3b5bfd',
    backgroundColor: '#ffffff', 
  },
  photoDate: { marginTop: 6, fontSize: 13, color: '#555', fontWeight: '500' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.93)', justifyContent: 'center', alignItems: 'center' },
  preview: { position: 'absolute', resizeMode: 'contain' },
  modalBtns: { position: 'absolute', bottom: 40, flexDirection: 'row', gap: 12 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginHorizontal: 2, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  iconDelete: { backgroundColor: '#ffeaea', borderColor: '#ff6b6b' },
  iconCircleText: { fontSize: 18 },
  anglesBox: { backgroundColor: '#222c', padding: 6, borderRadius: 8, marginTop: 4, alignItems: 'center' },
  angleText: { color: '#fff', fontSize: 12, marginVertical: 1 },
  list: { padding: 16 },
  dateText: { color: '#ddd', fontSize: 10, marginTop: 4 }

});
