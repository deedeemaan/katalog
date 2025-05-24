export type RootStackParamList = {
    StudentList: undefined;
    AddStudent: undefined;
    EditStudent: { student: { id: number; name: string; age: number; condition: string; notes: string } };
    StudentDetail: { id: number; name: string };
    AddMeasurement: { studentId: number };
    AddSession: { studentId: number };
    EditSession: { session: { id: number; studentId: number; sessionDate: string; notes: string } };
    EditMeasurement: {
        measurement: {
            id: number;
            studentId: number;
            height: number;
            weight: number;
            headCircumference: number;
            chestCircumference: number;
            abdominalCircumference: number;
            physicalDisability: string;
            createdAt: string;
        }
    };
    Camera: { studentId: number, name: string };
    PhotoReview: {
        uri: string;
        studentId: number;
        name: string;
        overlay: string; // base64
        angles: { shoulderTilt: number; hipTilt: number; spineTilt: number };
        posture: { id: number; photoId: number; shoulderTilt: string; hipTilt: string; spineTilt: string; createdAt: string };
    }; GalleryImport: { studentId: number };
};
