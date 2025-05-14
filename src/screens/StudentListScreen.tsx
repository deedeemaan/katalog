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
  ActivityIndicator,
  TextInput
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
  const [search, setSearch]         = useState('');

  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.condition.toLowerCase().includes(search.toLowerCase())
  );

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
      <View style={styles.searchBarWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Caută după nume sau afecțiune..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      <FlatList
        data={filteredStudents}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('StudentDetail', {
                  id: item.id,
                  name: item.name
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>Vârstă: <Text style={styles.infoValue}>{item.age}</Text></Text>
              <Text style={styles.info}>Afecțiune: <Text style={styles.infoValue}>{item.condition}</Text></Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.iconBtn, styles.iconEdit]}
                onPress={() =>
                  navigation.navigate('EditStudent', { student: item })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.icon}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconBtn, styles.iconDelete]}
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
                activeOpacity={0.7}
              >
                <Text style={styles.icon}>🗑️</Text>
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
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>+ Adaugă Elev</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f8f9fb' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardRow:        {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar:         {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#aab6fe',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText:     { color: '#3b5bfd', fontWeight: 'bold', fontSize: 22 },
  card:           {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  name:           { fontSize: 21, fontWeight: 'bold', color: '#3b5bfd', marginBottom: 2 },
  info:           { color: '#888', fontSize: 15, marginBottom: 1 },
  infoValue:      { color: '#222', fontWeight: '500' },
  actions:        {
    flexDirection: 'row',
    marginLeft: 0,
    gap: 8,
  },
  iconBtn:        {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  iconEdit:       {
    backgroundColor: '#e3e8ff',
    borderColor: '#3b5bfd',
  },
  iconDelete:     {
    backgroundColor: '#ffeaea',
    borderColor: '#ff6b6b',
  },
  icon:           { fontSize: 22 },
  addButton:      {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#3b5bfd',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3b5bfd',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText:  { color: '#fff', fontSize: 19, fontWeight: 'bold', letterSpacing: 1 },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#3b5bfd',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
  },
  searchIcon: {
    fontSize: 20,
    color: '#888',
    marginRight: 6,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
