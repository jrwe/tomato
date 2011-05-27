var makeTodoListModel = function () {
    var todos = [];
    var nextTodoId = 1;

    var onAppend, onComplete;

    var append = function (attrs) {
        todos.push({
            description: attrs.description,
            estimated_tomato: attrs.estimated_tomato,
            used_tomato: 0,
            completed: false,
            id: makeTodoId()
        });
        //onAppend();
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
        //onComplete();
    };

    var remove = function (id) {
        todo = getById(id);
        todos.splice(todo.index, 1);
    };

    var fetch = function () {
        return todos;
    };

    var makeTodoId = function () {
        return nextTodoId++;
    }

    return {
        append: append,
        getById: getById,
        markAsCompleted: markAsCompleted,
        remove: remove,
        fetch: fetch
    }
}

