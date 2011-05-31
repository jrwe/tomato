var makeTodoListModel = function (_tomatoModel) {
    var todos = [];
    var nextTodoId = 1;
    var tomatoModel = _tomatoModel;

    var onAppend, onComplete, onRemove;

    var append = function (attrs) {
        var item = {
            description: attrs.description,
            estimatedTomato: attrs.estimatedTomato,
            usedTomato: 0,
            completed: false,
            id: makeTodoId()
        };
        todos.push(item);
        onAppend(item);
    };

    var markAsCompleted = function (id) {
        var todo = getById(id);
        todo.obj.completed = true;
        tomatoModel.setCurrentTask(null, function () {});
        onComplete(id);
    };

    var remove = function (id) {
        var todo = getById(id);
        todos.splice(todo.index, 1);
        todo = null;
        // FIXME: should test if it is currentTask
        tomatoModel.setCurrentTask(null, function () {});
        onRemove(id);
    };

    var selectById = function (id) {
        var todo = getById(id);
        tomatoModel.setCurrentTask(
            todo.obj,
            function (prevItem) {
                onUpdate(prevItem);
            }
        );
    };

    var loadAll = function () {
        if (localStorage['todolist']) {
            todos = JSON.parse(localStorage['todolist']);
        }

        if (localStorage['nextTodoId']) {
            nextTodoId = localStorage['nextTodoId'];
        }

        return todos;
    };

    var getById = function (id) {
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id == id) {
                return {obj: todos[i], index: i};
            }
        }
        return null;
    };

    var setCallbacks = function (callbacks) {
        onAppend = callbacks.onAppend;
        onComplete = callbacks.onComplete;
        onRemove = callbacks.onRemove;
        onUpdate = callbacks.onUpdate;
    };

    var makeTodoId = function () {
        return nextTodoId++;
    };

    var sync = function () {
        localStorage['todolist'] = JSON.stringify(todos);
        localStorage['nextTodoId'] = nextTodoId;
    };

    return {
        append: append,
        selectById: selectById,
        markAsCompleted: markAsCompleted,
        remove: remove,
        loadAll: loadAll,
        sync: sync,
        setCallbacks: setCallbacks
    };
};

var makeTodoListWidget = function (opts) {
    var model = opts.model;
    var descriptionInput = opts.descriptionInput;
    var estimatedTomatoInput = opts.estimatedTomatoInput;
    var addTodoButton = opts.addTodoButton;
    var tableBody = opts.tableBody;

    var render = function () {
        addTodoButton.click(function() {
            model.append({
                description: descriptionInput.val(),
                estimatedTomato: estimatedTomatoInput.val()
            });
        });

        var todos = model.loadAll();
        for (var i = 0; i < todos.length; i++) {
            renderAppend(todos[i]);
        }
    };

    var renderAppend = function (item) {
        var tr = ich.todoItem(item);

        $('input[type=radio]', tr).click(function () {
            model.selectById(item.id);
        });

        $('.complete-button', tr).click(function () {
            model.markAsCompleted(item.id);
        });

        $('.remove-button', tr).click(function () {
            model.remove(item.id);
        });

        tableBody.append(tr);
    };

    var renderComplete = function (id) {
        var tr = $('#todo-' + id);
        $('.description', tr).css({textDecoration: 'line-through'});
    };

    var renderUpdate = function (item) {
        var tr = $('#todo-' + item.id);
        $('.used-tomato', tr).text(item.usedTomato);
    };

    var renderRemove = function (id) {
        $('#todo-' + id).remove();
    };

    model.setCallbacks({
        onAppend: renderAppend,
        onComplete: renderComplete,
        onRemove: renderRemove,
        onUpdate: renderUpdate
    });

    return {
        render: render
    };
};
