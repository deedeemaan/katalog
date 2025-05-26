// src/screens/EditMeasurementScreen.tsx
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

type EditMeasurementRouteProp   = RouteProp<RootStackParamList, 'EditMeasurement'>;
type EditMeasurementNavProp     = NativeStackNavigationProp<RootStackParamList, 'EditMeasurement'>;

export default function EditMeasurementScreen() {
  const route      = useRoute<EditMeasurementRouteProp>();
  const navigation = useNavigation<EditMeasurementNavProp>();
  const { measurement } = route.params;

  // Destructure snake_case fields from measurement
  const {
    id,
    height,
    weight,
    head_circumference,
    chest_circumference,
    abdominal_circumference,
    physical_disability
  } = measurement;

  const [h, setH]         = useState(height.toString());
  const [w, setW]         = useState(weight.toString());
  const [hc, setHc]       = useState(head_circumference.toString());
  const [cc, setCc]       = useState(chest_circumference.toString());
  const [ac, setAc]       = useState(abdominal_circumference.toString());
  const [pd, setPd]       = useState(physical_disability);

  const handleSave = async () => {
    if (!h || !w) {
      Alert.alert('Eroare', 'Introduceți cel puțin înălțimea și greutatea.');
      return;
    }
    if (isNaN(Number(h)) || isNaN(Number(w))) {
      Alert.alert('Eroare', 'Înălțimea și greutatea trebuie să fie numere.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/measurements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: Number(h),
          weight: Number(w),
          head_circumference:  hc ? Number(hc) : null,
          chest_circumference: cc ? Number(cc) : null,
          abdominal_circumference: ac ? Number(ac) : null,
          physical_disability: pd || null
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Eroare la actualizare');
      }

      Alert.alert('Succes', 'Măsurătoarea a fost actualizată.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare', err.message || 'Nu s-a putut actualiza măsurătoarea.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Editează Măsurătoare</Text>

        <Text style={styles.label}>Înălțime (cm)*</Text>
        <TextInput
          style={styles.input}
          value={h}
          onChangeText={setH}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Greutate (kg)*</Text>
        <TextInput
          style={styles.input}
          value={w}
          onChangeText={setW}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Circumferință cap (cm)</Text>
        <TextInput
          style={styles.input}
          value={hc}
          onChangeText={setHc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Circumferință piept (cm)</Text>
        <TextInput
          style={styles.input}
          value={cc}
          onChangeText={setCc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Circumferință abdomen (cm)</Text>
        <TextInput
          style={styles.input}
          value={ac}
          onChangeText={setAc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Deficiență fizică</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={pd}
          onChangeText={setPd}
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
  multiline: {
    height: 80,
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 6,
    marginTop: 24,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
