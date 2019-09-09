function Meter(start, stop, step, x ,y, r) {
    this.WIDTH = r;
    this.HEIGHT = r;
    this.numbers = [];
    this.ox = x;
    this.oy = y;
    this.currentValue = 0;
    this.digitalDisplay = false;
    while(start <= stop) {
        this.numbers.push(start);
        start += step;
    }
    if ((stop - start) % step != 0) {
        this.numbers.push(stop);
    }
};

Meter.prototype.draw = function() {

    // the arc
    strokeWeight(1);
    stroke(0);
    arc(this.ox, this.oy, this.WIDTH, this.HEIGHT, PI, 0, OPEN);
    if (this.digitalDisplay) {
        fill(255);
        textSize(26);
        text(Math.floor(this.currentValue), this.ox, this.oy*0.5);
    }
    fill(0);
    rect(this.ox - this.WIDTH/2, this.oy, this.WIDTH, this.HEIGHT / 10);

    // the scale
    for (let i = 0; i < this.numbers.length; i++) {
        let angle = PI * this.numbers[i] / this.maxValue();
        let {x, y} = this.coords(angle, 0.8);
        textSize(12);
        fill(255);
        textAlign(CENTER);
        text(this.numbers[i], x, y);
    }

    // pointer
    {
        let angle = PI * this.currentValue / this.maxValue();
        stroke(255, 0, 0);
        strokeWeight(3)
        let {x, y} = this.coords(angle, 0.78);
        line(this.ox, this.oy, x, y);
        fill(0);
        circle(this.ox, this.oy, 20);
    }
};

Meter.prototype.maxValue = function() {
    return this.numbers[this.numbers.length - 1];
};

Meter.prototype.coords = function(angle, rcoeff) {
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

Meter.prototype.setValue = function(val) {
    this.currentValue = val;
};

Meter.prototype.setDigitalDisplay = function(onoff) {
    this.digitalDisplay = onoff;
};

let screenDimensions = {};

const maxSpeed = 298;
const maxRevs = 9;
let speedometer;
let revmeter;
speed = 0;
revs = 0;
let accelPressed = false;
let brakePressed = false;


function setup() {
    screenDimensions.width = displayWidth;
    screenDimensions.height = displayHeight;
    let cv = createCanvas(displayWidth, displayHeight/2);
    cv.parent("meters");
    speedometer = new Meter(0, maxSpeed, 20, width * 0.24, width * 0.21, width * 0.44);
    speedometer.setDigitalDisplay(true);
    revmeter = new Meter(0, maxRevs, 1, width * 0.76, width * 0.21, width * 0.44);
}

function draw() {
    if (accelPressed) {
        speed += acceleration();
    } else if (brakePressed) {
        speed -= 2;
    } else {
        speed -= 0.12;
    }
    speed = Math.max(speed, 0);
    speed = Math.min(speed, maxSpeed);

    revs = speed / maxSpeed;
    revs = Math.min(revs * maxRevs);

    speedometer.setValue(speed);
    revmeter.setValue(revs);
    speedometer.draw();
    revmeter.draw();
}

function acceleration() {
    let accel = 1;
    let factor = 1;
    if (speed < 50) {
    } else if (speed < 100) {
        factor = 0.8;
    } else if (speed < 140) {
        factor = 0.6;
    } else if (speed < 200) {
        factor = 0.4;
    } else {
        factor = 0.3;
    }
    return accel * factor;
}

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
};
