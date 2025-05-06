// export const API_URL = 'http://192.168.1.135:3000'; // pentru Android emulator: http://10.0.2.2:3000
import { API_HOST } from '@env';

export const API_URL = `http://${API_HOST}:3000`;

export const getStudents = async () => {
  const response = await fetch(`${API_URL}/students`);
  return response.json();
};

// aici specificăm tipul datelor
type StudentData = {
  name: string;
  age: number;
  condition: string;
  notes: string;
};

export const addStudent = async (data: StudentData) => {
  const response = await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
