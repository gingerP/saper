(function () {
    'use strict';

    var gameData = [];
    var xSize = 50;
    var ySize = 50;
    var shifts = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];
    var isGameFailed = false;
    var clickActions = {bomb: 'bomb', flag: 'flag'};
    var clickAction = 'bomb';
    var scoreLabel = document.getElementById('saper-game-score');
    var actionButton = document.getElementById('saper-toolbar-action');
    var gameScore = 0;

    var flag = '\
        <svg fill="red" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">\
        <path d="M0 0h24v24H0z" fill="none"/>\
        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>\
        </svg>';
    var bomb = '\
        <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 15 15" enable-background="new 0 0 512 512" id="svg3773" width="15" height="15">\
        <g id="g3771" transform="matrix(0.02929687,0,0,0.02929687,1.3197797e-4,0.00203714)">\
        <path d="m 411.313,123.313 c 6.25,-6.25 6.25,-16.375 0,-22.625 -6.25,-6.25 -16.375,-6.25 -22.625,0 l -32,32 -9.375,9.375 -20.688,-20.688 c -12.484,-12.5 -32.766,-12.5 -45.25,0 l -16,16 c -1.261,1.261 -2.304,2.648 -3.31,4.051 C 240.326,132.865 216.741,128 192,128 86.133,128 0,214.133 0,320 c 0,105.867 86.133,192 192,192 105.867,0 192,-86.133 192,-192 0,-24.741 -4.864,-48.327 -13.426,-70.065 1.402,-1.007 2.79,-2.049 4.051,-3.31 l 16,-16 c 12.5,-12.492 12.5,-32.758 0,-45.25 l -20.688,-20.688 9.375,-9.375 z M 192,224 c -52.938,0 -96,43.063 -96,96 0,8.836 -7.164,16 -16,16 -8.836,0 -16,-7.164 -16,-16 0,-70.578 57.422,-128 128,-128 8.836,0 16,7.164 16,16 0,8.836 -7.164,16 -16,16 z" id="path3759" inkscape:connector-curvature="0"/>\
        <path d="m 459.02,148.98 c -6.25,-6.25 -16.375,-6.25 -22.625,0 -6.25,6.25 -6.25,16.375 0,22.625 l 16,16 c 3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188,-1.563 11.313,-4.688 6.25,-6.25 6.25,-16.375 0,-22.625 z" id="path3761"/>\
        <path d="m 340.395,75.605 c 3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188,-1.563 11.313,-4.688 6.25,-6.25 6.25,-16.375 0,-22.625 l -16,-16 c -6.25,-6.25 -16.375,-6.25 -22.625,0 -6.25,6.25 -6.25,16.375 0,22.625 z" id="path3763"/>\
        <path d="m 400,64 c 8.844,0 16,-7.164 16,-16 V 16 C 416,7.164 408.844,0 400,0 391.156,0 384,7.164 384,16 v 32 c 0,8.836 7.156,16 16,16 z" id="path3765"/>\
        <path d="m 496,96.586 h -32 c -8.844,0 -16,7.164 -16,16 0,8.836 7.156,16 16,16 h 32 c 8.844,0 16,-7.164 16,-16 0,-8.836 -7.156,-16 -16,-16 z" id="path3767"/>\
        <path d="m 436.98,75.605 c 3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188,-1.563 11.313,-4.688 l 32,-32 c 6.25,-6.25 6.25,-16.375 0,-22.625 -6.25,-6.25 -16.375,-6.25 -22.625,0 l -32,32 c -6.251,6.25 -6.251,16.375 -10e-4,22.625 z" id="path3769"/>\
        </g>\
        </svg>';

    function renderGamePane(data) {
        var xIndex = 0;
        var yIndex = 0;
        var row = '';
        var item;
        var td = '';
        var table = '<table style="width: ' + (data.length * 20) + 'px"><colgroup>';
        for (; xIndex < data.length; xIndex++) {
            table += '<col width="20px"/>';
        }
        table += '</colgroup>';
        for (xIndex = 0; xIndex < data.length; xIndex++) {
            yIndex = 0;
            row = '<tr>';
            for (; yIndex < data[xIndex].length; yIndex++) {
                item = data[xIndex][yIndex];
                row += '<td id="cell-' + xIndex + '-' + yIndex + '" class="game-cell cell-closed"></td>';
            }
            row += '</tr>';
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

        for (xIndex = 0; xIndex < width; xIndex++) {
            row = [];
            for (yIndex = 0; yIndex < height; yIndex++) {
                var isBomb = Boolean(Math.round(Math.abs(Math.random() - 0.3)));
                row.push({
                    isBomb: isBomb,
                    isOpened: false,
                    value: 0
                });
            }
            data.push(row);
        }

        for (xIndex = 0; xIndex < width; xIndex++) {
            for (yIndex = 0; yIndex < height; yIndex++) {
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
        for (; shiftIndex < shifts.length; shiftIndex++) {
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
        for (; shiftIndex < shifts.length; shiftIndex++) {
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

    function initEvents() {
        var pane = document.getElementById('saper-game-pane');
        var reloadButton = document.getElementById('saper-toolbar-reload');
        pane.addEventListener('click', function (event) {
            var target;
            var item;
            if (isGameFailed) {
                return;
            }
            if (isBombClickAction()) {
                target = searchCell(event.target);
                item = getItemForCellId(target.id);
                if (item.isFlag) {
                    updateScore(--gameScore);
                }
                if (target && !hasClass(target, 'cell-open')) {
                    var pos = getPosForCellId(target.id);
                    openCell(gameData, pos[0], pos[1], true, true);
                }
            } else if (isFlagClickAction()) {
                target = searchCell(event.target);
                if (target) {
                    setFlag(target, getItemForCellId(target.id));
                    event.preventDefault();
                }
            }
        });
        pane.addEventListener('contextmenu', function (event) {
            if (isGameFailed) {
                return;
            }
            var target = searchCell(event.target);
            if (target) {
                setFlag(target, getItemForCellId(target.id));
                event.preventDefault();
            }
        });
        reloadButton.addEventListener('click', function() {
           if (!isGameFailed && confirm('Are you sure you want to start over?') || isGameFailed) {
               reload();
           }
        });
        actionButton.addEventListener('click', function() {
            var action = clickAction === clickActions.flag ? clickActions.bomb : clickActions.flag;
            setAction(action);
        });
    }

    function openCell(data, x, y, shouldOpenAround, isFirstBomb) {
        var item = data[x][y];
        var cell = document.getElementById('cell-' + x + '-' + y);
        removeClass(cell, 'cell-closed');
        addClass(cell, 'cell-opened');
        item.isOpened = true;
        if (item && item.isBomb) {
            isGameFailed = true;
            openBomb(data, x, y, cell, isFirstBomb);
        } else if (item && !item.isBomb) {
            if (item.value !== 0) {
                cell.innerHTML = item.value;
                addClass(cell, 'cell-value-' + item.value);
            }
            if (shouldOpenAround && item.value === 0) {
                var blankLake = getBlankLake(data, x, y);
                openLake(blankLake, data);
            }
        }
    }

    function addClass(target, className) {
        var regexp = new RegExp('( |^)' + className + '( |$)', 'g');
        if (!regexp.test(target.className)) {
            target.className += ' ' + className;
        }
        normalizeClassName(target);
    }

    function removeClass(target, className) {
        var regexp = new RegExp('( |^)' + className + '( |$)', 'g');
        target.className = target.className.replace(regexp, ' ');
        normalizeClassName(target);
    }

    function hasClass(target, className) {
        return target.className.indexOf(className) >= 0;
    }

    function normalizeClassName(target) {
        var parts = target.className.split(' ');
        var result = '';
        while(parts.length) {
            var part = parts.shift();
            if (part) {
                result += part + ' ';
            }
        }
        target.className = result;
    }

    function openLake(items, data) {
        for (var index = 0; index < items.length; index++) {
            var item = items[index];
            openCell(data, item[0], item[1], false);
        }
    }

    function getBlankLake(data, x, y) {
        var hashes = [x + '-' + y];
        var result = [[x, y]];
        var iterations = [[x, y]];
        var index = 0;
        var cell;
        while (true) {
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

    function openBomb(data, x, y, target, isFirst) {
        target.innerHTML = bomb;
        if (isFirst) {
            addClass(target, 'cell-first-bomb');
            openPane(data);
        }
    }

    function hashFromList(list) {
        var result = [];
        for (var index = 0; index < list.length; index++) {
            result.push(list[index][0] + '-' + list[index][1]);
        }
        return result;
    }

    function setFlag(target, item) {
        item.isFlag = !item.isFlag;
        target.innerHTML = item.isFlag ? flag : '';
        if (item.isFlag) {
            updateScore(++gameScore);
        } else {
            updateScore(--gameScore);
        }
    }

    function openPane(data) {
        for(var xIndex = 0; xIndex < data.length; xIndex++) {
            for(var yIndex = 0; yIndex < data[xIndex].length; yIndex++) {
                (function() {
                    var x = xIndex;
                    var y = yIndex;
                    setTimeout(function() {
                        openCell(data, x, y, false, false);
                    }, 0);
                })();
            }
        }
    }

    function getItemForCellId(id) {
        var match = /cell-(\d*)-(\d*)/g.exec(id);
        if (match.length >= 3) {
            var pos = [+match[1], +match[2]];
            return gameData[pos[0]][pos[1]];
        }
        return null;
    }

    function getPosForCellId(id) {
        var match = /cell-(\d*)-(\d*)/g.exec(id);
        if (match.length >= 3) {
            return [+match[1], +match[2]];
        }
        return null;
    }

    function updateScore(score) {
        var scoreSize = ('' + score).length;
        scoreLabel.innerHTML = (new Array(4 - scoreSize + 1)).join('0') + score;
    }

    function reload() {
        isGameFailed = false;
        gameScore = 0;
        gameData = initializeData(xSize, ySize);
        renderGamePane(gameData);
        updateScore(gameScore);
    }

    function searchCell(target) {
        if (target.tagName === 'TD' && hasClass(target, 'game-cell')) {
            return target;
        }
        if (target.tagName === 'BODY') {
            return null;
        }
        return searchCell(target.parentElement);
    }

    function setAction(action) {
        clickAction = action;
        if (action === clickActions.flag) {
            removeClass(actionButton, 'click-action-bomb-selected');
            addClass(actionButton, 'click-action-flag-selected')
        } else {
            removeClass(actionButton, 'click-action-flag-selected');
            addClass(actionButton, 'click-action-bomb-selected')
        }
    }

    function isBombClickAction() {
        return clickAction === clickActions.bomb;
    }

    function isFlagClickAction() {
        return clickAction === clickActions.flag;
    }

    reload();
    initEvents(gameData);
})();