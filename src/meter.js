import util from './util';

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
    s.textSize(side / 18);
    s.stroke(255);
    s.fill(255);
    s.textAlign(s.CENTER, s.CENTER);

    let previousValue;
    let value = this.config.min;
    while (value <= this.config.max) {
        const label = this.config.displayTransform ? Math.round(this.config.displayTransform(value)).toString() : value.toString();
        const angle = this.angle(value, s);
        const { x, y } = this.coords(angle, 0.74, s);
        s.strokeWeight(1);
        s.text(label, x, y);

        // thicker line at labelled steps
        s.strokeWeight(3);
        let { x: x1, y: y1 } = this.coords(angle, 0.86, s);
        let { x: x2, y: y2 } = this.coords(angle, 0.93, s);
        s.line(x1, y1, x2, y2);

        // thinner line between labelled steps
        if (previousValue !== undefined) {
            const interAngle = this.angle(previousValue + this.config.step / 2, s);
            s.strokeWeight(2);
            let { x: x1, y: y1 } = this.coords(interAngle, 0.89, s);
            let { x: x2, y: y2 } = this.coords(interAngle, 0.93, s);
            s.line(x1, y1, x2, y2);
        }

        const anotherStepPossible = value < this.config.max;

        previousValue = value;
        value += this.config.step;
        if (anotherStepPossible) {
            // even though we might have stepped above the max, let's limit it to the max and do one more turn
            // all of that is because of the lovely requirement to have the speed scale end at 298 kph :-D
            value = util.constrain(value, 0, this.config.max)
        }
    }

    // controls
    if (this.config.controls) {
        const CONTROL_SIZE = side / 12;
        const CONTROL_GAP = 4;
        const controls = this.config.controls.filter(c => c.on);
        const count = controls.length;
        const xsize = count * CONTROL_SIZE + (count - 1) * CONTROL_GAP;
        const x = origin.x - xsize / 2;
        for (const control of controls) {
            s.push();
            s.translate(x, origin.y + side / 4);
            control.draw(s, CONTROL_SIZE);
            s.pop();
        }
    }

    // the pointer
    {
        const angle = this.angle(this.currentValue, s);
        s.stroke(255, 0, 0);
        s.strokeWeight(3);
        s.fill('red');
        s.circle(origin.x, origin.y, 22);
        let tip = this.coords(angle, 0.9, s);
        let base1 = this.coords(angle + Math.PI / 2, 0.05, s);
        let base2 = this.coords(angle - Math.PI / 2, 0.05, s);
        s.triangle(base1.x, base1.y, tip.x, tip.y, base2.x, base2.y);
        s.fill(0);
        s.circle(origin.x, origin.y, 20);
    }
};

Meter.prototype.maxValue = function () {
    return this.numbers[this.numbers.length - 1];
};

Meter.prototype.angle = function (value, sketch) {
    return sketch.map(value, this.config.min, this.config.max, this.config.minAngle, this.config.maxAngle);
};

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

export default Meter;
