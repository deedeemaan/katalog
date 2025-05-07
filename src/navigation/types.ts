export type RootStackParamList = {
    StudentList: undefined;
    AddStudent: undefined;
    EditStudent: { student: { id: number; name: string; age: number; condition: string; notes: string } };
    StudentDetail: { id: number; name: string };
    AddMeasurement: { studentId: number };
    AddSession: { studentId: number };
    EditSession: { session: { id: number; student_id: number; session_date: string; notes: string } };
    EditMeasurement: {
        measurement: {
            id: number;
            student_id: number;
            height: number;
            weight: number;
            head_circumference: number;
            chest_circumference: number;
            abdominal_circumference: number;
            physical_disability: string;
            created_at: string;
        }
    };
    Camera: { studentId: number };
    PhotoReview:  { uri: string; studentId: number };
};
