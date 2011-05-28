var minutesToMillsecs = function (minutes) {
    return minutes * 60 * 1000;
};

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

    var onTimeChange, onTimeUp, onTaskChange;

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

    var setCurrentTask = function (task) {
        atBreak = false;
        stopClock(true);
        breakCount = 0;

        if (task) {
            tomatoCount = task.usedTomato;
        }

        onTaskChange(task);
    };

    var setCallbacks = function (callbacks) {
        onTimeChange = callbacks.onTimeChange;
        onTimeUp = callbacks.onTimeUp;
        onTaskChange = callbacks.onTaskChange;
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
        setCurrentTask: setCurrentTask,
        setCallbacks: setCallbacks
    };
};

var makeTomatoWidget = function (opts) {
    var model = opts.model;
    var alarm = opts.alarm;
    var clockPanel = opts.clockPanel;
    var countsPanel = opts.countsPanel;
    var taskPanel = opts.taskPanel;
    var startButton = opts.startButton;
    var stopButton = opts.stopButton;
    var stopRingButton = opts.stopRingButton;

    var render = function () {
        renderClock();
        renderButtons();
        renderCounts();
        renderTask(null);
    };

    var renderClock = function () {
        clockPanel.text(model.getTimeText());
    };

    var renderButtons = function () {
        startButton.click(function () {
            model.startClock();
            switchEnabled();
        });

        stopButton.click(function () {
            model.stopClock(true);
            switchEnabled();
        });

        stopRingButton.click(function () {
            alarm.pause();
            alarm.currentTime = 0;
            stopRingButton.hide();
        });
    };

    var renderCounts = function () {
        countsPanel.text('Tomato: ' + model.getTomatoCount() + ' Break: ' + model.getBreakCount());
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

    var renderTask = function (task) {
        if (task) {
            taskPanel.text(task.description);
            renderCounts();
        } else {
            taskPanel.text('No task selected');
        }
    };

    var toggleEnabled = function (obj) {
        var disabled = obj.attr('disabled');
        var new_attr = disabled ? null : 'disabled';
        obj.attr('disabled', new_attr);
    };

    var switchEnabled = function () {
        toggleEnabled(startButton);
        toggleEnabled(stopButton);
    };

    model.setCallbacks({onTimeChange: renderClock, onTimeUp: onTimeUp, onTaskChange: renderTask});

    return {
        render: render
    };
};
