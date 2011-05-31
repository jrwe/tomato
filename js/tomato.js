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
    var currentTask = null;

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

    var setCurrentTask = function (task, onUpdate) {
        if (currentTask) {
            currentTask.usedTomato = tomatoCount;
            onUpdate(currentTask);
        }
        currentTask = task;

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
        bindButtonEvents();
        renderCounts();
        renderTask(null);
    };

    var renderClock = function () {
        clockPanel.text(model.getTimeText());
    };

    var bindButtonEvents = function () {
        startButton.click(function () {
            model.startClock();
            setEnabled(startButton, false);
            setEnabled(stopButton, true);
        });

        stopButton.click(function () {
            model.stopClock(true);
            setEnabled(startButton, true);
            setEnabled(stopButton, false);
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
        renderButtons();
        setEnabled(startButton, true);
        setEnabled(stopButton, false);
        clockPanel.html('<strong style="color: red;">0:00</strong>');
        renderCounts();
        alarm.play();
    };

    var renderButtons = function () {
        if (model.isAtBreak()) {
            startButton.text('Take a break');
            stopRingButton.show();
        } else {
            startButton.text('Start');
        }
    };

    var renderTask = function (task) {
        renderButtons();
        if (task) {
            taskPanel.text(task.description);
            renderCounts();
            setEnabled(startButton, true);
            setEnabled(stopButton, false);
        } else {
            taskPanel.text('No task selected');
            setEnabled(startButton, false);
            setEnabled(stopButton, false);
        }
    };

    var setEnabled = function (obj, enabled) {
        obj.attr('disabled', enabled ? null : 'disabled');
    };

    model.setCallbacks({onTimeChange: renderClock, onTimeUp: onTimeUp, onTaskChange: renderTask});

    return {
        render: render
    };
};
