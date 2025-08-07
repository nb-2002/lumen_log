#include <ArduinoJson.h>
#include <BH1750.h>
#include <M5Atom.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <Wire.h>

#include <Ticker.h>
Ticker tickerMeasure;

// wifi stuff
#define WIFI_SSID "IOTAPNET"
#define WIFI_PASSWORD "monoiotan2012"

// mqtt stuff
#define MQTT_SERVER "10.30.5.44"
#define MQTT_PORT 1883
#define MQTT_BUFFER_SIZE 128
#define TOPIC "atom01/lux"
#define DEVICE_ID "atom001"

BH1750 lightMeter;

const int message_capacity = JSON_OBJECT_SIZE(3);
StaticJsonDocument<message_capacity> json_message;
char message_buffer[MQTT_BUFFER_SIZE];

WiFiClient espClient;
PubSubClient client(espClient);

void setupWifi() {
  // connect wifi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  Serial.println("");
  Serial.print("Connected : ");
  Serial.println(WiFi.localIP());
  // sync Time
  configTime(3600L * 9, 0, "ntp.nict.jp", "ntp.jst.mfeed.ad.jp");
  // connect to mqtt
  client.setServer(MQTT_SERVER, MQTT_PORT);
  tickerMeasure.attach_ms(1000, getSensorData);
}

void getSensorData() {
  float lux = lightMeter.readLightLevel();
  Serial.print("Light: ");
  Serial.print(lux);
  delay(1000);

  json_message.clear();
  json_message["lux"] = lux;
  serializeJson(json_message, message_buffer, sizeof(message_buffer));
  client.publish(TOPIC, message_buffer);
}

void setup() {
  Serial.begin(115200);
  M5.begin(true, false, true);
  Wire.begin(26, 32);
  lightMeter.begin();
  setupWifi();
}

void loop() {
  client.loop();
  while (!client.connected()) {
    Serial.println("Mqtt Reconnecting");
    if (client.connect(DEVICE_ID)) {
      Serial.println("Mqtt Connected");
      break;
    }
    delay(1000);
  }
  M5.update();
}
