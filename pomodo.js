// helper functions
function toggleEnabled(target) {
    obj = (target.attr == undefined) ? $(target) : target;
    new_attr = (obj.attr('disabled') == null) ? 'disabled' : null;
    obj.attr('disabled', new_attr);
}
//------------------------------------

function CountDownTimer(callbacks) {
    this.onTimeUp = callbacks.onTimeUp;
    this.onInterval = callbacks.onInterval;
    this.timerID = null;
}

CountDownTimer.prototype.interval = 1000;
CountDownTimer.prototype.duration = 5000;

CountDownTimer.prototype.start = function () {
    if (!this.timerID) {
        //this.remaining = new Date(this.duration).getTime();
        this.remaining = this.duration;
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
    //var d = new Date(this.remaining);
    return this.remaining;
    //return d.getMinutes() + ':' + d.getSeconds();
}

CountDownTimer.prototype.isTimeUp = function () {
    return ((this.remaining - 1000) <= 0);
}


function Clock(controls) {
    this.panel = $(controls.panelID);
    this.alarm = document.getElementById(controls.alarmID); // the '$' doesn't work for it.
}

Clock.prototype.render = function (currentTime) {
    if (currentTime == 0) {
        this.panel.html('<strong style="color: red;">0:00</strong>');
    } else {
        var date = new Date(currentTime);
        var text = date.getMinutes() + ':' + date.getSeconds();
        this.panel.text(text);
    }
}

Clock.prototype.reset = function () {
    this.panel.text('25:00');
}

Clock.prototype.ring = function () {
    this.alarm.play();
}

Clock.prototype.stopRing  = function () {
    this.alarm.pause();
    this.alarm.currentTime = 0;
}
