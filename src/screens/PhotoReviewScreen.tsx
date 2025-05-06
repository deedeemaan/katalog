// // src/screens/PhotoReviewScreen.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   ScrollView
// } from 'react-native';
// import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/types';
// import { API_URL } from '../services/api';

// type PhotoReviewRouteProp = RouteProp<RootStackParamList, 'PhotoReview'>;
// type PhotoReviewNavProp   = NativeStackNavigationProp<RootStackParamList, 'PhotoReview'>;

// export default function PhotoReviewScreen() {
//   const route      = useRoute<PhotoReviewRouteProp>();
//   const navigation = useNavigation<PhotoReviewNavProp>();
//   const { uri }    = route.params;

//   const [processing, setProcessing] = useState(false);
//   const [analysis, setAnalysis]     = useState<null | {
//     keypoints: Array<{ x: number; y: number; name: string }>;
//     angles: Array<{ name: string; value: number; alert: boolean }>;
//     annotatedUri?: string;
//   }>(null);

//   const runAnalysis = async () => {
//     setProcessing(true);
//     try {
//       // Exemplu de apel către endpoint AI
//       const res = await fetch(`${API_URL}/analyze`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ imageUri: uri })
//       });
//       if (!res.ok) throw new Error('Analysis failed');
//       const result = await res.json();
//       // result ar putea conține: keypoints, angles, și optional annotatedUri
//       setAnalysis(result);
//     } catch (err: any) {
//       console.error(err);
//       Alert.alert('Eroare', err.message || 'Nu s-a putut analiza imaginea.');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Review Photo</Text>

//       <Image source={{ uri }} style={styles.photo} resizeMode="contain" />

//       {analysis?.annotatedUri && (
//         <View style={styles.annotationContainer}>
//           <Text style={styles.subheader}>Annotated</Text>
//           <Image source={{ uri: analysis.annotatedUri }} style={styles.photo} resizeMode="contain" />
//         </View>
//       )}

//       {!analysis ? (
//         <TouchableOpacity
//           style={styles.button}
//           onPress={runAnalysis}
//           disabled={processing}
//         >
//           {processing ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Analyze & Measure</Text>
//           )}
//         </TouchableOpacity>
//       ) : (
//         <View style={styles.resultContainer}>
//           <Text style={styles.subheader}>Results</Text>
//           {analysis.angles.map((angle, i) => (
//             <Text
//               key={i}
//               style={[
//                 styles.angleText,
//                 angle.alert && styles.alertText
//               ]}
//             >
//               {angle.name}: {angle.value.toFixed(1)}°
//               {angle.alert && ' ⚠️'}
//             </Text>
//           ))}
//           <TouchableOpacity
//             style={[styles.button, { marginTop: 16 }]}
//             onPress={() => {
//               // opțional: salvează măsurătoare în backend
//               navigation.goBack();
//             }}
//           >
//             <Text style={styles.buttonText}>Done</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container:           { padding: 16, backgroundColor: '#fff' },
//   header:              { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
//   subheader:           { fontSize: 18, fontWeight: '600', marginVertical: 8 },
//   photo:               { width: '100%', height: 300, borderRadius: 8, backgroundColor: '#eee' },
//   annotationContainer: { marginTop: 16 },
//   button:              {
//     backgroundColor: '#007AFF',
//     padding: 14,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 16
//   },
//   buttonText:          { color: '#fff', fontWeight: '600' },
//   resultContainer:     { marginTop: 16 },
//   angleText:           { fontSize: 16, marginVertical: 4 },
//   alertText:           { color: 'red' }
// });
