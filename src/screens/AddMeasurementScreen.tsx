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
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Adaugă Măsurători</Text>

        <Text style={styles.label}>Înalțime (cm)*</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Greutate (kg)*</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Perimetru cranian (cm)</Text>
        <TextInput
          style={styles.input}
          value={headCirc}
          onChangeText={setHeadCirc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Perimetru toracic (cm)</Text>
        <TextInput
          style={styles.input}
          value={chestCirc}
          onChangeText={setChestCirc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Perimetru abdominal (cm)</Text>
        <TextInput
          style={styles.input}
          value={abdominalCirc}
          onChangeText={setAbdominalCirc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Deficiență fizică</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={physicalDisability}
          onChangeText={setPhysicalDisability}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvează Măsurători</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  label: {
    marginTop: 12,
    fontWeight: '600'
  },
  input: {
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
