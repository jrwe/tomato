function CountDownTimer(callbacks) {
    this.onTimeUp = callbacks.onTimeUp;
    this.onInterval = callbacks.onInterval;
    this.timerID = null;
}

CountDownTimer.prototype.interval = 1000;
CountDownTimer.prototype.duration = 5000;

CountDownTimer.prototype.start = function () {
    if (!this.timerID) {
        this.remaining = new Date(this.duration).getTime();
        this.timerID = setInterval(this.onCountDown.bind(this), this.interval);
    }
}

CountDownTimer.prototype.stop = function () {
    if (this.timerID) {
        clearInterval(this.timerID);
        this.timerID = null;
        this.remaining = null;
    }
}

CountDownTimer.prototype.onCountDown = function () {
    if (this.isTimeUp()) {
        this.stop();
        this.onTimeUp();
    } else {
        this.onInterval(this.update())
    }
}

CountDownTimer.prototype.update = function () {
    this.remaining -= 1000;
    var d = new Date(this.remaining);
    return d.getMinutes() + ':' + d.getSeconds();
}

CountDownTimer.prototype.isTimeUp = function () {
    return ((this.remaining - 1000) <= 0);
}
