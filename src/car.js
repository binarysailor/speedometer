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

    const speedometerConfig = {
        min: 0,
        max: 298, // yes, 298. That's my son's request...
        step: 20,
        minAngle: -20 / 16 * Math.PI,
        maxAngle: 4 / 16 * Math.PI
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

Car.prototype.pressAccelerate = function() {
    this.acceleratePressed = true;
};

Car.prototype.pressBrake = function() {
    this.brakePressed = true;
}

Car.prototype.releasePedals = function() {
    this.acceleratePressed = false;
    this.brakePressed = false;
}

Car.prototype.update = function() {
    if (this.acceleratePressed) {
        this.revs += this.calculateRevsIncrement();
        this.revs = util.constrain(this.revs, 0, this.maxRevs);
        this.revs2Speed();
    } else {
        if (this.brakePressed) {
            this.speed -= 2;
        } else {
            this.speed -= this.calculateNaturalSpeedDecrement();
        }
        this.speed = util.constrain(this.speed, 0, this.maxSpeed);
        this.speed2Revs();
    }

    this.speedometer.setValue(this.speed);
    this.tachometer.setValue(this.revs);
}

Car.prototype.calculateRevsIncrement = function() {
    let maxIncrement = 20;
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

Car.prototype.calculateNaturalSpeedDecrement = function() {
    let minDecrement = 0.12;
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

Car.prototype.speed2Revs = function() {
    this.revs = this.speed * this.revs2speedRatio;
};

Car.prototype.revs2Speed = function() {
    this.speed = this.revs / this.revs2speedRatio;
};

export default Car;