import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

type SessionRouteProp = RouteProp<RootStackParamList, 'AddSession'>;
type SessionNavProp   = NativeStackNavigationProp<RootStackParamList, 'AddSession'>;

export default function AddSessionScreen() {
  const route      = useRoute<SessionRouteProp>();
  const navigation = useNavigation<SessionNavProp>();
  const { studentId } = route.params;

  const [sessionDate, setSessionDate] = useState('');   // utilizator introduce ZZ-LL-AAAA
  const [notes, setNotes]             = useState('');

  const handleSave = async () => {
    // Regex simplu pentru DD-MM-YYYY
    const re = /^([0-2]\d|3[01])-(0\d|1[0-2])-(\d{4})$/;
    if (!re.test(sessionDate)) {
      Alert.alert('Format greșit', 'Data trebuie să fie în formatul ZZ-LL-AAAA');
      return;
    }

    // Split și reordonare pentru API: YYYY-MM-DD
    const [dd, mm, yyyy] = sessionDate.split('-');
    const apiDate = `${yyyy}-${mm}-${dd}`;

    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id:  studentId,
          session_date: apiDate,
          notes
        })
      });
      if (!response.ok) throw new Error('Eroare la salvare');
      Alert.alert('Succes', 'Sesiunea a fost salvată.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare', 'Nu s-a putut salva sesiunea.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Adaugă Sesiune</Text>

        <Text style={styles.label}>Data (ZZ-LL-AAAA)*</Text>
        <TextInput
          style={styles.input}
          value={sessionDate}
          onChangeText={setSessionDate}
          placeholder="ex: 05-05-2025"
          keyboardType="default"
          maxLength={10}
        />

        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvează Sesiune</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header:    { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label:     { marginTop: 12, fontWeight: '600' },
  input:     {
    borderWidth: 1, borderColor: '#ccc',
    padding: 8, borderRadius: 4, marginTop: 4
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  button:    {
    backgroundColor: '#007AFF',
    padding: 14, borderRadius: 6, marginTop: 24,
    alignItems: 'center'
  },
  buttonText:{ color: '#fff', fontWeight: '600' }
});
