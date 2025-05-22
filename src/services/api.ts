import { API_HOST } from '@env';

export const API_URL = `http://${API_HOST}:3000`;

export async function getStudents() {
  const res = await fetch(`${API_URL}/students`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Eroare backend: ' + text);
  }
  return res.json();
}

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
