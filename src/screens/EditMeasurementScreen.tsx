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

type EditMeasurementRouteProp = RouteProp<RootStackParamList, 'EditMeasurement'>;
type EditMeasurementNavProp   = NativeStackNavigationProp<RootStackParamList, 'EditMeasurement'>;


export default function EditMeasurementScreen() {
  const route      = useRoute<EditMeasurementRouteProp>();
  const navigation = useNavigation<EditMeasurementNavProp>();
  const { measurement } = route.params;

  const [height, setHeight]                       = useState(measurement.height.toString());
  const [weight, setWeight]                       = useState(measurement.weight.toString());
  const [headCirc, setHeadCirc]                   = useState(measurement.headCircumference.toString());
  const [chestCirc, setChestCirc]                 = useState(measurement.chestCircumference.toString());
  const [abdominalCirc, setAbdominalCirc]         = useState(measurement.abdominalCircumference.toString());
  const [physicalDisability, setPhysicalDisability] = useState(measurement.physicalDisability);

  const handleSave = async () => {
    if (!height || !weight) {
      Alert.alert('Eroare', 'Introduceți cel puțin înălțimea și greutatea.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/measurements/${measurement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: Number(height),
          weight: Number(weight),
          headCircumference:  Number(headCirc),
          chestCircumference: Number(chestCirc),
          abdominalCircumference: Number(abdominalCirc),
          physicalDisability: physicalDisability
        })
      });

      if (!response.ok) throw new Error('Eroare la actualizare');
      Alert.alert('Succes', 'Măsurătoarea a fost actualizată.');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Eroare', 'Nu s-a putut actualiza măsurătoarea.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Editează Măsurătoare</Text>

        <Text style={styles.label}>Înălțime (cm)*</Text>
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

        <Text style={styles.label}>Circumferință cap (cm)</Text>
        <TextInput
          style={styles.input}
          value={headCirc}
          onChangeText={setHeadCirc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Circumferință piept (cm)</Text>
        <TextInput
          style={styles.input}
          value={chestCirc}
          onChangeText={setChestCirc}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Circumferință abdomen (cm)</Text>
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
  input:     {
    borderWidth: 1, borderColor: '#ccc',
    padding: 8, borderRadius: 4, marginTop: 4
  },
  multiline: {
    height: 80, textAlignVertical: 'top'
  },
  button:    {
    backgroundColor: '#007AFF',
    padding: 14, borderRadius: 6,
    marginTop: 24, alignItems: 'center'
  },
  buttonText:{ color: '#fff', fontWeight: '600' }
});
