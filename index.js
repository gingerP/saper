(function() {
    'use strict';

    var gameData = [];
    var xSize = 50;
    var ySize = 50;
    var shifts = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    function renderGamePane(data) {
        var xIndex = 0;
        var yIndex = 0;
        var row = '';
        var item;
        var td = '';
        var table = '<table style="width: ' + (data.length * 20)+ 'px"><colgroup>';
        for(;xIndex < data.length; xIndex++) {
            table += '<col width="20px"/>';
        }
        table += '</colgroup>';
        for(xIndex = 0;xIndex < data.length; xIndex++) {
            yIndex = 0;
            row = '<tr>';
            for(;yIndex < data[xIndex].length; yIndex++) {
                item = data[xIndex][yIndex];
                row += '<td id="cell-' + xIndex + '-' + yIndex + '" class="game-cell cell-closed"></td>';
            }
            row +='</tr>';
            table += row;
        }
        table += '</table>';
        document.getElementById('saper-game-pane').innerHTML = table;
    }

    function initializeData(width, height) {
        var xIndex;
        var yIndex;
        var row;
        var cell;
        var data = [];

        for(xIndex = 0;xIndex < width; xIndex++) {
            row = [];
            for(yIndex = 0;yIndex < height; yIndex++) {
                var isBomb = Boolean(Math.round(Math.random() - 0.3));
                row.push({
                    isBomb: isBomb,
                    value: 0
                });
            }
            data.push(row);
        }

        for(xIndex = 0;xIndex < width; xIndex++) {
            for(yIndex = 0;yIndex < height; yIndex++) {
                cell = data[xIndex][yIndex];
                if (!cell.isBomb) {
                    cell.value = getBombsCountAround(data, xIndex, yIndex, width, height);
                }
            }
        }
        return data;
    }

    function getBombsCountAround(data, xIndex, yIndex, maxX, maxY) {
        var shiftIndex = 0;
        var result = 0;
        var shift;
        for(;shiftIndex < shifts.length; shiftIndex++) {
            shift = shifts[shiftIndex];
            if (xIndex + shift[0] >= 0 && xIndex + shift[0] < maxX
                && yIndex + shift[1] >= 0 && yIndex + shift[1] < maxY
                && data[xIndex + shift[0]][yIndex + shift[1]].isBomb) {
                result++;
            }
        }
        return result;
    }

    function getNotBombsAround(data, xIndex, yIndex, excludesHashes) {
        var shiftIndex = 0;
        var notEmptyItems = [];
        var emptyItems = [];
        var shift;
        var maxX = data.length;
        var maxY = data[0].length;
        for(;shiftIndex < shifts.length; shiftIndex++) {
            shift = shifts[shiftIndex];
            var x = xIndex + shift[0];
            var y = yIndex + shift[1];
            if (x >= 0 && x < maxX && y >= 0 && y < maxY) {
                var hash = x + '-' + y;
                if (excludesHashes.indexOf(hash) >= 0) {
                    continue;
                }
                var item = data[x][y];
                if (!item.isBomb && item.value === 0) {
                    emptyItems.push([x, y]);
                } else if (!item.isBomb && item.value !== 0) {
                    notEmptyItems.push([x, y]);
                }
            }
        }
        return {
            empty: emptyItems,
            notEmpty: notEmptyItems
        };
    }

    function initEvents(data) {
        var pane = document.getElementById('saper-game-pane');
        pane.addEventListener('click', function(event) {
            if (event.target.tagName === 'TD' && event.target.className.indexOf('cell-open') < 0) {
                var match = /cell-(\d*)-(\d*)/g.exec(event.target.id);
                var pos = [+match[1], +match[2]];
                openCell(data, pos[0], pos[1]);
            }
        })
    }

    function openCell(data, x, y) {
        var item = data[x][y];
        var cell = document.getElementById('cell-' + x + '-' + y);
        if (item && item.isBomb) {
            cell.innerHTML = 'x';
        } else if (item && !item.isBomb) {
            cell.innerHTML = item.value;
            if (item.value === 0) {
                var blankLake = getBlankLake(data, x, y);
                openLake(blankLake, data);
            }
        }
    }

    function openLake(items, data) {
        for(var index = 0; index < items.length; index++) {
            var item = items[index];
            var dataItem = data[item[0]][item[1]];
            var cell = document.getElementById('cell-' + item[0] + '-' + item[1]);
            if (dataItem.isBomb) {
                cell.innerHTML = 'x';
            } else {
                cell.innerHTML = dataItem.value;
            }
        }
    }

    function getBlankLake(data, x, y) {
        var hashes = [x + '-' + y];
        var result = [[x, y]];
        var iterations = [[x, y]];
        var index = 0;
        var cell;
        while(true) {
            cell = iterations[index];
            if (!cell) {
                break;
            }
            var around = getNotBombsAround(data, cell[0], cell[1], hashes);
            result = result.concat(around.notEmpty).concat(around.empty);
            if (around.notEmpty.length) {
                hashes = hashes.concat(hashFromList(around.notEmpty));
            }
            if (around.empty.length) {
                iterations = iterations.concat(around.empty);
                hashes = hashes.concat(hashFromList(around.empty));
            }
            index++
        }
        return result;
    }

    function hashFromList(list) {
        var result = [];
        for(var index = 0; index < list.length; index++) {
            result.push(list[index][0] + '-' + list[index][1]);
        }
        return result;
    }

    gameData = initializeData(xSize, ySize);
    renderGamePane(gameData);
    initEvents(gameData);
})();