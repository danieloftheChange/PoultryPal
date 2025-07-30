# Poultry Management System
**BSSE 4105 | GROUP-9**  

## 1. Project Overview  
The  project aims to develop a comprehensive Poultry Management System that leverages predictive modeling and IoT technology for real-time monitoring of environmental conditions. The application integrates multiple components to streamline poultry operations, offering a user-friendly web interface, a mobile application for on-the-go access, AI-powered predictive analytics, and IoT-enabled monitoring to enhance decision-making and operational efficiency.

## 2. Project Structure  

The project is organized into the following directories:

- **`Web-App/`** - Contains the React.js application for the frontend dashboard for interacting with the system.

- **`Mobile-App/`** - Contains the Flutter mobile application, offering on-the-go access to system features.

- **`API/`** - Contains the Node.js/Express.js application for handling core server-side logic.

- **`AI-Model/`** - Contains the FastAPI application for serving AI-based predictive models.

- **`Arduino/`** - Contains the Arduino code for IoT systems and real-time environment monitoring.

## Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (version 20 or higher)
- **npm** (version 8 or higher)
- **Python** (version 3.9 or higher)
- **pip** (version 21 or higher)
- **Flutter SDK** (latest stable version)

## Cloning the Project

To clone the project, run the following command in your terminal:

git clone https://github.com/kalibbalajohnson/Poultry-Management-System.git

## Setting Up the Project

### API Setup
- cd API

- npm install

- npm run dev

### Web-App Setup
- cd Web-App

- npm install

- npm run dev

### AI-Model Setup
- cd AI-Model

- python -m venv venv

- venv\Scripts\activate 

- pip install -r requirements.txt

- uvicorn main:app --reload

### Mobile-App Setup
- cd Mobile-App

- flutter pub get

- flutter run

### Arduino Setup
- Open the Arduino IDE and navigate to the project directory

- Ensure all necessary libraries are installed.

- Upload the code to the Arduino board


