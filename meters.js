const util = {
    constrain: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    }
};

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

function Meter(config, parentId) {
    this.config = config;
    const m = this;
    new p5(s => {
        s.setup = () => {
            let e = document.getElementById(parentId);
            let rect = e.getBoundingClientRect();
            s.createCanvas(rect.width, rect.width);
        }
        s.draw = () => {
            m.draw(s);
        }
        s.windowResized = () => {
            const rect = document.getElementById(parentId).getBoundingClientRect();
            s.resizeCanvas(rect.width, rect.width);
        }
    }, parentId);

    this.currentValue = 0;
    this.digitalDisplay = false;
};

Meter.prototype.draw = function (s) {
    // the disc
    const { width: side } = s;
    const origin = { x: side / 2, y: side / 2 };
    s.strokeWeight(1);
    s.stroke(0);
    s.fill(0);
    s.circle(origin.x, origin.y, s.width * 0.97);

    if (this.digitalDisplay) {
        s.fill(255);
        s.textSize(26);
        s.text(Math.floor(this.currentValue), origin.x, origin.y * 0.5);
    }

    // the scale
    s.textSize(12);
    s.fill(255);
    s.textAlign(s.CENTER);
    let value = this.config.min;
    while (value <= this.config.max) {
        const label = this.config.displayTransform ? Math.round(this.config.displayTransform(value)).toString() : value.toString();
        const angle = this.angle(value, s);
        const { x, y } = this.coords(angle, 0.8, s);
        s.text(label, x, y);

        const anotherStepPossible = value < this.config.max;
        value += this.config.step;
        if (anotherStepPossible) {
            // even though we might have stepped above the max, let's limit it to the max and do one more turn
            // all of that is because of the lovely requirement to have the speed scale end at 298 kph :-D
            value = util.constrain(value, 0, this.config.max)
        }
    }

    // the pointer
    {
        const angle = this.angle(this.currentValue, s);
        s.stroke(255, 0, 0);
        s.strokeWeight(3)
        let { x, y } = this.coords(angle, 0.78, s);
        s.line(origin.x, origin.y, x, y);
        s.fill(0);
        s.circle(origin.x, origin.y, 20);
    }
};

Meter.prototype.maxValue = function () {
    return this.numbers[this.numbers.length - 1];
};

Meter.prototype.angle = function (value, sketch) {
    return sketch.map(value, this.config.min, this.config.max, this.config.minAngle, this.config.maxAngle);
}

Meter.prototype.coords = function (angle, rcoeff, sketch) {
    if (!rcoeff) {
        rcoeff = 1;
    }
    const r = sketch.width / 2 * rcoeff;
    const x = sketch.width / 2 + r * Math.cos(angle);
    const y = sketch.height / 2 + r * Math.sin(angle);

    return {
        x, y
    };
};

Meter.prototype.setValue = function (val) {
    this.currentValue = val;
};

Meter.prototype.setDigitalDisplay = function (onoff) {
    this.digitalDisplay = onoff;
};

window.onload = () => {
    const car = new Car();
    for (const event of ['mousedown', 'touchstart']) {
        document.querySelector("#accel").addEventListener(event, () => {
            car.pressAccelerate();
        });
        document.querySelector("#brake").addEventListener(event, () => {
            car.pressBrake();
        });
    }

    for (const event of ['mouseup', 'touchend', 'touchcancel']) {
        document.addEventListener(event, () => {
            car.releasePedals();
        });
    }

    const timerHandler = () => {
        car.update();
        setTimeout(timerHandler, 20);
    };

    timerHandler();
    /*
    window.addEventListener('resize', () => {
        console.log('window level resize event');
    })
    */    
};

