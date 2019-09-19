import Gearbox from './gearbox';
import Meter from './meter';
import util from './util';

function Car() {
    this.speed = 0;
    this.revs = 0;
    this.gearbox = new Gearbox();

    this.maxSpeed = 298;  // yes, 298. That's my son's request...
    this.maxRevs = 9000;

    this.acceleratePressed = false;
    this.brakePressed = false;

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
        max: this.maxSpeed,
        step: 20,
        minAngle: -20 / 16 * Math.PI,
        maxAngle: 4 / 16 * Math.PI,
        controls: [this.brakeControl]
    };
    this.speedometer = new Meter(speedometerConfig, "speedometer");


    this.gearControl = {
        on: true,
        draw: (s, size) => {
            s.stroke('yellow');
            s.fill('yellow');
            s.textSize(size - 8);
            s.textAlign(s.CENTER, s.CENTER);
            s.text(this.gearbox.gear, 0, size / 2);
        }
    }
    const tachometerConfig = {
        min: 0,
        max: this.maxRevs,
        step: 1000,
        minAngle: -18 / 16 * Math.PI,
        maxAngle: 2 / 16 * Math.PI,
        displayTransform: revs => revs / 1000,
        controls: [this.gearControl]
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
        if (!this.gearbox.isSwitching()) {
            this.revs += this.calculateRevsIncrement(duration);
            this.revs = util.constrain(this.revs, 0, this.maxRevs);
            this.speed = this.gearbox.revsToSpeed(this.revs);
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
                this.revs = this.gearbox.speedToRevs(this.speed, null, null);
            }
        } else {
            this.speed -= this.calculateNaturalSpeedDecrement(duration);
            this.revs = this.gearbox.speedToRevs(this.speed, this.revs, duration);
        }
    } else if (this.brakePressed) {
        this.speed -= this.calculateBrakingSpeedDecrement(duration);
        this.speed = util.constrain(this.speed, 0, this.maxSpeed);
        this.revs = this.gearbox.speedToRevs(this.speed, this.revs, duration);
    } else {
        this.speed -= this.calculateNaturalSpeedDecrement(duration);
        this.speed = util.constrain(this.speed, 0, this.maxSpeed);
        this.revs = this.gearbox.speedToRevs(this.speed, this.revs, duration);
    }

    this.gearbox.update(duration, this.speed, this.revs);

    this.speedometer.setValue(this.speed);
    this.tachometer.setValue(this.revs);
}

Car.prototype.calculateRevsIncrement = function (duration) {
    let maxIncrement = duration * 4;
    let factor = 1.0;

    // factor in the engine torque curve
    if (this.revs < 1400) {
        factor = 0.6;
    } else if (this.revs < 4000) {
        factor = 0.8;
    } else if (this.revs < 6000) {
        factor = 1.0;
    } else {
        factor = 0.7;
    }

    // factor in the gear
    factor *= this.gearbox.revsIncrementFactor();

    return maxIncrement * factor;
};

Car.prototype.calculateBrakingSpeedDecrement = function (duration) {
    return duration / 25;
}

Car.prototype.calculateNaturalSpeedDecrement = function (duration) {
    let minDecrement = duration / 350;
    let factor = 1.0;

    // factor in the air resistance
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

    // TODO factor in the gear?

    return minDecrement * factor;
}


export default Car;