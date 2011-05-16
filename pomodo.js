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
        this.timerID = setInterval(this.onCountDown.bind(this), this.interval);
    }
}

CountdownTimer.prototype.stop = function () {
    if (this.timerID) {
        clearInterval(this.timerID);
        this.timerID = null;
        this.remaining = null;
    }
}

CountdownTimer.prototype.onCountDown = function () {
    if (this.isTimeUp()) {
        this.stop();
        this.onTimeUp();
    } else {
        this.onInterval(this.update())
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
