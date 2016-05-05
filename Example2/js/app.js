"use strict";

function ViewModel(allComments) {
    this.commentToAdd = ko.observable();
    this.allComments = ko.observableArray(allComments);

    this.addComment = function() {
        if (this.commentToAdd() !== "")
        {
            this.allComments.push(this.commentToAdd());
        }
        this.commentToAdd(""); // Clear the text box
    };
}

var vm = new ViewModel();
ko.applyBindings(vm);