// src/screens/StudentListScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import {
  useNavigation,
  useFocusEffect
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getStudents, API_URL } from '../services/api';
import { RootStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'StudentList'>;

type Student = {
  id: number;
  name: string;
  age: number;
  condition: string;
  notes: string;
};

export default function StudentListScreen() {
  const navigation = useNavigation<NavProp>();
  const [students, setStudents]     = useState<Student[]>([]);
  const [initialLoading, setInitial]= useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Încărcare inițială
  const loadStudents = useCallback(async () => {
    setInitial(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      Alert.alert('Eroare', err.message);
    } finally {
      setInitial(false);
    }
  }, []);

  // Silent refresh la fiecare focus (fără UI shift)
  const silentRefresh = useCallback(async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch {
      // ignorăm eroarea
    }
  }, []);

  // Pull-to-refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      Alert.alert('Eroare', err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useFocusEffect(
    useCallback(() => {
      silentRefresh();
    }, [silentRefresh])
  );

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
      silentRefresh();
    } catch (err: any) {
      Alert.alert('Eroare', 'Nu s-a putut șterge studentul.');
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('StudentDetail', {
                  id: item.id,
                  name: item.name
                })
              }
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text>Vârstă: {item.age}</Text>
              <Text>Afecțiune: {item.condition}</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate('EditStudent', { student: item })
                }
              >
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  Alert.alert(
                    'Confirmare',
                    `Ștergi studentul ${item.name}?`,
                    [
                      { text: 'Anulează', style: 'cancel' },
                      {
                        text: 'Șterge',
                        style: 'destructive',
                        onPress: () => handleDelete(item.id)
                      }
                    ]
                  )
                }
              >
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddStudent')}
      >
        <Text style={styles.addButtonText}>+ Adaugă Elev</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardRow:        { flexDirection: 'row', alignItems: 'center', margin: 8 },
  card:           {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8
  },
  name:           { fontSize: 18, fontWeight: 'bold' },
  actions:        { flexDirection: 'row', marginLeft: 8 },
  editBtn:        {
    padding: 8,
    backgroundColor: '#ffd700',
    borderRadius: 4,
    marginRight: 4
  },
  deleteBtn:      {
    padding: 8,
    backgroundColor: '#ff4d4d',
    borderRadius: 4
  },
  actionText:     { fontSize: 16 },
  addButton:      {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16
  },
  addButtonText:  { color: '#fff', fontSize: 16 }
});
