var makeTodoListModel = function (tomatoModel) {
    var todos = [];
    var nextTodoId = 1;
    var tomatoModel = tomatoModel;

    var onAppend, onComplete;

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
        tomatoModel.setCurrentTask(null);
        onComplete(id);
    };

    var remove = function (id) {
        var todo = getById(id);
        todos.splice(todo.index, 1);
        todo = null;
        tomatoModel.setCurrentTask(null);
        onRemove(id);
    };

    var selectById = function (id) {
        var todo = getById(id);
        tomatoModel.setCurrentTask(todo.obj);
    };

    var fetch = function () {
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
    };

    var makeTodoId = function () {
        return nextTodoId++;
    };

    return {
        append: append,
        selectById: selectById,
        markAsCompleted: markAsCompleted,
        remove: remove,
        fetch: fetch,
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

    var renderRemove = function (id) {
        $('#todo-' + id).remove();
    };

    model.setCallbacks({
        onAppend: function (item) { renderAppend(item); },
        onComplete: function (id) { renderComplete(id); },
        onRemove: function (id) { renderRemove(id); }
    });

    return {
        render: render
    };
};
