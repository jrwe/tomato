function minutesToMillsecs(minutes) {
    return minutes * 60 * 1000;
}

// A generic observable subject class that is useful in model creation.
// from http://peter.michaux.ca/examples/clocks/mvc-clock
var makeObservableSubject = function() {
    var observers = [];
    
    var addObserver = function(o) {
        if (typeof o !== 'function') {
            throw new Error('observer must be a function');
        }
        for (var i = 0, ilen = observers.length; i < ilen; i++) {
            var observer = observers[i];

            if (observer === o) {
                throw new Error('observer already in the list');
            }
        }
        observers.push(o);
    };
    
    var removeObserver = function(o) {
        for (var i = 0, ilen = observers.length; i < ilen; i++) {
            var observer = observers[i];

            if (observer === o) {
                observers.splice(i, 1);
                return;
            }
        }
        throw new Error('could not find observer in list of observers');
    };
    
    var notifyObservers = function(data) {
        // Make a copy of observer list in case the list
        // is mutated during the notifications.
        var observersSnapshot = observers.slice(0);
        for (var i = 0, ilen = observersSnapshot.length; i < ilen; i++) {
            observersSnapshot[i](data);
        }
    };
    
    return {
        addObserver: addObserver,
        removeObserver: removeObserver,
        notifyObservers: notifyObservers
    };
};

var makeTomatoModel = function () {
    var atBreak = false;
    var timerID = null;

    const interval = 1000;
    const workDuration = minutesToMillsecs(0.1);
    const shortBreakDuration = minutesToMillsecs(0.1);
    const longBreakDuration = minutesToMillsecs(0.2);

    var remaining, currentDuration;
    var breakCount = 0;

    var timeChangeObservableSubject = makeObservableSubject();
    var notifyTimeChangeObservers = timeChangeObservableSubject.notifyObservers;

    var timeUpObservableSubject = makeObservableSubject();
    var notifyTimeUpObservers = timeUpObservableSubject.notifyObservers;

    var startClock = function () {
        if (!timerID) {
            setCurrentDuration();
            remaining = currentDuration;
            notifyTimeChangeObservers();
            timerID = setInterval(onInterval, interval);
        }
    };

    var stopClock = function (reset) {
        if (timerID) {
            clearInterval(timerID);
            timerID = null;

            if (reset) {
                remaining = currentDuration;
                notifyTimeChangeObservers();
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

    var onInterval = function () {
        remaining -= interval;

        if (remaining <= 0) {
            atBreak = !atBreak;
            stopClock(false);
            notifyTimeUpObservers();
        } else {
            notifyTimeChangeObservers();
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
        addTimeChangeObserver: timeChangeObservableSubject.addObserver,
        addTimeUpObserver: timeUpObservableSubject.addObserver
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

    timeChangeObserver = function () {
        renderClock();
    };

    timeUpObserver = function () {
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

    model.addTimeChangeObserver(timeChangeObserver);
    model.addTimeUpObserver(timeUpObserver);

    return {
        render: render
    };
}
