// src/screens/EditStudentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

// Tipurile pentru navigație și parametrii rutei
type EditRouteProp = RouteProp<RootStackParamList, 'EditStudent'>;
type EditNavProp = NativeStackNavigationProp<RootStackParamList, 'EditStudent'>;

// Componenta principală pentru editarea unui elev
export default function EditStudentScreen() {
  const route = useRoute<EditRouteProp>();
  const navigation = useNavigation<EditNavProp>();
  const { student } = route.params;

  const [name, setName] = useState(student.name);
  const [age, setAge] = useState(student.age.toString());
  const [condition, setCondition] = useState(student.condition);
  const [notes, setNotes] = useState(student.notes);
  const [loading, setLoading] = useState(false);

  // Funcția pentru salvarea modificărilor
  const handleSave = async () => {
    if (!name || !age) {
      Alert.alert('Eroare', 'Numele și vârsta sunt obligatorii.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age: Number(age),
          condition,
          notes
        })
      });
      if (!response.ok) throw new Error('Eroare la actualizare');
      Alert.alert('Succes', 'Student actualizat.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare', 'Nu s-a putut actualiza studentul.');
    } finally {
      setLoading(false);
    }
  };

  // Returnarea UI-ului pentru editarea elevului
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Editează Elev</Text>

          <Text style={styles.label}>Nume elev*</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="ex: Ion Popescu"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Vârstă*</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🎂</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="ex: 16"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Afecțiune</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🩺</Text>
            <TextInput
              style={styles.input}
              value={condition}
              onChangeText={setCondition}
              placeholder="ex: scolioză"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Notițe</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="ex: necesită monitorizare lunară"
            placeholderTextColor="#bbb"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>{loading ? 'Salvăm...' : 'Salvează Modificările'}</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
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
    padding: 18
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#3b5bfd',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#3b5bfd',
    letterSpacing: 1,
    textAlign: 'center'
  },
  label: {
    marginTop: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#3b5bfd',
    width: 26,
    textAlign: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    fontSize: 16,
    color: '#222',
    marginTop: 4,
    marginBottom: 2
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
    marginTop: 4
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
    elevation: 4
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  }
});
