(function () {
    'use strict';

    var gameData = [];
    var cellSize = 30;
    var xSize = 30;
    var ySize = 30;
    var shifts = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];
    var isGameStarted = false;
    var isGameFailed = false;
    var clickActions = {bomb: 'bomb', flag: 'flag'};
    var clickAction = 'bomb';
    var scoreLabel = document.getElementById('saper-game-score-value');
    var actionButton = document.getElementById('saper-toolbar-action');
    var timer = document.getElementById('saper-game-time');
    var gameTimer;
    var gameScore = 0;
    var gameLevel = 1;
    var maxGameLevel = 4;
    var openedCellsCount = 0;
    var successFinishLabels = [
        'You are well done',
        'Excellent work'
    ];

    var flag = '\
        <svg fill="red" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">\
        <path d="M0 0h24v24H0z" fill="none"/>\
        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>\
        </svg>';
    var bomb = '<img src="bomb.png"/>';

    function renderGamePane(data) {
        var xIndex = 0;
        var yIndex = 0;
        var row = '';
        var item;
        var td = '';
        var table = '<table style="width: ' + (data.length * cellSize) + 'px"><colgroup>';
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

    function renderTimer() {
        var time = Date.now();
        function setTime() {
            var delta = Date.now() - time;
            var min = Math.floor(delta / (1000 * 60));
            var sec = Math.floor(delta / 1000) % 60;
            timer.innerHTML =
                (min < 10 ? '<span class="label-zero">0</span>' + min : min)
                    + ':' +
                (sec < 10 ? '<span class="label-zero">0</span>' + sec : sec);
        }
        clearInterval(gameTimer);
        gameTimer = setInterval(setTime, 1000);
        setTime();
    }

    function initializeData(width, height) {
        var xIndex;
        var yIndex;
        var row;
        var cell;
        var data = [];
        var gameLevelMultiplier = (maxGameLevel - gameLevel) / 10;

        for (xIndex = 0; xIndex < width; xIndex++) {
            row = [];
            for (yIndex = 0; yIndex < height; yIndex++) {
                var isBomb = Boolean(Math.round(Math.abs(Math.random() - gameLevelMultiplier)));
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
        var levelSelect = document.getElementById('game-levels');
        var sizeSelect = document.getElementById('game-pane-size');
        pane.addEventListener('click', function (event) {
            var target;
            var item;
            if (isGameFailed) {
                return;
            }
            target = searchCell(event.target);
            if (target) {
                if (isBombClickAction()) {
                    isGameStarted = true;
                    item = getItemForCellId(target.id);
                    if (item.isFlag) {
                        updateScore(--gameScore);
                    }
                    if (target && !hasClass(target, 'cell-open')) {
                        var pos = getPosForCellId(target.id);
                        openCell(gameData, pos[0], pos[1], true, true, function () {
                            console.info('open cell');
                        });
                    }
                } else if (isFlagClickAction()) {
                    isGameStarted = true;
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
           if (isGameStarted && !isGameFailed && confirm('Are you sure you want to start over?')
               || !isGameStarted
               || isGameStarted && isGameFailed) {
               reload();
           }
        });
        actionButton.addEventListener('click', function() {
            var action = clickAction === clickActions.flag ? clickActions.bomb : clickActions.flag;
            setAction(action);
        });
        levelSelect.addEventListener('change', function() {
            var level = +this.value;
            var result = true;
            if (!isNaN(level)) {
                if (isGameStarted && !isGameFailed) {
                    result = confirm('The game will be restarted. Are you sure you want to change level?')
                }
                if (result) {
                    gameLevel = level;
                    reload();
                } else {
                    levelSelect.value = '' + gameLevel;
                }
            }
        });
        sizeSelect.addEventListener('change', function() {
            var size = +this.value;
            var result = true;
            if (!isNaN(size)) {
                if (isGameStarted && !isGameFailed) {
                    result = confirm('The game will be restarted. Are you sure you want to change size?')
                }
                if (result) {
                    xSize = size;
                    ySize = size;
                    reload();
                } else {
                    sizeSelect.value = '' + xSize;
                }
            }
        });
    }

    function openCell(data, x, y, shouldOpenAround, isFirstBomb, callback) {
        var item = data[x][y];
        var cell = document.getElementById('cell-' + x + '-' + y);
        removeClass(cell, 'cell-closed');
        addClass(cell, 'cell-opened');
        item.isOpened = true;
        openedCellsCount++;
        if (item && item.isBomb) {
            isGameFailed = true;
            openBomb(data, x, y, cell, isFirstBomb, callback);
        } else if (item && !item.isBomb) {
            if (item.value !== 0) {
                cell.innerHTML = item.value;
                addClass(cell, 'cell-value-' + item.value);
            }
            if (shouldOpenAround && item.value === 0) {
                var blankLake = getBlankLake(data, x, y);
                openLake(blankLake, data, callback);
            } else {
                callback();
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

    function openLake(items, data, callback) {
        var responeCount = 0;
        for (var index = 0; index < items.length; index++) {
            var item = items[index];
            openCell(data, item[0], item[1], false, false, function() {
                responeCount++;
                if (responeCount === items.length - 1) {
                    callback();
                }
            });
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

    function openBomb(data, x, y, target, isFirst, callback) {
        target.innerHTML = bomb;
        if (isFirst) {
            addClass(target, 'cell-first-bomb');
            openPane(data, callback);
        } else {
            callback();
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

    function openPane(data, callback) {
        var xMax = data.length - 1;
        var yMax = data[0].length - 1;
        for(var xIndex = 0; xIndex < data.length; xIndex++) {
            for(var yIndex = 0; yIndex < data[xIndex].length; yIndex++) {
                (function() {
                    var x = xIndex;
                    var y = yIndex;
                    setTimeout(function() {
                        openCell(data, x, y, false, false, function() {
                            if (x === xMax && y === yMax) {
                                callback();
                            }
                        });
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
        isGameStarted = false;
        isGameFailed = false;
        openedCellsCount = 0;
        gameScore = 0;
        gameData = initializeData(xSize, ySize);
        renderGamePane(gameData);
        renderTimer();
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

    function isGameFinishedSuccessfully() {
        return openedCellsCount === xSize * ySize;
    }

    function gameFinishedSuccessfully() {
        alert(successFinishLabels[Math.round(Math.random() * 2)]);
        reload();
    }

    reload();
    initEvents(gameData);
})();