var makeTodoListModel = function () {
    var todos = [];
    var nextTodoId = 1;

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

    var getById = function (id) {
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id == id) {
                return {obj: todos[i], index: i};
            }
        }
        return null;
    };

    var markAsCompleted = function (id) {
        todo = getById(id);
        todo.obj.completed = true;
        onComplete();
    };

    var remove = function (id) {
        todo = getById(id);
        todos.splice(todo.index, 1);
    };

    var fetch = function () {
        return todos;
    };

    var setCallbacks = function (callbacks) {
        onAppend = callbacks.onAppend;
        onComplete = callbacks.onComplete;
    };

    var makeTodoId = function () {
        return nextTodoId++;
    };

    return {
        append: append,
        getById: getById,
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

    var renderItem = function (item) {
        var tr = ich.todoItem(item);

        $('input[type=radio]', tr).focus(function () {
            var todoId = $(this).attr('todoId');
        });

        $('button', tr).click(function () {
            tr.hide();
        });

        tableBody.append(tr);
    };

    model.setCallbacks({
        onAppend: function (item) { renderItem(item); },
        onComplete: function () {}
    });

    return {
        render: render
    };
};
