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

type MeasurementRouteProp = RouteProp<RootStackParamList, 'AddMeasurement'>;
type MeasurementNavProp   = NativeStackNavigationProp<RootStackParamList, 'AddMeasurement'>;


export default function AddMeasurementScreen() {
  const route      = useRoute<MeasurementRouteProp>();
  const navigation = useNavigation<MeasurementNavProp>();
  const { studentId } = route.params;

  const [height, setHeight]                       = useState('');
  const [weight, setWeight]                       = useState('');
  const [headCirc, setHeadCirc]                   = useState('');
  const [chestCirc, setChestCirc]                 = useState('');
  const [abdominalCirc, setAbdominalCirc]         = useState('');
  const [physicalDisability, setPhysicalDisability] = useState('');

  const handleSave = async () => {
    if (!height || !weight) {
      Alert.alert('Eroare', 'Introduceți înălțimea și greutatea.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id:          studentId,
          height:              Number(height),
          weight:              Number(weight),
          head_circumference:  Number(headCirc),
          chest_circumference: Number(chestCirc),
          abdominal_circumference: Number(abdominalCirc),
          physical_disability: physicalDisability
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      Alert.alert('Succes', 'Măsurătoarea a fost salvată.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare', 'Nu s-a putut salva măsurătoarea.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1, backgroundColor: '#f8f9fb' }}
    >
      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>Adaugă Măsurători</Text>

          <Text style={styles.label}>Înalțime (cm)*</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📏</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
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
              value={weight}
              onChangeText={setWeight}
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
              value={headCirc}
              onChangeText={setHeadCirc}
              keyboardType="numeric"
              placeholder="ex: 50"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Perimetru toracic (cm)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>💪</Text>
            <TextInput
              style={styles.input}
              value={chestCirc}
              onChangeText={setChestCirc}
              keyboardType="numeric"
              placeholder="ex: 60"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Perimetru abdominal (cm)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🏃‍♂️</Text>
            <TextInput
              style={styles.input}
              value={abdominalCirc}
              onChangeText={setAbdominalCirc}
              keyboardType="numeric"
              placeholder="ex: 55"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.label}>Deficiență fizică</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={physicalDisability}
            onChangeText={setPhysicalDisability}
            multiline
            numberOfLines={3}
            placeholder="ex: scolioză, picior plat etc."
            placeholderTextColor="#bbb"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvează Măsurători</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 2,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#3b5bfd',
    width: 26,
    textAlign: 'center',
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
    marginBottom: 2,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
    marginTop: 4,
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
  }
});
