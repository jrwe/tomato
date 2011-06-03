var minutesToMillsecs = function (minutes) {
    return minutes * 60 * 1000;
};

const interval = 1000;
const tomatoDuration = minutesToMillsecs(0.3);
const shortBreakDuration = minutesToMillsecs(0.1);
const longBreakDuration = minutesToMillsecs(0.2);

var Tomato = Backbone.Model.extend({
    initialize: function (spec) {
        this.currentTask = null;
        this.tomatoCount = 0;
        this.breakCount = 0;
        this.atBreak = false;

        this.timerID = null;
        this.currentDuration = 0;
        this.remaining = 0;
        _.bindAll(this, 'onInterval');
    },

    startClock: function () {
        if (!this.timerID) {
            this.setCurrentDuration();
            this.remaining = this.currentDuration;
            this.trigger('clockStart');
            this.timerID = setInterval(this.onInterval, interval);
        }
    },

    onInterval: function () {
        this.remaining -= interval;
        if (this.remaining <= 0) {
            if (!this.isAtBreak()) {
                this.tomatoCount++;
                this.currentTask.save({usedTomato: this.tomatoCount});
            }

            this.atBreak = !this.atBreak;
            this.stopClock();
            this.trigger('timeUp');
        } else {
            this.trigger('timeChange');
        }
    },

    setCurrentDuration: function () {
        if (this.isAtBreak()) {
            this.breakCount++;
            this.currentDuration = (this.breakCount % 4 == 0) ? longBreakDuration : shortBreakDuration;
        } else {
            this.currentDuration = tomatoDuration;
        }
    },

    stopClock: function (reset) {
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null;
            this.trigger('clockStop');

            if (reset) {
                this.remaining = this.currentDuration;
            }
        }
    },

    isAtBreak: function () { return this.atBreak; },
    isStarted: function () { return this.timerID; },

    getTimeText: function () {
        var date = new Date(this.remaining);
        var text = date.getMinutes() + ':' + date.getSeconds();
        return text;
    },

    setCurrentTask: function (task) {
        this.currentTask = task;
        this.atBreak = false;
        this.stopClock();
        this.breakCount = 0;
        this.tomatoCount = task.usedTomato;
        this.trigger('taskChange');
    },
});

var TomatoView = Backbone.View.extend({
    initialize: function () {
        //_.bindAll(this, 'onClockStop', 'onClockStart', 'onTimeUp', 'render');
        _.bindAll(this,
            'render', 'onTimeUp', 'onClockStart',
            'onClockStop', 'onClockSwitchClick',
            'stopRing'
        );
        this.model.bind('taskChange', this.render);
        this.model.bind('timeChange', this.render);
        this.model.bind('timeUp', this.onTimeUp);
        this.model.bind('clockStart', this.onClockStart);
        this.model.bind('clockStop', this.onClockStop);

        this.clockSwitchLabel = 'Start Tomato';
    },

    render: function (opts) {
        if (!opts) {
            opts = {};
        }

        currentTask = this.model.currentTask;

        if (currentTask) {
            this.el.html(ich.clockContent({
                task: currentTask.get('description'),
                time: this.model.getTimeText(),
                usedTomato: currentTask.get('usedTomato'),
                estimatedTomato: currentTask.get('estimatedTomato'),
                isTimeUp: opts.isTimeUp,
                clockSwitchLabel: this.clockSwitchLabel,
            }));

            this.$('#clock-switch').click(this.onClockSwitchClick);
        } else {
            this.el.html(ich.clockContent({task: null}));
        }

        return this;
    },

    stopRing: function () {
        //this.ring.pause blah blah
        this.$('#ring-switch').remove();
    },

    onClockSwitchClick: function () {
        if (this.model.isStarted()) {
            this.model.stopClock(true);
        } else {
            this.model.startClock();
        }
    },

    onClockStart: function () {
        this.clockSwitchLabel = 'Stop';
        this.render();
    },

    onClockStop: function () {
        this.clockSwitchLabel = this.model.isAtBreak() ? 'Take a break' : 'Start Tomato';
        this.render();
    },

    onTimeUp: function () {
        this.render({isTimeUp: true});
        this.$('#ring-switch').click(this.stopRing);
    }
});
