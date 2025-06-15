// src/screens/AddSessionScreen.tsx
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

// Tipurile pentru navigație și parametrii rutei
type SessionRouteProp = RouteProp<RootStackParamList, 'AddSession'>;
type SessionNavProp   = NativeStackNavigationProp<RootStackParamList, 'AddSession'>;

// Lista tipurilor de sesiuni disponibile
const SESSION_TYPES = [
  { label: 'Evaluare', value: 'evaluare' },
  { label: 'Consolidare', value: 'consolidare' },
  { label: 'Corecție', value: 'corectie' },
];

// Componenta principală pentru adăugarea unei sesiuni
export default function AddSessionScreen() {
  const route      = useRoute<SessionRouteProp>();
  const navigation = useNavigation<SessionNavProp>();
  const { student_id } = route.params;

  // State-uri pentru câmpurile de input
  const [session_date, setSessionDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker]   = useState(false);
  const [notes, setNotes]             = useState('');
  const [session_type, setSessionType] = useState(SESSION_TYPES[0].value);

  // Funcția pentru salvarea sesiunii
  const handleSave = async () => {
    try {
      const apiDate = session_date.toISOString().slice(0, 10);
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id,
          session_date: apiDate,
          notes,
          session_type
        })
      });

      // Verificarea răspunsului API      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }
      Alert.alert('Succes', 'Sesiunea a fost salvată.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare', err.message || 'Nu s-a putut salva sesiunea.');
    }
  };

  // Returnarea UI-ului pentru adăugarea sesiunii
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Adaugă Sesiune</Text>

          <Text style={styles.label}>Data*</Text>
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.inputIcon}>📅</Text>
            <Text style={styles.inputText}>
              {session_date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={session_date}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowPicker(false);
                if (date) setSessionDate(date);
              }}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Tip sesiune*</Text>
          <View style={styles.sessionTypeRow}>
            {SESSION_TYPES.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.sessionTypeBtn,
                  session_type === opt.value && styles.sessionTypeBtnActive
                ]}
                onPress={() => setSessionType(opt.value)}
              >
                <Text
                  style={[
                    styles.sessionTypeText,
                    session_type === opt.value && styles.sessionTypeTextActive
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholder="ex: observații, progres, etc."
            placeholderTextColor="#bbb"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvează Sesiune</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },
  outerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: '#f8f9fb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#3b5bfd',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#3b5bfd',
    letterSpacing: 1,
    textAlign: 'center',
  },
  label: {
    marginTop: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#3b5bfd',
    width: 26,
    textAlign: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    fontSize: 16,
    color: '#222',
    marginTop: 4,
    marginBottom: 2,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
    marginTop: 4,
  },
  sessionTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  sessionTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 2,
  },
  sessionTypeBtnActive: {
    backgroundColor: '#3b5bfd',
    borderColor: '#3b5bfd',
  },
  sessionTypeText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  sessionTypeTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#3b5bfd',
    padding: 16,
    borderRadius: 12,
    marginTop: 28,
    alignItems: 'center',
    shadowColor: '#3b5bfd',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
});
