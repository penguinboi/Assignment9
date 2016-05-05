"use strict";

function ViewModel() {
    var self = this;
    var toDo_Objects = [];

    self.description = ko.observable();
    self.tag = ko.observable();

    self.tagObjects = ko.observableArray([]);

    self.toDoObjects = ko.observableArray([]);
    self.toDoTags = ko.observableArray([]);
    self.tabs = ko.observableArray([
        "Newest",
        "Oldest",
        "Tags",
        "Add"
    ]);
    self.selectedTab = ko.observable("Newest");

    function updateTags() {
        $("main .tags").text(" ");

        var tags = [];

        toDo_Objects.forEach(function(toDo) {
            toDo.tags.forEach(function(tag) {
                if (tags.indexOf(tag) === -1) {
                    tags.push(tag);
                }
            });
        });

        self.tagObjects = tags.map(function(tag) {
            var toDosWithTag = [];

            toDo_Objects.forEach(function(toDo) {
                if (toDo.tags.indexOf(tag) !== -1) {
                    toDosWithTag.push(toDo.description);
                }
            });

            return {
                "name": tag,
                "toDos": toDosWithTag
            };
        });

        self.tagObjects.forEach(function(tag) {
            var $tagName = $("<h3>").text(tag.name),
                $content = $("<ul id='tagList'>");


            tag.toDos.forEach(function(description) {
                var $li = $("<li>").text(description);
                $content.append($li);
            });

            $("main .tags").append($tagName);
            $("main .tags").append($content);
        });

        self.selectedTab("Newest");
    }

    self.loadJSON = function() {
        $.getJSON("todos.json", function(toDoObjects) {
            toDo_Objects = toDoObjects;
            updateTags();
            toDoObjects.forEach(function(todo) {
                self.toDoObjects.push(todo.description);
                self.toDoTags.push(todo.tags);
            });

        });
    };


    self.add = function() {
        var descri = this.description();
        var tagg = this.tag();
        var newToDo = {
            "description": this.description(),
            "tags": this.tag()
        };

        if (descri !== "" && tagg !== "") {
            $.post("todos", newToDo, function(result) {

                self.toDoObjects.push(descri);
                self.toDoTags.push(tagg);
                toDo_Objects = result;

                updateTags();
            });
            this.description("");
            this.tag("");
        }
    };

    self.isNewestSelected = ko.computed(function() {
        return self.selectedTab() === "Newest";
    });
    self.isOldestSelected = ko.computed(function() {
        return self.selectedTab() === "Oldest";
    });
    self.isTagsSelected = ko.computed(function() {

        return self.selectedTab() === "Tags";
    });
    self.isAddSelected = ko.computed(function() {
        return self.selectedTab() === "Add";
    });
    self.userClick = function(data) {
        self.selectedTab(data);
    };


}
var vm = new ViewModel();
ko.applyBindings(vm);
vm.loadJSON();