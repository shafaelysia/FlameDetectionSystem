# IoT-Based Flame Detection System Using ESP32 and Firebase
## Project Description
This project is an IoT-based fire detection system that uses a KY-026 flame sensor, a DHT11 temperature sensor, and an ESP32 module to detect fire and monitor temperature. The data is sent to Firebase in real-time and can be accessed through a web interface. If a fire is detected, an alert is triggered.

### Web App Demo
You can access the web app at: **[Flame Detection System](https://flamedetectionsystem-311e7.web.app/)**

## Features
- Real-time fire detection using a KY-026 flame sensor
- Temperature monitoring with a DHT11 sensor
- Data storage and retrieval using Firebase
- Web interface for data visualization

## Arduino Libaries Used
- Firebase ESP32 Client (4.2.7)
- DHT Sensor Library (1.3.6)

## Circuit Connections
1. **DHT11 Sensor:**
  - VCC to 3.3V on ESP32
  - GND to GND on ESP32
  - Data pin to GPIO 22 on ESP32
2. **KY-026 Flame Sensor:**
  - VCC to 3.3V on ESP32
  - GND to GND on ESP32
  - Analog Output to GPIO 34 on ESP32
