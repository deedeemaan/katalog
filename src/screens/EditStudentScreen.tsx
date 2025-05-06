// src/screens/EditStudentScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../services/api';

type EditRouteProp = RouteProp<RootStackParamList, 'EditStudent'>;
type EditNavProp   = NativeStackNavigationProp<RootStackParamList, 'EditStudent'>;

export default function EditStudentScreen() {
  const route      = useRoute<EditRouteProp>();
  const navigation = useNavigation<EditNavProp>();
  const { student } = route.params;

  // pre-populam stările
  const [name, setName]         = useState(student.name);
  const [age, setAge]           = useState(student.age.toString());
  const [condition, setCondition] = useState(student.condition);
  const [notes, setNotes]       = useState(student.notes);

  const handleSave = async () => {
    if (!name || !age) {
      Alert.alert('Eroare', 'Numele și vârsta sunt obligatorii.');
      return;
    }

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
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Editează Elev</Text>

        <Text style={styles.label}>Nume*</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Vârstă*</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Afecțiune</Text>
        <TextInput
          style={styles.input}
          value={condition}
          onChangeText={setCondition}
        />

        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvează Modificările</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header:    { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label:     { marginTop: 12, fontWeight: '600' },
  input:     { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginTop: 4 },
  multiline: { height: 80, textAlignVertical: 'top' },
  button:    { backgroundColor: '#007AFF', padding: 14, borderRadius: 6, marginTop: 24, alignItems: 'center' },
  buttonText:{ color: '#fff', fontWeight: '600' }
});
