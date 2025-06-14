export type RootStackParamList = {
    StudentList: undefined;
    AddStudent: undefined;
    EditStudent: { student: { id: number; name: string; age: number; condition: string; notes: string } };
    StudentDetail: { id: number; name: string };
    AddMeasurement: { student_id: number };
    AddSession: { student_id: number };
    EditSession: { session: { id: number; student_id: number; session_date: string; session_type: string; notes: string } };
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
    Camera: { student_id: number; name: string };
    PhotoReview: {
        uri: string;
        student_id: number;
        name: string;
        overlay: string; // base64
        angles: {
            shoulderTilt: number;
            hipTilt: number;
            spineTilt: number;
        };
        posture: { id: number; photo_id: number; shoulder_tilt: string; hip_tilt: string; spine_tilt: string; created_at: string };
        photo_id: number;
    };
    GalleryImport: { student_id: number };
    AboutAI: undefined;
};