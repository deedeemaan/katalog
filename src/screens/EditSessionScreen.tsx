// src/screens/EditSessionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

type EditSessionRouteProp = RouteProp<RootStackParamList, 'EditSession'>;
type EditSessionNavProp   = NativeStackNavigationProp<RootStackParamList, 'EditSession'>;

export default function EditSessionScreen() {
  const route      = useRoute<EditSessionRouteProp>();
  const navigation = useNavigation<EditSessionNavProp>();
  const { session } = route.params;

  // Convert ISO → DD-MM-YYYY for display
  const [session_date, setSessionDate] = useState(() => {
    const d = new Date(session.session_date);
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });
  const [notes, setNotes] = useState(session.notes);

  const handleSave = async () => {
    // validate DD-MM-YYYY
    const re = /^([0-2]\d|3[0-1])-(0\d|1[0-2])-(\d{4})$/;
    if (!re.test(session_date)) {
      Alert.alert('Format greșit', 'Data trebuie să fie ZZ-LL-AAAA');
      return;
    }

    const [dd, mm, yyyy] = session_date.split('-');
    const api_date = `${yyyy}-${mm}-${dd}`;

    try {
      const res = await fetch(`${API_URL}/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_date: api_date,
          notes
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Eroare la actualizare');
      }
      Alert.alert('Succes', 'Sesiunea a fost actualizată.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare', err.message || 'Nu s-a putut actualiza sesiunea.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Editează Sesiune</Text>

        <Text style={styles.label}>Data (ZZ-LL-AAAA)*</Text>
        <TextInput
          style={styles.input}
          value={session_date}
          onChangeText={setSessionDate}
          placeholder="ex: 05-05-2025"
          keyboardType="default"
          maxLength={10}
        />

        <Text style={styles.label}>Notițe</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvează Modificările</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, backgroundColor: '#fff' },
  header:    { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label:     { marginTop: 12, fontWeight: '600' },
  input:     {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginTop: 4
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  button:    {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 6,
    marginTop: 24,
    alignItems: 'center'
  },
  buttonText:{ color: '#fff', fontWeight: '600' }
});
