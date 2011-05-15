function Pomodo() {
    //initial = 25 * 60 * 1000;
    initial = 5000;
    this.remaining = new Date(initial).getTime();
}

Pomodo.prototype.tick = function () {
    this.remaining -= 1000;
    var d = new Date(this.remaining);
    return d.getMinutes() + ':' + d.getSeconds();
}

Pomodo.prototype.isTimeUp = function () {
    return ((this.remaining - 1000) <= 0);
}

updateClock = function (timer) {
    if (timer.pomodo.isTimeUp()) {
        timer.stop();
        timer.onTimeUp();
    } else {
        timer.onInterval(timer.pomodo.tick())
    }
}

function ClockTimer(callbacks) {
    this.onTimeUp = callbacks.onTimeUp;
    this.onInterval = callbacks.onInterval;
    this.timerID = null;
}

ClockTimer.prototype.interval = 1000;

ClockTimer.prototype.start = function () {
    if (!this.timerID) {
        this.pomodo = new Pomodo();
        this.timerID = setInterval(updateClock, this.interval, this);
    }
}

ClockTimer.prototype.stop = function () {
    if (this.timerID) {
        clearInterval(this.timerID);
        this.pomodo = null;
    }
}

