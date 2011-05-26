function minutesToMillsecs(minutes) {
    return minutes * 60 * 1000;
}

var makeTomatoModel = function (opts) {
    var atBreak = false;
    var timerID = null;

    const interval = 1000;
    const tomatoDuration = minutesToMillsecs(0.1);
    const shortBreakDuration = minutesToMillsecs(0.1);
    const longBreakDuration = minutesToMillsecs(0.2);

    var remaining, currentDuration;
    var breakCount = 0;
    var tomatoCount = 0;

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

    var isAtBreak = function () { return atBreak; };

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
            if (!isAtBreak()) { tomatoCount++; }

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
            currentDuration = tomatoDuration;
        }
    };

    setCurrentDuration();
    remaining = currentDuration;

    return {
        startClock: startClock,
        stopClock: stopClock,
        getTimeText: getTimeText,
        isAtBreak: isAtBreak,
        getBreakCount: function () { return breakCount; },
        getTomatoCount: function () { return tomatoCount; },
        setCallbacks: setCallbacks
    };
}

var makeTomatoWidget = function (initialModel, alarmElement) {
    var model = initialModel;
    var rootElement = $('<div></div>');
    var alarm = alarmElement;
    var clockPanel, startButton, stopButton, stopRingButton, countsPanel;
    var firstTime = true;

    var render = function () {
        renderClock();
        renderButtons();
        renderCounts();
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
            switchEnabled();
        });

        stopButton = $('<button>Stop</button>');
        stopButton.attr('disabled', 'disabled');
        stopButton.click(function () {
            model.stopClock(true);
            switchEnabled();
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

    var renderCounts = function () {
        if (firstTime) {
            countsPanel = $('<p></p>', {id: 'counts'});
            rootElement.append(countsPanel);
        }
        countsPanel.text('Tomato: ' + model.getTomatoCount() + ' Break: ' + model.getBreakCount());
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
        renderCounts();
        alarm.play();
        switchEnabled();
        stopRingButton.show();
    };

    var toggleEnabled = function (obj) {
        disabled = obj.attr('disabled');
        new_attr = disabled ? null : 'disabled';
        obj.attr('disabled', new_attr);
    };

    var switchEnabled = function () {
        toggleEnabled(startButton);
        toggleEnabled(stopButton);
    };

    model.setCallbacks({onTimeChange: onTimeChange, onTimeUp: onTimeUp});

    return {
        render: render
    };
}
