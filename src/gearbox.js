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

Gearbox.prototype.speedToRevs = function(speed, previousRevs, duration) {
    if (!this.isSwitching()) {
        return REVS_TO_SPEED_RATIOS[this.gear - 1] * speed;
    } else {
        let revs;
        if (this.switch.switchDirection > 0) {
            // switching gear up
            revs = previousRevs - this.switch.revsChangeRate * duration;
            const targetGearRatio = REVS_TO_SPEED_RATIOS[this.gear - 1];
            if (revs / targetGearRatio <= speed) {
                // the switch is over
                revs = speed * targetGearRatio;
                this.switch = null;
            }
        } else {
            // switching gear down
            revs = previousRevs + this.switch.revsChangeRate * duration;
            const targetGearRatio = REVS_TO_SPEED_RATIOS[this.gear - 1];
            if (revs / targetGearRatio >= speed) {
                // the switch is over
                revs = speed * targetGearRatio;
                this.switch = null;
            }
        }
        return revs;
    }
}

Gearbox.prototype.revsToSpeed = function(revs) {
    return revs / REVS_TO_SPEED_RATIOS[this.gear - 1];
}

Gearbox.prototype.update = function(duration, speed, revs) {
    if (revs > 6000 && !this.isSwitching() && this.canShiftUp()) {
        this.shiftUp();
        this.switch = new GearSwitch(revs, REVS_TO_SPEED_RATIOS[this.gear - 1] * speed);
    } else if (revs < 1500 && !this.isSwitching() && this.canShiftDown()) {
        this.shiftDown();
        this.switch = new GearSwitch(revs, REVS_TO_SPEED_RATIOS[this.gear - 1] * speed);
    }
}

function GearSwitch(startRevs, targetRevs) {
    const switchTime = 200; // ms

    this.startRevs = startRevs;
    this.revsChangeRate = Math.abs(startRevs - targetRevs) / switchTime;
    this.switchDirection = Math.sign(startRevs - targetRevs);
}

export default Gearbox;
