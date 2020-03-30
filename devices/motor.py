from abc import ABCMeta
import pigpio

class AbstractDcMotor(metaclass=ABCMeta):
    def __init__(self,outpin1,outpin2,pwmpin):
        self.pig = pigpio.pi()
        self.outpin1 = outpin1
        self.outpin2 = outpin2
        self.pwmpin = pwmpin

    def drive(self ,speed):
        if speed < 0:
            self.pig.write(self.outpin1 ,1)
            self.pig.write(self.outpin2 ,0)
        if speed > 0:
            self.pig.write(self.outpin1 ,0)
            self.pig.write(self.outpin2 ,1)
        if speed == 0:
            self.pig.write(self.outpin1 ,0)
            self.pig.write(self.outpin2 ,0)

        self.pig.set_PWM_dutycycle(self.pwmpin, abs(speed))

class DcMotorFA130RA(AbstractDcMotor):
    pass    

class AbstractServoMotor(metaclass=ABCMeta):
    def __init__(self ,pwmpin):
        self._pig = pigpio.pi()
        self._pwmpin = pwmpin
        self._start_v = 0
        self._end_v = 0

    def _get_pulsewidth(self ,angle):
        angle += 45.0
        if angle < 0.0:
            angle = 0.0
        if angle > 90.0:
            angle = 90.0
        pw = (self._end_v - self._start_v) * (float(angle) / 90.0) + self._start_v
        return pw 

    def move(self ,angle):
        pw = self._get_pulsewidth(float(angle))
        self._pig.set_servo_pulsewidth(self._pwmpin ,pw)

class ServoMotorSG92(AbstractServoMotor):
    def __init__(self ,pwmpin):
        super().__init__(pwmpin)
        self._start_v = 500 # us
        self._end_v = 2400  # us
