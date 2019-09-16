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
    if (revs > 6000 && this.canShiftUp()) {
        this.shiftUp();
    }
}

export default Gearbox;
