// App.tsx
import 'react-native-gesture-handler';  // trebuie primul
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from '@react-navigation/native-stack';

// 1) Importă-ți tipurile de rute
import { RootStackParamList } from './src/navigation/types';

// 2) Importă-ți ecranele
import StudentListScreen from './src/screens/StudentListScreen';
import AddStudentScreen from './src/screens/AddStudentScreen';
import StudentDetailScreen from './src/screens/StudentDetailScreen';
import AddMeasurementScreen from './src/screens/AddMeasurementScreen';
import AddSessionScreen from './src/screens/AddSessionScreen';
import EditStudentScreen from './src/screens/EditStudentScreen';
import EditMeasurementScreen from './src/screens/EditMeasurementScreen';
import EditSessionScreen from './src/screens/EditSessionScreen';
import PhotoReviewScreen from './src/screens/PhotoReviewScreen';
import CameraScreen from './src/screens/CameraScreen';
import GalleryImportScreen from './src/screens/GalleryImportScreen';


// 3) Creează navigatorul și atașează param-list-ul
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StudentList">
        <Stack.Screen
          name="StudentList"
          component={StudentListScreen}
          options={{ title: 'Elevi' }}
        />
        <Stack.Screen
          name="AddStudent"
          component={AddStudentScreen}
          options={{ title: 'Adaugă Elev' }}
        />
        <Stack.Screen
          name="StudentDetail"
          component={StudentDetailScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
        <Stack.Screen
          name="AddMeasurement"
          component={AddMeasurementScreen}
          options={{ title: 'Add Measurement' }}
        />
        <Stack.Screen
          name="AddSession"
          component={AddSessionScreen}
          options={{ title: 'Add Session' }}
        />
        <Stack.Screen
          name="EditStudent"
          component={EditStudentScreen}
          options={{ title: 'Editează Elev' }}
        />
        <Stack.Screen
          name="EditMeasurement"
          component={EditMeasurementScreen}
          options={{ title: 'Editează Măsurătoare' }}
        />
        <Stack.Screen
          name="EditSession"
          component={EditSessionScreen}
          options={{ title: 'Editează Sesiune' }}
        />
        <Stack.Screen
          name="PhotoReview"
          component={PhotoReviewScreen}
          options={{ title: 'Review Photo' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Take Posture Photo', headerShown: false }}
        />
        <Stack.Screen
          name="GalleryImport"
          component={GalleryImportScreen}
          options={{ title: 'Importă Poze Test' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}