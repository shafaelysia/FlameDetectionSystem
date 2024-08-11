#include <WiFi.h>
#include <DHT.h>
#include <FirebaseESP32.h>
#include "time.h"

#define DHTPIN 22
#define DHTTYPE DHT11
#define FLAME_PIN 34

DHT dht(DHTPIN, DHTTYPE);

// Wi-Fi credentials
const char* ssid = // WIFI SSID;
const char* password = // WIFI PASSWORD;
const char* ntpServer = "pool.ntp.org";

// Firebase setup
#define FIREBASE_HOST // FIREBASE HOST
#define FIREBASE_AUTH // FIREBASE AUTH

FirebaseData firebaseData;

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected to Wi-Fi with IP: ");
  Serial.println(WiFi.localIP());

  // Initialize Firebase connection
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  configTime(0, 0, ntpServer);
}

void loop() {
  struct tm timeinfo;
  getLocalTime(&timeinfo);
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }
  char utcTime[25];
  sprintf(utcTime, "%04d-%02d-%02dT%02d:%02d:%02dZ",
          timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
          timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  Serial.print("UTC Timestamp: ");
  Serial.println(utcTime);

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int flameValue = analogRead(FLAME_PIN);
  bool flameDetected = flameValue < 1000;

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" °C ");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" % ");
  Serial.print("Flame Sensor Value: ");
  Serial.print(flameValue);
  Serial.println();

  if (flameDetected) {
    Serial.println("Flame detected!");
  } else {
    Serial.println("No flame detected.");
  }

  if (Firebase.ready()) {
    String basePath = "/sensors/";

    FirebaseJson json;
    json.set("temperature", temperature);
    json.set("humidity", humidity);
    json.set("flameValue", flameValue);
    json.set("flameDetected", flameDetected);
    json.set("timestamp", utcTime);

    if (Firebase.pushJSON(firebaseData, basePath, json)) {
      Serial.println("Data pushed to Firebase with UTC time");
    } else {
      Serial.println("Failed to push data: " + firebaseData.errorReason());
    }
  } else {
    Serial.println("Failed to connect to Firebase");
  }

  delay(2000);
}