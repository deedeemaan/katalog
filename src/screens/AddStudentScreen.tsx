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
import { addStudent } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function AddStudentScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !age) {
      Alert.alert('Eroare', 'Completați cel puțin numele și vârsta elevului.');
      return;
    }
    setLoading(true); 
    try {
      await addStudent({
        name,
        age: Number(age),
        condition,
        notes
      });
      Alert.alert('Succes', 'Elev adăugat!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Eroare', 'Nu am putut adăuga elevul');
      console.error(err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Adaugă Elev</Text>

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

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{loading ? 'Salvăm...' : 'Salvează Elev'}</Text>
          </TouchableOpacity>

          {loading && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
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
  }
});
