onCountDown = function (timer) {
    if (timer.isTimeUp()) {
        timer.stop();
        timer.onTimeUp();
    } else {
        timer.onInterval(timer.update())
    }
}

function CountdownTimer(callbacks) {
    this.onTimeUp = callbacks.onTimeUp;
    this.onInterval = callbacks.onInterval;
    this.timerID = null;
}

CountdownTimer.prototype.interval = 1000;
CountdownTimer.prototype.duration = 5000;

CountdownTimer.prototype.start = function () {
    if (!this.timerID) {
        this.remaining = new Date(this.duration).getTime();
        this.timerID = setInterval(onCountDown, this.interval, this);
    }
}

CountdownTimer.prototype.stop = function () {
    if (this.timerID) {
        clearInterval(this.timerID);
        this.remaining = null;
    }
}

CountdownTimer.prototype.update = function () {
    this.remaining -= 1000;
    var d = new Date(this.remaining);
    return d.getMinutes() + ':' + d.getSeconds();
}

CountdownTimer.prototype.isTimeUp = function () {
    return ((this.remaining - 1000) <= 0);
}
