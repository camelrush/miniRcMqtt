var LEVER_RADIUS = 10;      // pixel

class OneWayController{

    constructor(canvas ,valuetext ,change_event_handler ,param_json) {

        // 変数初期化
        this._canvas = canvas;
        this._valuetext = valuetext;
        this._change_event_handler = change_event_handler;
        this._onTouch = false;

        // jsonパラメータ取得
        this._orientation = param_json.orientation;
        this._maxvalue = param_json.maxvalue;
        this._threshold = param_json.threshold;

        // レバー領域コンテキスト取得
        this._ctx = canvas.getContext('2d');

        // レバー中央位置を取得
        this._centerPos = ((this._orientation == 'horizon') ? canvas.width : canvas.height) / 2;

        // レバー位置を初期化(中央)
        this._pos = this._centerPos;
        this._leverDraw(this._pos);
        this._value = this._calcValue(this._pos);
        this._valuetext.text(this._value); 

        // イベントハンドラ(タッチ開始)
        this._canvas.addEventListener('touchstart', e => {
            this._onTouch = true;
        });

        // イベントハンドラ(タッチ終了)
        this._canvas.addEventListener('touchend', e => {
            this._onTouch = false;
        });

        // イベントハンドラ(タッチ移動)
        this._canvas.addEventListener('touchmove', e => {

            var pos = 0;
            var value = 0;
            var bounds = e.target.getBoundingClientRect();
            var touch = event.targetTouches[0];

            // スクロール抑止
            e.preventDefault();

            // レバー位置を取得
            pos = this._getPos(bounds ,touch);
            this._pos = pos;

            // レバー領域を描画
            this._leverDraw(pos);

            // 制御値を取得
            value = this._calcValue(pos);
            this._value = value;

            // 制御値領域を描画
            this._valuetext.text(value); 

            // 制御値が敷居値を超えて変化したらchangeイベント発火
            if (this.old_value != value) this._change_event_handler(value);
            this.old_value = value;
       });
    }

    getValue(){
        return this._value;
    }

    // 自動アジャスト(非操作時にはカーソルを中央位置に戻していく)
    autoAdjust(){

        // 自動調整不要、または操作中であれば処理中断
        if (this._onTouch) return;

        var pos = 0;
        var value = 0;

        // レバー位置を中央寄りに更新
        if (this._pos != this._centerPos) {
            // レバー位置を計算
            var sub = ((this._centerPos - this._pos) / 2);
            sub = (sub < 0 ? Math.floor(sub) : Math.ceil(sub));
            pos = this._pos + sub;
        } else {
            pos = this._centerPos;
        }
        this._pos = pos;

        // レバー領域を描画
        this._leverDraw(pos);

        // 制御値を取得
        value = this._calcValue(pos);
        this._value = value;

        // 制御値領域を描画
        this._valuetext.text(value); 

        // 制御値が敷居値を超えて変化したらchangeイベント発火
        if (this.old_value != value) this._change_event_handler(value);
        this.old_value = value;
    }

    // レバー位置取得
    _getPos(bounds ,touch) {

        var inputPos = 0;
        var maxPos = 0;
        var pos = 0;

        // タッチ座標からレバー位置を取得
        if (this._orientation == 'horizon') {
            inputPos = Math.floor(touch.clientX - bounds.left);
            maxPos = this._canvas.width;
        }
        if (this._orientation == 'virtical') {
            inputPos = Math.floor(touch.clientY - bounds.top);
            maxPos =this._canvas.height;
        }

        // レバー位置を最小/最大の範囲内に補正
        if (inputPos > (maxPos - LEVER_RADIUS)) {
            // 入力位置 > 領域上限
            pos = (maxPos - LEVER_RADIUS);
        } else if (inputPos < LEVER_RADIUS) {
            // 入力位置 < 領域下限
            pos = LEVER_RADIUS;
        } else {
            // 領域下限 < 入力位置 < 領域上下
            pos = inputPos;
        }

        // 位置を返却
        return pos;
    }

    // 制御値を計算
    _calcValue(pos){

        var value = 0;
        var lever_pos = pos - LEVER_RADIUS;
        var lever_pitch = (this._orientation == 'horizon' ? this._canvas.width : this._canvas.height) - (LEVER_RADIUS * 2); 

        // 制御値を取得
        //if (this._orientation == 'horizon') {
        //    value = (Math.round((this._maxvalue * 2) * (pos / this._canvas.width)) - this._maxvalue);
        //}
        //if (this._orientation == 'virtical') {
        //    value = (Math.round((this._maxvalue * 2) * (pos / this._canvas.height)) - this._maxvalue) * -1;
        //}

        value = (Math.round((this._maxvalue * 2) * (lever_pos / lever_pitch)) - this._maxvalue) * -1;

        // 制御値は閾単位で切り捨て
        value = value - (value % this._threshold);

        return value;
    }

    // 画面更新処理
    _leverDraw(pos) {

        // 領域を初期化
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // レーンを描画
        this._ctx.beginPath();
        this._ctx.lineWidth = 10;
        this._ctx.strokeStyle = 'rgb(80,80,80)';
        this._ctx.lineCap = 'round';
        if (this._orientation == 'horizon') {
            this._ctx.moveTo(LEVER_RADIUS, this._centerPos);
            this._ctx.lineTo(this._canvas.width - LEVER_RADIUS, this._centerPos);
        }
        if (this._orientation == 'virtical') {
            this._ctx.moveTo(this._centerPos, LEVER_RADIUS);
            this._ctx.lineTo(this._centerPos, this._canvas.height - LEVER_RADIUS);
        }
        this._ctx.stroke();

        // レバーの丸を描画
        this._ctx.beginPath();
        var circleX,circleY = 0;
        if (this._orientation == 'horizon') {
            circleX = pos;
            circleY = this._canvas.height / 2;
        }
        if (this._orientation == 'virtical') {
            circleX = this._canvas.width / 2;
            circleY = pos;
        }
        this._ctx.arc(circleX, circleY, LEVER_RADIUS, 0, Math.PI * 2, false);
        this._ctx.fillStyle = 'rgb(255,255,255)';
        this._ctx.fill();
    }
}
