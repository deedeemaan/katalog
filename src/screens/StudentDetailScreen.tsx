// src/screens/StudentDetailScreen.tsx
import React, {
    useCallback,
    useState,
    useRef,
    useEffect
  } from 'react';
  import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert
  } from 'react-native';
  import {
    useRoute,
    useNavigation,
    useFocusEffect
  } from '@react-navigation/native';
  import { NativeStackNavigationProp } from '@react-navigation/native-stack';
  import { RouteProp } from '@react-navigation/native';
  import { Camera, CameraType } from 'expo-camera';
  import { RootStackParamList } from '../navigation/types';
  import { API_URL } from '../services/api';
  
  type DetailRouteProp = RouteProp<RootStackParamList, 'StudentDetail'>;
  type DetailNavProp   = NativeStackNavigationProp<RootStackParamList, 'StudentDetail'>;
  
  export default function StudentDetailScreen() {
    const route      = useRoute<DetailRouteProp>();
    const navigation = useNavigation<DetailNavProp>();
    const { id, name } = route.params;
  
    const [loading, setLoading]           = useState(true);
    const [measurements, setMeasurements] = useState<any[]>([]);
    const [sessions, setSessions]         = useState<any[]>([]);
  
    // Pentru cameră
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const cameraRef = useRef<InstanceType<typeof Camera> | null>(null);
    const [showCamera, setShowCamera] = useState(false);
  
    // Cerere permisiune camera
    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);
  
    // Funcție de captura
    const takePhoto = useCallback(async () => {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Photo URI:', photo.uri);
        // Aici poți adăuga logica de upload sau salvare locală
        setShowCamera(false);
      }
    }, []);
  
    const fetchDetails = useCallback(async () => {
      setLoading(true);
      try {
        const [mRes, sRes] = await Promise.all([
          fetch(`${API_URL}/students/${id}/measurements`),
          fetch(`${API_URL}/students/${id}/sessions`)
        ]);
        if (!mRes.ok || !sRes.ok) throw new Error('Fetch failed');
        setMeasurements(await mRes.json());
        setSessions(await sRes.json());
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Cannot load details');
      } finally {
        setLoading(false);
      }
    }, [id]);
  
    useFocusEffect(
      React.useCallback(() => {
        fetchDetails();
      }, [fetchDetails])
    );
  
    // Dacă permisiunea e refuzată
    if (hasPermission === false) {
      return <Text style={styles.container}>No access to camera</Text>;
    }
  
    // Loader
    if (loading && !showCamera) {
      return <ActivityIndicator style={styles.loader} size="large" />;
    }
  
    // Ecranul camerei full-screen
    if (showCamera) {
      return (
        <Camera
          style={{ flex: 1 }}
          type={CameraType.back}
          ref={cameraRef}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              onPress={takePhoto}
              style={[styles.button, styles.cameraButton]}
            >
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      );
    }
  
    // Ecranul principal cu datele studentului
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{name}</Text>
  
        {/* Measurements */}
        <Text style={styles.subheader}>Measurements</Text>
        <FlatList
          data={measurements}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
              <Text>H: {item.height} cm · W: {item.weight} kg</Text>
              <Text>Head: {item.head_circumference} cm</Text>
              <Text>Chest: {item.chest_circumference} cm</Text>
              <Text>Abd: {item.abdominal_circumference} cm</Text>
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
          keyExtractor={item => item.id.toString()}
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
          <Text style={styles.buttonText}>+ Adaugă Sesiune</Text>
        </TouchableOpacity>
  
        {/* Butonul care deschide camera */}
        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container:        { flex: 1, padding: 16, backgroundColor: '#fff' },
    header:           { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    subheader:        { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    card:             { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 6, marginVertical: 4 },
    button:           {
      backgroundColor: '#007AFF',
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
      marginTop: 12
    },
    cameraButton:     {
      backgroundColor: '#28A745'
    },
    buttonText:       { color: '#fff', fontWeight: '600' },
    loader:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cameraOverlay:    {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
      padding: 20
    }
  });
  