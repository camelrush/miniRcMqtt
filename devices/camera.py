import cv2

class VideoCamera(object):
    def __init__(self):
        # カメラ有効化/初期設定
        self.video = cv2.VideoCapture(0)
        self.video.set(cv2.CAP_PROP_FRAME_WIDTH, 160)
        self.video.set(cv2.CAP_PROP_FRAME_HEIGHT, 120)
        self.video.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('H', '2', '6', '4'))
        # カスケード分類器設定
        self.cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml')
        
    def __del__(self):
        # カメラ停止
        self.video.release()

    def _convert_frame(self ,image):
        # グレースケール変換(解析効率化のため)
        gray = cv2.cvtColor(image ,cv2.COLOR_BGR2GRAY)

        # 顔画像認識
        facerect = self.cascade.detectMultiScale(
            gray,
            scaleFactor=1.11,
            minNeighbors=3,
            minSize=(30, 30)
        )

        # 顔画像周辺を白枠で囲う
        if 0 != len(facerect):
            BORDER_COLOR = (255, 255, 255) # 線色を白に
            for rect in facerect:
                # 顔検出した部分に枠を描画
                cv2.rectangle(
                    image,
                    tuple(rect[0:2]),
                    tuple(rect[0:2] + rect[2:4]),
                    BORDER_COLOR,
                    thickness=2
                )
        return image

    def get_frame(self):
        # 1フレーム取得
        ret,image = self.video.read()
        # 画像変換(認識→白枠設定)
        image = self._convert_frame(image)
        # byteデータに変換
        ret,jpeg = cv2.imencode('.jpg',image)
        return jpeg.tobytes()
