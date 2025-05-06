import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { addStudent } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function AddStudentScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [condition, setCondition] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        if (!name || !age) {
            Alert.alert('Eroare', 'Completați cel puțin numele și vârsta elevului.');
            return;
        }
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
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nume elev</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />

            <Text style={styles.label}>Vârstă</Text>
            <TextInput
                value={age}
                onChangeText={setAge}
                style={styles.input}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Afecțiune</Text>
            <TextInput value={condition} onChangeText={setCondition} style={styles.input} />

            <Text style={styles.label}>Note</Text>
            <TextInput
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, styles.multiline]}
                multiline
                numberOfLines={3}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Salvează elev</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    label: { marginTop: 12, fontWeight: '600' },
    input: {
        borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginTop: 4
    },
    multiline: { height: 80, textAlignVertical: 'top' },
    button: {
        backgroundColor: '#007AFF', padding: 14, borderRadius: 6, marginTop: 24, alignItems: 'center'
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
