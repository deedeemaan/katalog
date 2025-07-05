#katalog-frontend
# Katalog Frontend

This repository contains the frontend implementation of **Katalog**, a mobile application developed as part of my bachelor's thesis. Katalog is designed specifically for physical therapists working in special education schools to help track, analyze, and monitor student posture.

## Features

* **Student Profiles**: Create, edit, and manage student records.
* **Posture Analysis**: Capture and analyze posture using images overlaid with a grid to calculate critical body angles.
* **Measurement Tracking**: Record and track anthropometric measurements such as height, weight, and body circumferences over time.
* **Visual Feedback**: Provides clear visual indicators for postural deviations detected by the integrated AI.
* **Photo History**: Maintain historical records of posture analyses for each student.

## Technologies Used

* **React Native**: For cross-platform mobile app development.
* **Expo**: To simplify app development, building, and testing.
* **TypeScript**: Ensuring maintainability and robust type checking.
* **React Navigation**: Navigating between different screens within the app.

## Setup & Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/katalog-frontend.git
```

2. Navigate into the repository:

```bash
cd katalog-frontend
```

3. Install dependencies:

```bash
npm install
```

4. Run the app locally:

```bash
npm start
```

Use the Expo Go app on your physical device or emulator to run the application.

## Backend

This application depends on the [Katalog Backend](https://github.com/deedeemaan/katalog-backend) to handle data storage, image processing, and AI-driven posture analysis.
