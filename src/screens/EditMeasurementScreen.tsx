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

// Tipurile pentru navigație și parametrii rutei
type EditMeasurementRouteProp = RouteProp<RootStackParamList, 'EditMeasurement'>;
type EditMeasurementNavProp = NativeStackNavigationProp<RootStackParamList, 'EditMeasurement'>;

// Componenta principală pentru editarea măsurătorilor unui student
export default function EditMeasurementScreen() {
  const route = useRoute<EditMeasurementRouteProp>();
  const navigation = useNavigation<EditMeasurementNavProp>();
  const { measurement } = route.params;

  const {
    id,
    height,
    weight,
    head_circumference,
    chest_circumference,
    abdominal_circumference,
    physical_disability
  } = measurement;

  const [h, setH] = useState(height.toString());
  const [w, setW] = useState(weight.toString());
  const [hc, setHc] = useState(head_circumference?.toString() || '');
  const [cc, setCc] = useState(chest_circumference?.toString() || '');
  const [ac, setAc] = useState(abdominal_circumference?.toString() || '');
  const [pd, setPd] = useState(physical_disability || '');
  
  // Funcția pentru salvarea modificărilor
  const handleSave = async () => {
    if (!h || !w) {
      Alert.alert('Eroare', 'Introduceți înălțimea și greutatea.');
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
          student_id: measurement.student_id,
          height: Number(h),
          weight: Number(w),
          head_circumference: hc ? Number(hc) : null,
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
  
  // Returnarea UI-ului pentru editarea măsurătorilor
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Editează Măsurători</Text>

          <Text style={styles.label}>Înalțime (cm)*</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📏</Text>
            <TextInput
              style={styles.input}
              value={h}
              onChangeText={setH}
              keyboardType="numeric"
              placeholder="ex: 120"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Greutate (kg)*</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>⚖️</Text>
            <TextInput
              style={styles.input}
              value={w}
              onChangeText={setW}
              keyboardType="numeric"
              placeholder="ex: 25"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Perimetru cranian (cm)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🧠</Text>
            <TextInput
              style={styles.input}
              value={hc}
              onChangeText={setHc}
              keyboardType="numeric"
              placeholder="ex: 50"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Perimetru toracic (cm)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🫁</Text>
            <TextInput
              style={styles.input}
              value={cc}
              onChangeText={setCc}
              keyboardType="numeric"
              placeholder="ex: 60"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Perimetru abdominal (cm)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🧍</Text>
            <TextInput
              style={styles.input}
              value={ac}
              onChangeText={setAc}
              keyboardType="numeric"
              placeholder="ex: 55"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Deficiență fizică</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={pd}
            onChangeText={setPd}
            multiline
            numberOfLines={3}
            placeholder="ex: scolioză, picior plat etc."
            placeholderTextColor="#bbb"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvează Modificările</Text>
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
