const GEARS = 5;
const REVS_TO_SPEED_RATIOS = [120, 80, 48, 38, 30];

function Gearbox() {
    this.gear = 1;
    this.switch = null;
}

Gearbox.prototype.canShiftDown = function() {
    return this.gear > 1;
}

Gearbox.prototype.canShiftUp = function() {
    return this.gear < GEARS;
}

Gearbox.prototype.shiftUp = function() {
    if (this.canShiftUp()) {
        this.gear++;
    }
}

Gearbox.prototype.shiftDown = function() {
    if (this.canShiftDown()) {
        this.gear--;
    }
}

Gearbox.prototype.revsIncrementFactor = function() {
    return REVS_TO_SPEED_RATIOS[this.gear - 1] / REVS_TO_SPEED_RATIOS[0];
}

Gearbox.prototype.isSwitching = function() {
    return this.switch != null;
}

Gearbox.prototype.speedToRevs = function(speed) {
    return REVS_TO_SPEED_RATIOS[this.gear - 1] * speed;
}

Gearbox.prototype.revsToSpeed = function(revs) {
    return revs / REVS_TO_SPEED_RATIOS[this.gear - 1];
}

Gearbox.prototype.update = function(duration, speed, revs) {
    if (revs > 6000 && !this.isSwitching() && this.canShiftUp()) {
        this.shiftUp();
        this.switch = new GearSwitch(revs, this.speedToRevs(speed), speed, new Date().getTime());
    } else if (revs < 1500 && !this.isSwitching() && this.canShiftDown()) {
        this.shiftDown();
        this.switch = new GearSwitch(revs, this.speedToRevs(speed), speed, new Date().getTime());
    } else if (this.isSwitching() && this.switch.progress() >= 1) {
        this.switch = null;
    }
}

function GearSwitch(startRevs, targetRevs, speed, startTime) {
    this.startRevs = startRevs;
    this.startSpeed = speed;
    this.targetRevs = targetRevs;
    this.startTime = startTime;

    this.switchTime = 200; // ms
}

GearSwitch.prototype.revs = function() {
    return this.startRevs + this.progress() * (this.targetRevs - this.startRevs);
}

GearSwitch.prototype.speed = function() {
    return this.startSpeed * (1 + Math.sign(this.startRevs - this.targetRevs) * 0.05 * this.progress());
} 

GearSwitch.prototype.progress = function() {
    return Math.min((new Date().getTime() - this.startTime) / this.switchTime, 1.0);
}

export default Gearbox;

