import Car from './car';

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

    let previousTime;
    const timerHandler = () => {
        const now = new Date().getTime();
        if (previousTime) {
            const duration = now - previousTime;
            car.update(duration);
        }
        previousTime = now;
        setTimeout(timerHandler, 20);
    };

    timerHandler();
};

