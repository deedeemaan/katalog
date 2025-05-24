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
type DetailNavProp  = NativeStackNavigationProp<RootStackParamList, 'StudentDetail'>;

type Measurement = {
  id: number;
  studentId: number;
  height: number;
  weight: number;
  headCircumference: number;
  chestCircumference: number;
  abdominalCircumference: number;
  physicalDisability: string;
  createdAt: string;
};
type Session = {
  id: number;
  studentId: number;
  sessionDate: string;
  notes: string;
  sessionType?: string;
};
type Photo = {
  id: number;
  studentId: number;
  uri: string;
  createdAt: string;
  angles?: {
    shoulderTilt: number;
    hipTilt: number;
    spineTilt: number;
  }
};

export default function StudentDetailScreen() {
  const route      = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavProp>();
  const { id, name } = route.params;

  // Schimbă titlul header-ului
  useLayoutEffect(() => {
    navigation.setOptions({ title: `Detalii elev` });
  }, [navigation, name]);

  const [initialLoading, setInitialLoading]     = useState(true);
  const [refreshing, setRefreshing]             = useState(false);
  const [measurements, setMeasurements]         = useState<Measurement[]>([]);
  const [sessions, setSessions]                 = useState<Session[]>([]);
  const [photos, setPhotos]                     = useState<Photo[]>([]);
  const [selectedUri, setSelectedUri]           = useState<string|null>(null);
  const [selectedPhotoId, setSelectedPhotoId]   = useState<number|null>(null);

  // Ensure we return a fully qualified URI
  const getPhotoUri = (uri: string) =>
    uri.startsWith('http') || uri.startsWith('file://')
      ? uri
      : `${API_URL}/uploads/${uri}`;

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
        setPhotos(await pRes.json());
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

  const uploadPhoto = async (photo: any, studentId: number) => {
    const data = new FormData();
    data.append('photo', {
      uri: photo.uri,
      name: `posture_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
    data.append('studentId', String(studentId));

    try {
      // 1. Upload photo
      const uploadRes = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        body: data,
      });
      const uploadData = await uploadRes.json();
      const photoId = uploadData.id; // asigură-te că backendul returnează id-ul pozei

      // 2. Trimite la analiză (dacă ai endpointul /photos/:id/analyze)
      if (photoId) {
        const analyzeData = new FormData();
        analyzeData.append('image', {
          uri: photo.uri,
          name: `posture_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);

        await fetch(`${API_URL}/photos/${photoId}/analyze`, {
          method: 'POST',
          body: analyzeData,
          headers: {
            // Nu seta 'Content-Type' manual, lasă browserul să pună boundary-ul corect!
          },
        });
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
            <Text>Data măsurătorilor: {new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text>Înălțime: {item.height} cm</Text>
            <Text>Greutate: {item.weight} kg</Text>
            <Text>Circumferință cap: {item.headCircumference} cm</Text>
            <Text>Circumferință piept: {item.chestCircumference} cm</Text>
            <Text>Circumferință abdomen: {item.abdominalCircumference} cm</Text>
            <Text>Afecțiune fizică: {item.physicalDisability || '—'}</Text>
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
        onPress={() => navigation.navigate('AddMeasurement', { studentId: id })}
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
            <Text>Data sesiunii: {new Date(item.sessionDate).toLocaleDateString()}</Text>
            <Text style={{ fontWeight: '600', color: '#28A745', marginBottom: 2 }}>
              Tip sesiune: {item.sessionType && item.sessionType.trim() !== ''
                ? item.sessionType.charAt(0).toUpperCase() + item.sessionType.slice(1)
                : '—'}
            </Text>
            <Text>Note: {item.notes}</Text>
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
        onPress={() => navigation.navigate('AddSession', { studentId: id })}
      >
        <Text style={styles.buttonText}>+ Adaugă Sesiune</Text>
      </TouchableOpacity>

      {/* Photo History */}
      <Text style={styles.subheader}>Istoric Poze</Text>
      <FlatList
        data={photos}
        horizontal
        keyExtractor={p => p.id.toString()}
        contentContainerStyle={styles.photoList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.photoCard}
            onPress={() => {
              setSelectedUri(getPhotoUri(item.uri));
              setSelectedPhotoId(item.id);
            }}
          >
            <Image source={{ uri: getPhotoUri(item.uri) }} style={styles.photoThumb} />
            {item.angles && (
              <View style={styles.anglesBox}>
                <Text style={styles.angleText}>Umăr: {item.angles.shoulderTilt?.toFixed(2)}°</Text>
                <Text style={styles.angleText}>Șold: {item.angles.hipTilt?.toFixed(2)}°</Text>
                <Text style={styles.angleText}>Coloană: {item.angles.spineTilt?.toFixed(2)}°</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Footer Buttons */}
      <View style={styles.footerBtns}>
        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={() => navigation.navigate('Camera', { studentId: id, name })}
        >
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.importButton]}
          onPress={() => navigation.navigate('GalleryImport', { studentId: id })}
        >
          <Text style={styles.buttonText}>Încarcă Poze</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Preview + Delete */}
      <Modal visible={!!selectedUri} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Image
            source={{ uri: selectedUri! }}
            style={[styles.preview, { width, height }]}
          />

          {/* Grid */}
          <View style={[styles.gridContainer, { width, height }]}>
            {Array.from({ length: 11 }).map((_, i) => (
              <View
                key={`v${i}`}
                style={[
                  styles.gridLineVertical,
                  { left: `${(i / 10) * 100}%`, height },
                  i === 5 && styles.gridLineCenterVertical
                ]}
              />
            ))}
            {Array.from({ length: 21 }).map((_, j) => (
              <View
                key={`h${j}`}
                style={[
                  styles.gridLineHorizontal,
                  { top: `${(j / 20) * 100}%`, width },
                  j === 10 && styles.gridLineCenterHorizontal
                ]}
              />
            ))}
          </View>

          <View style={styles.modalBtns}>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => setSelectedUri(null)}
            >
              <Text style={styles.smallBtnText}>✖️</Text>
            </TouchableOpacity>
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
  container:                 { flex:1, backgroundColor:'#fff' },
  loaderContainer:           { flex:1, justifyContent:'center', alignItems:'center' },
  header:                    { fontSize:26, fontWeight:'bold', margin:20, color:'#3b5bfd', letterSpacing:1 },
  subheader:                 { fontSize:18, fontWeight:'700', marginHorizontal:20, marginTop:20, marginBottom:8, color:'#222', letterSpacing:0.5 },
  card:                      { backgroundColor:'#fff', padding:18, borderRadius:16, marginHorizontal:16, marginVertical:8, shadowColor:'#000', shadowOpacity:0.07, shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:2 },
  rowBtns:                   { flexDirection:'row', marginTop:12, gap:8 },
  smallBtn:                  { width:38, height:38, borderRadius:19, backgroundColor:'#e3e8ff', alignItems:'center', justifyContent:'center', marginHorizontal:2, borderWidth:1, borderColor:'#3b5bfd', shadowColor:'#3b5bfd', shadowOpacity:0.10, shadowRadius:4, elevation:1 },
  deleteBtn:                 { backgroundColor:'#ffeaea', borderColor:'#ff6b6b', shadowColor:'#ff6b6b' },
  smallBtnText:              { color:'#3b5bfd', fontWeight:'bold', fontSize:16 },
  button:                    { backgroundColor:'#3b5bfd', padding:16, borderRadius:14, alignItems:'center', margin:20, shadowColor:'#3b5bfd', shadowOpacity:0.18, shadowRadius:8, elevation:4 },
  cameraButton:              { backgroundColor:'#28A745' },
  importButton:              { backgroundColor:'#6A5ACD' },
  buttonText:                { color:'#fff', fontWeight:'bold', fontSize:16 },
  footerBtns:                { flexDirection:'row', justifyContent:'space-around', marginBottom:32, marginTop:8, gap:12 },
  photoList:                 { paddingHorizontal:20, paddingVertical:8 },
  photoCard:                 { marginRight:16, alignItems:'center', backgroundColor:'#fff', borderRadius:12, padding:6, shadowColor:'#000', shadowOpacity:0.10, shadowRadius:6, elevation:2, borderWidth:1, borderColor:'#e0e0e0' },
  photoThumb:                { width:90, height:110, borderRadius:8, borderWidth:2, borderColor:'#3b5bfd', backgroundColor:'#f3f4f6' },
  photoDate:                 { marginTop:6, fontSize:13, color:'#555', fontWeight:'500' },
  modalOverlay:              { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.93)', justifyContent:'center', alignItems:'center' },
  preview:                   { position:'absolute', resizeMode:'contain' },
  gridContainer:             { position:'absolute' },
  gridLineVertical:          { position:'absolute', top:0, bottom:0, width:1, backgroundColor:'rgba(255,255,255,0.5)' },
  gridLineHorizontal:        { position:'absolute', left:0, right:0, height:1, backgroundColor:'rgba(255,255,255,0.5)' },
  gridLineCenterVertical:    { width:3, backgroundColor:'rgba(255,255,255,0.8)' },
  gridLineCenterHorizontal:  { height:3, backgroundColor:'rgba(255,255,255,0.8)' },
  modalBtns:                 { position:'absolute', bottom:40, flexDirection:'row', gap:12 },
  iconCircle:                { width:38, height:38, borderRadius:19, backgroundColor:'#f3f4f6', alignItems:'center', justifyContent:'center', marginHorizontal:2, borderWidth:1, borderColor:'#e0e0e0', shadowColor:'#000', shadowOpacity:0.06, shadowRadius:4, elevation:1 },
  iconDelete:                { backgroundColor:'#ffeaea', borderColor:'#ff6b6b' },
  iconCircleText:            { fontSize:18 },
  anglesBox:                 { backgroundColor:'#222c', padding:6, borderRadius:8, marginTop:4, alignItems:'center' },
  angleText:                 { color:'#fff', fontSize:12, marginVertical:1 }
});
