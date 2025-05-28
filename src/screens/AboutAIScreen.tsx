import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutAIScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Despre AI</Text>
      <Text style={styles.paragraph}>
        Această aplicație utilizează un model de inteligență artificială (AI) pentru a analiza postura elevilor pe baza imaginilor încărcate. 
        Modelul AI este antrenat să detecteze unghiurile corpului, cum ar fi înclinarea umerilor, șoldurilor și coloanei vertebrale.
      </Text>
      <Text style={styles.paragraph}>
        Este important de reținut că acest model AI are limitări și nu poate înlocui expertiza unui specialist uman. 
        Rezultatele generate de AI sunt doar orientative și trebuie validate de către un profesionist calificat.
      </Text>
      <Text style={styles.paragraph}>
        Scopul principal al acestui instrument este de a oferi profesorilor o perspectivă inițială asupra posturii elevilor, 
        dar deciziile terapeutice și diagnostice trebuie să fie luate de către un specialist.
      </Text>
      <Text style={styles.paragraph}>
        Vă încurajăm să utilizați această aplicație ca un instrument complementar și să consultați un profesionist pentru o evaluare detaliată.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b5bfd',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
});