var MQTT_TOPIC = "miniRcTo"
var ADJUST_INTERVAL = 50;  // ms

var camangleH_controller;
var camangleV_controller;
var steering_controller;
var speed_controller;
var adjust_timer;

var credentials = {};
credentials.accessKeyId = "xxxxxxxxxxxxxxxx";
credentials.secretAccessKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
var requestUrl = SigV4Utils.getSignedUrl('xxxxxxxxxxxxxxxx-xxx.iot.ap-northeast-1.amazonaws.com', 'ap-northeast-1', credentials);
 
var clientId = 'awss3_controller';
var client = new Paho.Client(requestUrl, clientId);
var connectOptions = {
	useSSL: true,
	timeout: 3,
	mqttVersion: 4,
	onSuccess: onConnect
};
client.connect(connectOptions);

$(document).ready(function() {

    // カメラ制御(水平)
    camangleH_controller = new OneWayController($('#camangle-h-ctrl-cvs')[0], $('#camangle-h-ctrl-val') ,change_value ,
                    {orientation :"horizon" , maxvalue :20 ,threshold :2});

    // カメラ制御(垂直)
    camangleV_controller = new OneWayController($('#camangle-v-ctrl-cvs')[0], $('#camangle-v-ctrl-val') ,change_value ,
                    {orientation :"virtical" ,maxvalue :20 ,threshold :2});

    // ステアリング制御
    steering_controller = new OneWayController($('#steering-ctrl-cvs')[0] , $('#steering-ctrl-val'),change_value ,
                    {orientation :"horizon" ,maxvalue :10 ,threshold :1});

    // スピード制御
    speed_controller = new OneWayController($('#speed-ctrl-cvs')[0], $('#speed-ctrl-val') ,change_value ,
                    {orientation :"virtical" ,maxvalue :255 ,threshold :15});

    // 自動調整タイマー設定
    this._adjust_timer = setInterval(autoAdjust ,ADJUST_INTERVAL);

});

$(window).on('load',function() {

    // カメラ画像領域を追加
    $('#capture-view').append('<iframe id="capture-frame" src="./capture">');
    $('#capture-view').css('width','160px');
    $('#capture-view').css('height','120px');
    $('#capture-view').css('float','left');
    $('#capture-view').css('margin-top','40px');
    $('#capture-frame').css('width','160px');
    $('#capture-frame').css('height','120px');
    $('#capture-frame').css('border-style','none');
    $('#capture-frame').css('border-radius','10px');

});

function autoAdjust(){
    steering_controller.autoAdjust();
    speed_controller.autoAdjust();
}

function change_value(){

    var data = {
        camangle_h: camangleH_controller.getValue(),
        camangle_v: camangleV_controller.getValue(),
        steering: steering_controller.getValue(),
        speed: speed_controller.getValue()
    };

	var msg = new Paho.Message(JSON.stringify(data));
	msg.destinationName = MQTT_TOPIC;
	client.send(msg);
}

function onConnect()
{
	console.log("connected");
}
