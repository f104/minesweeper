import Cell from './cell.js';
import Storage from './storage.js';

export default class Minesweeper {
    constructor() {
        Object.assign(
            this,
            {
                containerId: 'minesweeper',
                container: null,
                debugContainerId: 'minesweeper_debug',
                debugContainer: null,
                stepCounter: 0,
                stepCounterElement: null,
                mineCounter: 0,
                mineCounterElement: null,
                btnElement: null,
                timer: 0,
                timerElement: null,
                level: 'beginner',
                levels: {
                    beginner: {
                        cols: 9,
                        rows: 9,
                        mines: 10
                    },
                    intermediate: {
                        cols: 16,
                        rows: 16,
                        mines: 40
                    },
                    expert: {
                        cols: 30,
                        rows: 16,
                        mines: 99
                    }
                },
                states: {
                    open: '_open',
                    flag: '_flag',
                    question: '_question',
                    mine: '_mine'
                },
                grid: [],
                isRunning: false,
                isDebug: false,
                modifierKeyDown: false,
                leftMouseDown: false,
                rightMouseDown: false,
                storage: new Storage(this.constructor.name),
            }
        );
        if (this.init()) {
            this.startGame();
        }
    }

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`[Minesweeper] Element with id ${this.containerId} not found`);
            return false;
        }
        this.stepCounterElement = document.querySelector('[name="ms-stepcounter"]');
        this.mineCounterElement = document.querySelector('[name="ms-minecounter"]');
        this.timerElement = document.querySelector('[name="ms-timer"]');
        this.btnElement = document.querySelector('.js-ms-button');

        Object.keys(this.storage.data).forEach(k => {
            if (typeof this.storage.data[k] === typeof this[k]) {
                this[k] = this.storage.data[k];
            }
        });

        this.initMenu();
        this.initCntHandlers();

        return true;
    }

    startGame(level) {
        this.isRunning = true;
        this.stopTimer();
        this.stepCounter = this.timer = 0;
        if (level && this.levels[level]) {
            this.level = level;
            this.storage.set('level', level);
        }
        this.mineCounter = this.levels[this.level]['mines'];
        this.needOpenToWin = this.levels[this.level]['cols'] * this.levels[this.level]['rows'] - this.levels[this.level]['mines'];
        this.timerElement.value = this.timer;
        this.grid.length = 0;
        this.btnElement.classList.remove('_lost', '_win');
        this.render();
        this.drawCounter();
        this.logDebug('Running');
        this.logDebug(`Level ${this.level}`);
    }

    gameOver() {
        this.isRunning = false;
        this.stopTimer();
        this.container.classList.remove('_running');
        this.logDebug('Game over');
    }

    gameLost() {
        this.grid.forEach((row) => {
            row.forEach((cell) => {
                let cellElement = cell.getElement();
                cellElement.classList.remove(`${this.states.flag}`);
                cellElement.classList.remove(`${this.states.mine}`);
                if (cell.isMine) {
                    cellElement.classList.add(this.states.mine);
                }
            });
        });
        this.drawCounter();
        this.btnElement.classList.add('_lost');
        this.logDebug('Game lost');
        this.gameOver();
    }

    gameWin() {
        this.btnElement.classList.add('_win');
        this.logDebug('Game win');
        this.gameOver();
    }

    checkWin() {
        let opened = 0;
        this.grid.forEach((row) => {
            opened += row.filter(cell => cell.state === this.states.open).length;
        });
        return opened === this.needOpenToWin;
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = window.setInterval(() => {
            this.timer++;
            if (this.timer < 1000) {
                this.timerElement.value = this.timer;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            window.clearInterval(this.timerInterval);
        }
        this.timerInterval = null;
    }

    logDebug(msg) {
        if (this.isDebug && this.debugContainer) {
            this.debugContainer.innerHTML += `\n${msg}`;
        }
    }

    render() {
        let level = this.levels[this.level];
        if (level) {
            this.container.innerHTML = '';
            this.container.classList.add('_running');

            let content = `<div class="ms-grid" style="grid-template-columns: repeat(${level.cols}, 1fr)">`;
            let arr = this.getRandomArray();
            let z = 0;
            for (let r = 0; r < level.rows; r++) {
                this.grid[r] = [];
                for (let c = 0; c < level.cols; c++) {
                    content += `<div class="ms-cell" data-x="${c}" data-y="${r}"></div>`;
                    this.grid[r].push(new Cell({ x: c, y: r, isMine: !!arr[z] }));
                    z++;
                }
            }
            content += '</div>';

            this.container.innerHTML = content;

            if (this.isDebug) {
                this.container.innerHTML += `<pre id="${this.debugContainerId}">Dubug mode on</pre>`;
                this.debugContainer = document.getElementById(this.debugContainerId);
            }

            this.initCellHandlers();
        } else {
            console.error(`[Minesweeper] Incorrect level: ${this.level}`);
        }
    }

    redraw() {
        document.querySelectorAll('.ms-cell').forEach((el) => {
            let cell = this.getCellObj(el);
            Object.values(this.states).forEach(v => {
                el.classList.remove(v);
            });
            el.innerHTML = '';
            if (cell.state) {
                el.classList.add(cell.state);
            }
            if (cell.isNumber) {
                el.innerHTML = cell.number;
                el.dataset.number = cell.number;
            }
            if (cell.state === this.states.question) {
                el.innerHTML = '?';
            }
        });
        this.drawCounter();
    }

    drawCounter() {
        if (this.stepCounterElement) {
            this.stepCounterElement.value = this.stepCounter;
        }
        if (this.mineCounterElement) {
            this.mineCounterElement.value = this.mineCounter;
        }
    }

    initMenu() {
        document.querySelectorAll('.js-ms-level').forEach(el => {
            el.addEventListener('click', () => {
                this.startGame(el.dataset.level);
            });
        });
        document.querySelector('.js-ms-new').addEventListener('click', () => {
            this.startGame();
        });
        document.querySelector('.js-ms-cheat').addEventListener('click', () => {
            this.showCheat();
        });
    }

    initCntHandlers() {
        window.addEventListener('keyup', (e) => {
            //            console.log(e.code);
            if (e.code === 'F2') {
                this.startGame();
            }
            if (e.code === 'KeyC') {
                this.showCheat();
            }
            if (e.code === 'KeyB') {
                this.startGame('beginner');
            }
            if (e.code === 'KeyI') {
                this.startGame('intermediate');
            }
            if (e.code === 'KeyE') {
                this.startGame('expert');
            }
        });
        this.btnElement.addEventListener('click', () => {
            this.startGame();
        });
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.container.addEventListener('mousedown', (e) => {
            if (e.which === 1) { // left mouse button
                this.btnElement.classList.add('_check');
                clearTimeout(this.leftButtonTimeout);
                this.leftMouseDown = true;
            } else if (e.which === 3) { // right mouse button
                clearTimeout(this.rightButtonTimeout);
                this.rightMouseDown = true;
            }
        });

        this.container.addEventListener('mouseup', (e) => {
            if (e.which === 1) { // left mouse button
                this.btnElement.classList.remove('_check');
                this.leftButtonTimeout = setTimeout(() => {
                    this.leftMouseDown = false;
                }, 50);
            } else if (e.which === 3) { // right mouse button
                this.rightButtonTimeout = setTimeout(() => {
                    this.rightMouseDown = false;
                }, 50);
            }
        });
    }

    initCellHandlers() {
        this.container.querySelectorAll('.ms-cell')
            .forEach(el => el.addEventListener('mouseup', (e) => {
                if (e.which === 1) { // left mouse button
                    if (e.shiftKey || e.ctrlKey) {
                        this.modifierKeyDown = true;
                        setTimeout(() => {
                            this.modifierKeyDown = false;
                        }, 50);
                        this.handleRightClick(e.target);
                    } else {
                        this.handleLeftClick(e.target);
                    }
                } else if (e.which === 3) { // right mouse button
                    this.handleRightClick(e.target);
                }
            }));
    }

    handleLeftClick(cell) {
        if (!this.isRunning) {
            return;
        }
        if (!this.timer && !this.timerInterval) {
            this.startTimer();
        }

        let cellObj = this.getCellObj(cell);

        if (cellObj.isNumber) {
            // auto clear neighbor cells
            if (this.rightMouseDown) {
                this.altTouchAdjacentCells(cellObj);
            }
            this.stepCounter++;
        } else {
            if (cellObj.state === this.states.open || cellObj.state === this.states.flag) {
                return;
            }
            if (cellObj.isMine) {
                if (this.stepCounter === 0) {
                    // restart game
                    this.startGame();
                    this.handleLeftClick(cell);
                } else {
                    this.stepCounter++;
                    this.gameLost();
                }
                return;
            }

            this.touchAdjacentCells(cellObj);
            this.stepCounter++;
        }
        this.redraw();
        if (this.checkWin()) {
            this.gameWin();
        }
    }

    handleRightClick(cell) {
        if (!this.isRunning) {
            return;
        }
        if (!this.timer) {
            this.startTimer();
        }

        let cellObj = this.getCellObj(cell);

        if (cellObj.isNumber) {
            // auto clear neighbor cells
            if (this.leftMouseDown || this.modifierKeyDown) {
                this.altTouchAdjacentCells(cellObj);
            }
            this.stepCounter++;
        } else {
            if (cellObj.state === this.states.open) {
                return;
            }
            this.stepCounter++;
            switch (cellObj.state) {
                case this.states.flag:
                    cellObj.state = this.states.question;
                    this.mineCounter++;
                    break;
                case this.states.question:
                    cellObj.state = null;
                    break;
                default:
                    cellObj.state = this.states.flag;
                    this.mineCounter--;
            }
        }

        this.redraw();
        if (this.checkWin()) {
            this.gameWin();
        }
    }

    getCellObj(cell) {
        return this.grid[cell.dataset.y][cell.dataset.x];
    }

    showCheat() {
        console.log(this.gridToString());
    }

    gridToString() {
        let result = '\n';
        for (let r = 0, r_len = this.grid.length; r < r_len; r++) {
            for (let c = 0, c_len = this.grid[r].length; c < c_len; c++) {
                result += (this.grid[r][c].isMine ? 'x' : 'o') + ' ';
            }
            result += '\n';
        }
        return result;
    }

    getRandomArray() {
        let width = this.levels[this.level]['cols'],
            height = this.levels[this.level]['rows'],
            totalMines = this.levels[this.level]['mines'],
            array = [],
            x,
            max,
            infiniteLoop = 0;

        // Put all mines in the beginning
        for (x = 0, max = width * height; x < max; x++) {
            if (x < totalMines) {
                array[x] = 1;
            } else {
                array[x] = 0;
            }
        }

        // shuffle array so it's like pulling out of a 'hat'
        // credit: http://sedition.com/perl/javascript-fy.html
        function fisherYates(myArray) {
            let i = myArray.length, j, tempi, tempj;
            if (i === 0) {
                return;
            }
            while (--i) {
                j = Math.floor(Math.random() * (i + 1));
                tempi = myArray[i];
                tempj = myArray[j];
                myArray[i] = tempj;
                myArray[j] = tempi;
            }
        }

        do {
            fisherYates(array);
            infiniteLoop += 1;
            if (infiniteLoop > 20) {
                break;
            }
        } while (array[0] === 1);

        return array;
    }

    getAdjacentCells(cell) {
        let x = cell.x,
            y = cell.y,
            maxY = this.grid.length - 1,
            maxX = this.grid[0].length - 1,
            results = [];

        for (let i = Math.max(0, y - 1); i <= Math.min(maxY, y + 1); i++) {
            for (let j = Math.max(0, x - 1); j <= Math.min(maxX, x + 1); j++) {
                if (i !== y || j !== x) {
                    let adjacentCell = this.grid[i][j];
                    if (adjacentCell) {
                        results.push(adjacentCell);
                    }
                }
            }
        }

        return results;
    }

    touchAdjacentCells(cell) {
        let stack = [];

        stack.push(cell);

        while (stack.length > 0) {
            let adjacentCells,
                numMines = 0,
                curCell = stack.pop();

            adjacentCells = this.getAdjacentCells(curCell);
            // calc # of mines
            adjacentCells.forEach((el) => {
                if (el.isMine) {
                    numMines += 1;
                }
            });

            curCell.number = numMines;
            curCell.state = this.states.open;
            if (numMines > 0) {
                curCell.isNumber = true;
            } else {
                adjacentCells.forEach((el) => {
                    if (el.state !== this.states.open) {
                        stack.push(el);
                    }
                });
            }
        }
    }

    altTouchAdjacentCells(cell) {
        if (!cell.isNumber) {
            return;
        }
        let adjacentCells = this.getAdjacentCells(cell);
        let flagged = adjacentCells.filter(c => c.state === this.states.flag).length;

        if (flagged === cell.number) {
            adjacentCells.forEach((adjacentCell) => {
                if (!adjacentCell.isMine) {
                    this.touchAdjacentCells(adjacentCell);
                }
            });
        }
    }

    _checkStorage() {
        try {
            let storage = window.localStorage,
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            this.logDebug('localStorage unavailable');
            return false;
        }
    }

    _writeStorage() {
        try {
            window.localStorage.setItem('ms', JSON.stringify(this.storageData));
            return true;
        } catch (e) {
            this.logDebug('Cat\'t write storage data');
            return false;
        }
    }

    _readStorage() {
        try {
            let storageData = JSON.parse(window.localStorage.getItem('ms'));
            Object.keys(storageData).forEach(k => {
                if (typeof storageData[k] === typeof this.storageData[k]) {
                    this.storageData[k] = storageData[k];
                }
            });
            return true;
        } catch (e) {
            this.logDebug('Cat\'t read storage data');
            return false;
        }
    }

}