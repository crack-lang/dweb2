angular.module("template_edit", [])
    .controller("template_edit_controller", function($scope, $http) {

        var FLAG_SELECTED = 1;

        $scope.gotSelections = false;

        $http.get(PREFIX + '/list/get?name=template')
            .then(function(response) {
                $scope.main = response.data;

                // Select all items with flag = selected.
                for (var i = 0; i < $scope.main.items.length; ++i) {
                    var item = $scope.main.items[i];
                    item.selected = false;
                    item.defaulted = (item.flags & FLAG_SELECTED) ? true :
                                                                    false;
                }
            });

        function findItemIndexIn(items, itemName) {
            var items = items;
            for (var i = 0; i < items.length; ++i) {
                if (items[i].name == itemName)
                    return i;
            }

            return -1;
        }

        function findItemIndex(itemName) {
            return findItemIndexIn($scope.main.items, itemName);
        }

        // Returns {selected: [...], unselected: [...]}
        function separateSelections() {
            var newItems = [];
            var selections = [];
            var items = $scope.main.items;
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                if (item.selected)
                    selections.push(item);
                else
                    newItems.push(item);
            }
            return {'selected': selections, 'unselected': newItems};
        }

        // Move all of the selections below or above the named item.  "offset"
        // is the position we insert into relative to the position of the
        // named item, use 0 to insert directly above, 1 to insert directly
        // below.
        function moveSelections(itemName, offset) {
            // Make sure that the item we're adding aboce/below is not selected.
            var index = findItemIndex(itemName);
            $scope.main.items[index].selected = false;

            var partition = separateSelections();
            var index = findItemIndexIn(partition.unselected, itemName);
            for (var i = 0; i < partition.selected.length; ++i)
                partition.unselected.splice(index + offset + i, 0,
                                            partition.selected[i]
                                            );
            $scope.main.items = partition.unselected;
            $scope.clearSelections();
        }

        // Up and down move the item if there are no selections and move the
        // selected items above or below if there are.

        $scope.upItem = function(itemName) {
            if ($scope.gotSelections) {
                moveSelections(itemName, 0);
                return;
            }
            var items = $scope.main.items;
            var index = findItemIndex(itemName);
            var item = items[index];
            if (index > 0) {
                var tmp = items[index - 1];
                items[index - 1] = item;
                items[index] = tmp;
            }
        };

        $scope.downItem = function(itemName) {
            if ($scope.gotSelections) {
                moveSelections(itemName, 1);
                return;
            }
            var items = $scope.main.items;
            var index = findItemIndex(itemName);
            var item = items[index];
            if (index < items.length - 2) {
                var tmp = items[index + 1];
                items[index + 1] = item;
                items[index] = tmp;
            }
        };

        // Refactor into common module.
        function filterAndSave(predicate) {
            var curItems = $scope.main.items;
            $scope.main.items = [];
            for (var i = 0; i < curItems.length; ++i) {
                var item = curItems[i];
                if (predicate(item))
                    $scope.main.items.push(item);
                item.selected = false;
            }

            $scope.saveList();
        }

        $scope.removeSelected = function() {
            filterAndSave(function(item) { return !item.selected});
        }

        $scope.specialKeys = function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();

                // Make sure we don't have one already.
                var item;
                var i;
                var items = $scope.main.items;
                for (i = 0; i < items; ++i) {
                    if (item.name == $scope.text) {
                        alert('Item ' + item.name + ' already defined');
                        return;
                    }
                }

                // Add it to the beginning of the list.
                items.unshift({'name': $scope.text,
                               'order': null,
                               'qty': null,
                               'units': null,
                               'flags': 0
                               }
                              );

                // Clear the entryfield.
                $scope.text = '';
            }
        }

        $scope.saveList = function(event) {

            // Translate the "defaulted" flag on the item to FLAG_SELECTED in
            // the flags.
            for (var i = 0; i < $scope.main.items.length; ++i) {
                var item = $scope.main.items[i];
                item.flags = item.defaulted ? FLAG_SELECTED : 0;
            }

            $http.put(PREFIX + '/list/put?name=template', $scope.main)
                .then(function() {
                      alert('List saved.');
                });
        };

        $scope.checkForSelections = function(event) {
            for (var i = 0; i < $scope.main.items.length; ++i) {
                if ($scope.main.items[i].selected)
                    return true;
            }
            return false;
        };

        $scope.clearSelections = function(event) {
            for (var i = 0; i < $scope.main.items.length; ++i)
                $scope.main.items[i].selected = false;
            $scope.gotSelections = false;
        };
    });
