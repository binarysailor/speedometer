function Car() {
    this.speed = 0;
    this.revs = 0;
    this.gear = 1;

    this.maxSpeed = 298;
    this.maxRevs = 8000;

    this.acceleratePressed = false;
    this.brakePressed = false;

    this.revs2speedRatio = 25;

    this.speedometer = new Meter(0, this.maxSpeed, 20, 0, 0, 0, "speedometer");
    this.tachometer = new Meter(0, this.maxRevs, 1, 0, 0, 0, "tachometer");

}

Car.prototype.pressAccelerate = () => {
    this.acceleratePressed = true;
};

Car.prototype.pressBrake = () => {
    this.brakePressed = true;
}

Car.prototype.releasePedals = () => {
    this.acceleratePressed = false;
    this.brakePressed = false;
}

Car.prototype.update = () => {
    if (this.acceleratePressed) {
        this.revs += this.calculateRevsIncrement();
        this.revs = Math.min(this.revs, this.maxRevs);
        this.revs2Speed();
    } else {
        if (this.brakePressed) {
            this.speed -= 2;
        } else {
            this.speed -= 0.12;
        }
        this.speed = Math.min(this.speed, this.maxSpeed);
        this.speed = Math.max(this.speed, 0);
        this.speed2Revs();
    } 
}

Car.prototype.calculateRevsIncrement = () => {
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

    } else if (speed < 120) {
        factor *= 0.8;
    } else if (speed < 150) {
        factor *= 0.7;
    } else if (speed < 200) {
        factor *= 0.6;
    } else {
        factor *= 0.5;
    }

    return maxIncrement * factor;
};

Car.prototype.speed2Revs = () => {
    return this.speed * this.revs2speedRatio;
}

Car.prototype.revs2Speed = () => {
    return this.revs / this.revs2speedRatio;
}

function Meter(start, stop, step, x, y, r, parentId) {
    const m = this;
    new p5(s => {
        s.setup = () => {
            let e = document.getElementById(parentId);
            let rect = e.getBoundingClientRect();
            s.createCanvas(rect.width, rect.height);
        }
        s.draw = () => {
            let ox = s.width / 2;
            let oy = s.height / 2;
            s.stroke(0);
            s.circle(ox, oy, Math.min(s.width, s.height));
        }
    }, parentId);


    this.WIDTH = r;
    this.HEIGHT = r;
    this.numbers = [];
    this.ox = x;
    this.oy = y;
    this.currentValue = 0;
    this.digitalDisplay = false;
    while (start <= stop) {
        this.numbers.push(start);
        start += step;
    }
    if ((stop - start) % step != 0) {
        this.numbers.push(stop);
    }

};

Meter.prototype.draw = function (s) {



    speedometer.setValue(speed);
    revmeter.setValue(revs);
    speedometer.draw();
    revmeter.draw();

    // the arc
    s.strokeWeight(1);
    s.stroke(0);
    s.arc(this.ox, this.oy, this.WIDTH, this.HEIGHT, PI, 0, OPEN);
    if (this.digitalDisplay) {
        s.fill(255);
        s.textSize(26);
        s.text(Math.floor(this.currentValue), this.ox, this.oy * 0.5);
    }
    s.fill(0);
    s.rect(this.ox - this.WIDTH / 2, this.oy, this.WIDTH, this.HEIGHT / 10);

    // the scale
    for (let i = 0; i < this.numbers.length; i++) {
        let angle = PI * this.numbers[i] / this.maxValue();
        let { x, y } = this.coords(angle, 0.8);
        s.textSize(12);
        s.fill(255);
        s.textAlign(CENTER);
        s.text(this.numbers[i], x, y);
    }

    // pointer
    {
        let angle = PI * this.currentValue / this.maxValue();
        s.stroke(255, 0, 0);
        s.strokeWeight(3)
        let { x, y } = this.coords(angle, 0.78);
        s.line(this.ox, this.oy, x, y);
        s.fill(0);
        s.circle(this.ox, this.oy, 20);
    }
};

Meter.prototype.maxValue = function () {
    return this.numbers[this.numbers.length - 1];
};

Meter.prototype.coords = function (angle, rcoeff) {
    if (!rcoeff) {
        rcoeff = 1;
    }
    const r = this.WIDTH / 2 * rcoeff;
    let x = this.ox - r * Math.cos(angle);
    let y = this.oy - r * Math.sin(angle);
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
    for (const event of ['mousedown', 'touchstart']) {
        document.querySelector("#accel").addEventListener(event, () => {
            accelPressed = true;
        });
        document.querySelector("#brake").addEventListener(event, () => {
            brakePressed = true;
        });
    }

    for (const event of ['mouseup', 'touchend', 'touchcancel']) {
        document.addEventListener(event, () => {
            accelPressed = false;
            brakePressed = false;
        });
    }

    new Car();
};
