var socket = io();

var main = function (toDoObjects) {
    "use strict";
    console.log("SANITY CHECK");

    var toDos = toDoObjects.map(function (toDo) {
          // we'll just return the description
          // of this toDoObject
          return toDo.description;
    });
    socket.on("todo", function(todo){
        var contentTag = $("main .content").attr("id"), $content, $tag, $tagName;

            toDoObjects.push(todo);
            toDos.push(todo.description);

            if(contentTag === "byNewest"){

                $content = $("<li>").text(todo.description).hide();

                $("#byNewest ul").prepend($content);
                $content.slideDown("slow");

            } else if (contentTag === "byOldest"){

                $content = $("<li>").text(todo.description).hide();

                $("#byOldest ul").append($content);
                $content.slideDown("slow");

            } else if ( contentTag === "byTags"){
                
                todo.tags.forEach(function(tag){
                    $tag = $("#byTags #tag-"+tag);
                    if($tag.attr("id")){
                        $content = $("<li>").text(todo.description).hide();

                        $tag.append($content);
                        $content.slideDown("slow");
                    }
                    else{
                        $tagName = $("<h3>").text(tag).hide();
                        $content = $("<ul>").attr("id", "tag-"+tag);

                        $content.append($("<li>").text(todo.description)).hide();

                        $("#byTags").append($tagName);
                        $("#byTags").append($content);
                        $tagName.slideDown("slow");
                        $content.slideDown("slow");
                    }
                });
            }            
    });
    $(".tabs a span").toArray().forEach(function (element) {
        var $element = $(element);

        // create a click handler for this element
        $element.on("click", function () {
            var $content,
                $input,
                $button,
                i;

            $(".tabs a span").removeClass("active");
            $element.addClass("active");
            $("main .content").empty();

            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<ul>");

                $("main .content").attr("id","byNewest");

                for (i = toDos.length-1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                }
            } else if ($element.parent().is(":nth-child(2)")) {
                $content = $("<ul>");

                $("main .content").attr("id","byOldest");

                toDos.forEach(function (todo) {
                    $content.append($("<li>").text(todo));
                });

            } else if ($element.parent().is(":nth-child(3)")) {
                var tags = [];

                toDoObjects.forEach(function (toDo) {
                    toDo.tags.forEach(function (tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });
                console.log(tags);

                var tagObjects = tags.map(function (tag) {
                    var toDosWithTag = [];

                    toDoObjects.forEach(function (toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return { "name": tag, "toDos": toDosWithTag };
                });

                console.log(tagObjects);

                $("main .content").attr("id", "byTags");

                tagObjects.forEach(function (tag) {
                    var $tagName = $("<h3>").text(tag.name),
                        $content = $("<ul>").attr("id", "tag-"+tag.name);


                    tag.toDos.forEach(function (description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $("main .content").append($tagName);
                    $("main .content").append($content);
                });

            } else if ($element.parent().is(":nth-child(4)")) {
                var $input = $("<input>").addClass("description"),
                    $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: "),
                    $button = $("<span>").text("+");

                $("main .content").attr("id", "adding");

                $button.on("click", function () {
                    var description = $input.val(),
                        tags = $tagInput.val().split(","),
                        newToDo = {"description":description, "tags":tags};

                    socket.emit('todo', newToDo);

                    socket.on("return from todos", function (result) {
                        console.log(result);
                        
                        toDoObjects = result;

                        // update toDos
                        toDos = toDoObjects.map(function (toDo) {
                            return toDo.description;
                        });

                        $input.val("");
                        $tagInput.val("");
                    });
                });

                $content = $("<div>").append($inputLabel)
                                     .append($input)
                                     .append($tagLabel)
                                     .append($tagInput)
                                     .append($button);
            }

            $("main .content").append($content);

            return false;
        });
    });

    $(".tabs a:first-child span").trigger("click");
};

$(document).ready(function () {
    $.getJSON("todos.json", function (toDoObjects) {
        main(toDoObjects);
    });
});
