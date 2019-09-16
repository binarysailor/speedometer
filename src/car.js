import Meter from './meter';
import util from './util';

function Car() {
    this.speed = 0;
    this.revs = 0;
    this.gear = 1;

    this.maxSpeed = 298;
    this.maxRevs = 8000;

    this.acceleratePressed = false;
    this.brakePressed = false;

    this.revs2speedRatio = 25;

    this.brakeControl = {
        on: false,
        draw: (s, size) => {
            s.stroke('#ff0000');
            s.strokeWeight(2);
            s.fill(0);
            s.circle(0, size / 2, size * 0.95);
            s.noFill();
            s.arc(0, size / 2, size + 5, size + 5, Math.PI - Math.PI / 4, Math.PI + Math.PI / 4);
            s.arc(0, size / 2, size + 5, size + 5, -Math.PI / 4, Math.PI / 4);
            s.strokeWeight(1);
            s.textSize(size - 6);
            s.fill('#ff0000');
            s.textAlign(s.CENTER, s.CENTER);
            s.text('!', 0, size / 2);
        }
    };

    const speedometerConfig = {
        min: 0,
        max: 298, // yes, 298. That's my son's request...
        step: 20,
        minAngle: -20 / 16 * Math.PI,
        maxAngle: 4 / 16 * Math.PI,
        controls: [this.brakeControl]
    };
    this.speedometer = new Meter(speedometerConfig, "speedometer");

    const tachometerConfig = {
        min: 0,
        max: 8000,
        step: 1000,
        minAngle: -18 / 16 * Math.PI,
        maxAngle: 2 / 16 * Math.PI,
        displayTransform: revs => revs / 1000
    };
    this.tachometer = new Meter(tachometerConfig, "tachometer");
}

Car.prototype.pressAccelerate = function () {
    this.acceleratePressed = true;
    this.brakeControl.on = false;
};

Car.prototype.pressBrake = function () {
    this.brakePressed = true;
    this.brakeControl.on = true;
}

Car.prototype.releasePedals = function () {
    this.acceleratePressed = false;
    this.brakePressed = false;
}

Car.prototype.update = function (duration) {
    if (this.acceleratePressed) {
        this.revs += this.calculateRevsIncrement(duration);
        this.revs = util.constrain(this.revs, 0, this.maxRevs);
        this.revs2Speed();
    } else {
        if (this.brakePressed) {
            this.speed -= this.calculateBrakingSpeedDecrement(duration);
        } else {
            this.speed -= this.calculateNaturalSpeedDecrement(duration);
        }
        this.speed = util.constrain(this.speed, 0, this.maxSpeed);
        this.speed2Revs();
    }

    this.speedometer.setValue(this.speed);
    this.tachometer.setValue(this.revs);
}

Car.prototype.calculateRevsIncrement = function (duration) {
    let maxIncrement = duration;
    let factor = 1.0;

    if (this.revs < 1400) {
        factor = 0.6;
    } else if (this.revs < 4000) {
        factor = 0.8;
    } else if (this.revs < 6000) {
        factor = 1.0;
    } else {
        factor = 0.7;
    }

    if (this.speed < 90) {
        // noop
    } else if (this.speed < 120) {
        factor *= 0.8;
    } else if (this.speed < 150) {
        factor *= 0.7;
    } else if (this.speed < 200) {
        factor *= 0.6;
    } else if (this.speed < this.maxSpeed) {
        factor *= 0.5;
    } else {
        factor = 0;
    }

    return maxIncrement * factor;
};

Car.prototype.calculateBrakingSpeedDecrement = function (duration) {
    return duration / 25;
}

Car.prototype.calculateNaturalSpeedDecrement = function (duration) {
    let minDecrement = duration / 150;
    let factor = 1.0;

    if (this.speed < 90) {
        // noop
    } else if (this.speed < 120) {
        factor *= 1.2;
    } else if (this.speed < 150) {
        factor *= 1.3;
    } else if (this.speed < 200) {
        factor *= 1.6;
    } else {
        factor *= 2;
    }

    return minDecrement * factor;
}

Car.prototype.speed2Revs = function () {
    this.revs = this.speed * this.revs2speedRatio;
};

Car.prototype.revs2Speed = function () {
    this.speed = this.revs / this.revs2speedRatio;
};

export default Car;