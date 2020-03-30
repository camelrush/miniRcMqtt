from devices.motor import ServoMotorSG92 as SG92
from devices.motor import DcMotorFA130RA as FA130RA
from devices.camera import VideoCamera as cam
import paho.mqtt.client
import ssl
import json
import time

# GPIO.PIN定義
GPIO_CTRL_SERVO_PWM = 18    # DCモータPWM出力
GPIO_CTRL_DC_OUT1 = 23      # DCモータ出力1
GPIO_CTRL_DC_OUT2 = 24      # DCモータ出力2
GPIO_CTRL_DC_PWM = 21       # ステアリング用サーボ出力
GPIO_CAMERA_H_PWM = 2       # カメラ用水平サーボ出力
GPIO_CAMERA_V_PWM = 3       # カメラ用垂直サーボ出力

# MQTT定義
AWSIoT_ENDPOINT = "xxxxxxxxxxxx-xxx.iot.ap-northeast-1.amazonaws.com"
MQTT_PORT = 8883
MQTT_TOPIC_TO = "miniRcTo"
MQTT_TOPIC_FROM = "miniRcFrom"
MQTT_ROOTCA = "./awscert/xxxxxxxxxCA1.pem"
MQTT_CERT = "./awscert/xxxxxxxxxx-certificate.pem.crt"
MQTT_PRIKEY = "./awscert/xxxxxxxxxx-private.pem.key"

ctrl_servo = SG92(GPIO_CTRL_SERVO_PWM)
ctrl_dc = FA130RA( \
    GPIO_CTRL_DC_OUT1 , \
    GPIO_CTRL_DC_OUT2 , \
    GPIO_CTRL_DC_PWM)
camera_servo_h = SG92(GPIO_CAMERA_H_PWM)
camera_servo_v = SG92(GPIO_CAMERA_V_PWM)

def on_connect(client, userdata, flags, respons_code):
    print("connected.")
    client.subscribe(MQTT_TOPIC_TO)
 
def on_message(client, userdata, msg):
    # 受信したPayload(Json型)からデータ取得
    json_dict = json.loads(msg.payload)
    steering = float(json_dict['steering']) - 8
    speed = int(json_dict['speed'])
    camangle_h = float(json_dict['camangle_h']) * -1
    camangle_v = float(json_dict['camangle_v'])

    print("steering:{0},speed:{1},camangle h:{2},camangle v:{3}".format(steering,speed,camangle_h,camangle_v))

    # GPIOから各種モータ制御
    ctrl_servo.move(steering)
    ctrl_dc.drive(speed)
    camera_servo_h.move(camangle_h)
    camera_servo_v.move(camangle_v)

def on_publish(client,userdata ,mid):
    print("published>>{0}".format(mid))

def _gen(camera):
    while True:
        # カメラ画像1フレーム取得
        frame = camera.get_frame()
        # 1フレームデータ返却
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

if __name__ == '__main__':
    client = paho.mqtt.client.Client()
    client.on_connect = on_connect
    client.on_publish = on_publish
    client.on_message = on_message
    client.tls_set(MQTT_ROOTCA, certfile=MQTT_CERT, keyfile=MQTT_PRIKEY, cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)
    client.connect(AWSIoT_ENDPOINT, port=MQTT_PORT, keepalive=60)
    client.loop_forever()
