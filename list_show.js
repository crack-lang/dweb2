
angular.module("list_show", [])
    .controller("list_show_controller", function($scope, $http) {

        $scope.matches = [];
        $scope.selection = -1;

        $http.get('/list/get?name=mainlist')
            .then(function(response) {
                $scope.main = response.data;

                // Translate item.flags & FLAG_SELECTED to item.selected.
                for (var i = 0; i < $scope.main.items.length; ++i) {
                    var item = $scope.main.items[i];
                    if (item.flags & FLAG_SELECTED)
                        item.selected = true;
                }
            });

        $http.get('/list/get?name=template')
            .then(function(response) {
                $scope.template = response.data;
            });

        $scope.entryChanged = function() {
            $scope.matches = [];
            $scope.selection = -1;
            if ($scope.text != '') {
                for (var i = 0; i < $scope.template.items.length; ++i) {
                    var item = $scope.template.items[i];
                    if (item.name.includes($scope.text))
                        $scope.matches.push(item);
                }
            }
        };

        function getSelection() {
            if ($scope.selection > -1)
                return $scope.matches[$scope.selection];
            else
                return null;
        }

        function clearMatches() {
            $scope.matches = [];
            $scope.selection = -1;
        }

        function clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        var FLAG_SELECTED = 1;

        $scope.specialKeys = function(event) {
            if (event.keyCode == 9 && $scope.matches.length > 0) {
                event.preventDefault();
                var item;
                // If there is a current selection, use the current selection.
                var item = getSelection();
                if (item == null)
                    item = $scope.matches[0];

                $scope.text = item.name;
                clearMatches();
                event.preventDefault();
            } else if (event.keyCode == 38) {
                // Up arrow.
                event.preventDefault();
                var item = getSelection();
                if (item != null)
                    item.selected = false;
                if ($scope.selection > 0) {
                    $scope.selection -= 1;
                }
                item = getSelection();
                $scope.text = item.name;
                item.selected = true;
            } else if (event.keyCode == 40) {
                // Down arrow.
                event.preventDefault();
                var item = getSelection();
                if (item != null)
                    item.selected = false;
                if ($scope.selection < $scope.matches.length - 1) {
                    $scope.selection += 1;
                }
                item = getSelection();
                $scope.text = item.name;
                item.selected = true;
                return false;
            } else if (event.keyCode == 13) {
                // Enter.
                event.preventDefault();

                // Try to find the text or quit.
                var item;
                var i;
                for (i = 0; i < $scope.template.items.length; ++i) {
                    item = $scope.template.items[i];
                    if (item.name == $scope.text)
                        break;
                }
                if (i == $scope.template.items.length)
                    return false;

                $scope.main.items.push(clone(item))
                clearMatches();
                $scope.text = '';
                return false;
                // XXX insert into the main list.
            }
        };

        $scope.saveList = function(event) {

            // Translate the "selected" flag on the item to FLAG_SELECTED in
            // the flags.
            for (var i = 0; i < $scope.main.items.length; ++i) {
                var item = $scope.main.items[i];
                item.flags = item.selected ? FLAG_SELECTED : 0;
            }

            $http.put('/list/put?name=mainlist', $scope.main)
                .then(function() {
                      alert('List saved.');
                });
        };

        $scope.clearList = function(event) {
            $scope.main.items = [];
            $scope.saveList();
        };

        $scope.expandTemplate = function(event) {
            var curItems = $scope.main.items;

            function inCurItems(name) {
                for (var i = 0; i < curItems.length; ++i) {
                    if (curItems[i].name == name)
                        return true;
                }
                return false;
            }

            // copy everything from the template that is either marked as
            // selected in the template or explicitly selected in the user's
            // list.
            $scope.main.items = [];
            for (var i = 0; i < $scope.template.items.length; ++i) {
                var item = $scope.template.items[i];
                if (item.flags & FLAG_SELECTED || inCurItems(item.name)) {
                    item = clone(item);
                    item.selected = false;
                    $scope.main.items.push(item);
                }
            }

            $scope.saveList();
        };

        $scope.removeUnselected = function(event) {
            var curItems = $scope.main.items;
            $scope.main.items = [];
            for (var i = 0; i < curItems.length; ++i) {
                var item = curItems[i];
                if (item.selected)
                    $scope.main.items.push(item);
                item.selected = false;
            }

            $scope.saveList();
        }
    });
