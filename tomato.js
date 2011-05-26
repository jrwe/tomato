function minutesToMillsecs(minutes) {
    return minutes * 60 * 1000;
}

var makeTomatoModel = function (opts) {
    var atBreak = false;
    var timerID = null;

    const interval = 1000;
    const workDuration = minutesToMillsecs(0.1);
    const shortBreakDuration = minutesToMillsecs(0.1);
    const longBreakDuration = minutesToMillsecs(0.2);

    var remaining, currentDuration;
    var breakCount = 0;

    var onTimeChange, onTimeUp;

    var startClock = function () {
        if (!timerID) {
            setCurrentDuration();
            remaining = currentDuration;
            onTimeChange();
            timerID = setInterval(onInterval, interval);
        }
    };

    var stopClock = function (reset) {
        if (timerID) {
            clearInterval(timerID);
            timerID = null;

            if (reset) {
                remaining = currentDuration;
                onTimeChange();
            }
        }
    };

    var isAtBreak = function () {
        return atBreak;
    };

    var getTimeText = function () {
        var date = new Date(remaining);
        var text = date.getMinutes() + ':' + date.getSeconds();
        return text;
    };

    var setCallbacks = function (callbacks) {
        onTimeChange = callbacks.onTimeChange;
        onTimeUp = callbacks.onTimeUp;
    };

    var onInterval = function () {
        remaining -= interval;

        if (remaining <= 0) {
            atBreak = !atBreak;
            stopClock(false);
            onTimeUp();
        } else {
            onTimeChange();
        }
    };

    var setCurrentDuration = function () {
        if (isAtBreak()) {
            breakCount++;
            currentDuration = (breakCount % 4 == 0) ? longBreakDuration : shortBreakDuration;
        } else {
            currentDuration = workDuration;
        }
    };

    setCurrentDuration();
    remaining = currentDuration;

    return {
        startClock: startClock,
        stopClock: stopClock,
        getTimeText: getTimeText,
        isAtBreak: isAtBreak,
        setCallbacks: setCallbacks
    };
}

var makeTomatoWidget = function (initialModel, alarmElement) {
    var model = initialModel;
    var rootElement = $('<div></div>');
    var alarm = alarmElement;
    var clockPanel, startButton, stopButton, stopRingButton;
    var firstTime = true;

    var render = function () {
        renderClock();
        renderButtons();
        rootElement.appendTo('body');
        firstTime = false;
    };

    var renderClock = function () {
        if (firstTime) {
            clockPanel = $('<p></p>', {id: 'clock'});
            rootElement.append(clockPanel);
        }
        clockPanel.text(model.getTimeText());
    };

    var renderButtons = function () {
        startButton = $('<button>Start</button>');
        startButton.click(function () {
            model.startClock();
            startButton.attr('disabled', 'disabled');
            stopButton.attr('disabled', null);
        });

        stopButton = $('<button>Stop</button>');
        stopButton.attr('disabled', 'disabled');
        stopButton.click(function () {
            model.stopClock(true);
            stopButton.attr('disabled', 'disabled');
            startButton.attr('disabled', null);
        });

        stopRingButton = $('<button>Stop Ring</button>');
        stopRingButton.css({display: 'none'});
        stopRingButton.click(function () {
            alarm.pause();
            alarm.currentTime = 0;
            stopRingButton.hide();
        });

        rootElement.append(startButton);
        rootElement.append(stopButton);
        rootElement.append(stopRingButton);
    };

    var onTimeChange = function () {
        renderClock();
    };

    var onTimeUp = function () {
        if (model.isAtBreak()) {
            startButton.text('Take a break');
        } else {
            startButton.text('Start');
        }
        clockPanel.html('<strong style="color: red;">0:00</strong>');
        alarm.play();
        stopButton.attr('disabled', 'disabled');
        startButton.attr('disabled', null);
        stopRingButton.show();
    };

    model.setCallbacks({onTimeChange: onTimeChange, onTimeUp: onTimeUp});

    return {
        render: render
    };
}
