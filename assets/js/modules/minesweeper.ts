import { Cell } from './cell.ts'
import { Storage } from './storage.ts'

type LevelName = 'beginner' | 'intermediate' | 'expert'

interface Level {
    cols: number
    rows: number
    mines: number
}

type Levels = Record<LevelName, Level>

export class Minesweeper {
    containerId: string
    container: HTMLElement | null
    debugContainerId: string
    debugContainer: HTMLElement | null
    stepCounter: number
    stepCounterElement: HTMLInputElement | null
    mineCounter: number
    mineCounterElement: HTMLInputElement | null
    btnElement: HTMLElement | null
    timer: number
    timerElement: HTMLInputElement | null
    level: LevelName
    levels: Levels
    states: {
        open: string
        flag: string
        question: string
        mine: string
    }
    grid: Cell[][]
    isRunning: boolean
    isDebug: boolean
    modifierKeyDown: boolean
    leftMouseDown: boolean
    rightMouseDown: boolean
    storage: Storage
    needOpenToWin: number
    timerInterval: number | null
    leftButtonTimeout: number | null
    rightButtonTimeout: number | null
    constructor(isDebug: boolean = false) {
        this.containerId = 'minesweeper'
        this.container = null
        this.debugContainerId = 'minesweeper_debug'
        this.debugContainer = null
        this.stepCounter = 0
        this.stepCounterElement = null
        this.mineCounter = 0
        this.mineCounterElement = null
        this.btnElement = null
        this.timer = 0
        this.timerElement = null
        this.level = 'beginner'
        this.levels = {
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
        }
        this.states = {
            open: '_open',
            flag: '_flag',
            question: '_question',
            mine: '_mine'
        }
        this.grid = []
        this.isRunning = false
        this.isDebug = isDebug
        this.modifierKeyDown = false
        this.leftMouseDown = false
        this.rightMouseDown = false
        this.storage = new Storage(this.constructor.name)
        this.needOpenToWin = 0
        this.timerInterval = null
        this.leftButtonTimeout = null
        this.rightButtonTimeout = null
        
        if (this.init()) {
            this.startGame()
        }
    }

    init(): boolean {
        this.container = document.getElementById(this.containerId)
        if (!this.container) {
            console.error(`[Minesweeper] Element with id ${this.containerId} not found`)
            return false
        }
        this.stepCounterElement = document.querySelector('[name="ms-stepcounter"]')
        this.mineCounterElement = document.querySelector('[name="ms-minecounter"]')
        this.timerElement = document.querySelector('[name="ms-timer"]')
        this.btnElement = document.querySelector('.js-ms-button')
        Object.keys(this.storage.data).forEach(k => {
            const key = k as keyof Minesweeper
            if (typeof this.storage.data[k] === typeof this[key]) {
                (this as any)[key] = this.storage.data[k]
            }
        })
        this.initMenu()
        this.initCntHandlers()
        return true
    }

    startGame(level: string | undefined = undefined): void {
        this.isRunning = true
        this.stopTimer()
        this.stepCounter = this.timer = 0
        if (level && Object.keys(this.levels).includes(level)) {
            this.level = level as LevelName
            this.storage.set('level', level)
        }
        this.mineCounter = this.levels[this.level]['mines']
        this.needOpenToWin = this.levels[this.level]['cols'] * this.levels[this.level]['rows'] - this.levels[this.level]['mines']
        if (this.timerElement) {
            this.timerElement.value = String(this.timer)
        }
        this.grid.length = 0
        if (this.btnElement) {
            this.btnElement.classList.remove('_lost', '_win')
        }
        this.render()
        this.drawCounter()
        this.logDebug('Running')
        this.logDebug(`Level ${this.level}`)
    }

    gameOver(): void {
        this.isRunning = false
        this.stopTimer()
        if (this.container) {
            this.container.classList.remove('_running')
        }
        this.logDebug('Game over')
    }

    gameLost(): void {
        this.grid.forEach((row) => {
            row.forEach((cell) => {
                const cellElement = cell.getElement()
                if (cellElement) {
                    cellElement.classList.remove(`${this.states.flag}`)
                    cellElement.classList.remove(`${this.states.mine}`)
                    if (cell.isMine) {
                        cellElement.classList.add(this.states.mine)
                    }
                }
            })
        })
        this.drawCounter()
        if (this.btnElement) {
            this.btnElement.classList.add('_lost')
        }
        this.logDebug('Game lost')
        this.gameOver()
    }

    gameWin(): void {
        if (this.btnElement) {
            this.btnElement.classList.add('_win')
        }
        this.logDebug('Game win')
        this.gameOver()
    }

    checkWin(): boolean {
        let opened = 0
        this.grid.forEach((row) => {
            opened += row.filter(cell => cell.state === this.states.open).length
        })
        return opened === this.needOpenToWin
    }

    startTimer(): void {
        this.stopTimer()
        this.timerInterval = window.setInterval(() => {
            this.timer++
            if (this.timer < 1000 && this.timerElement) {
                this.timerElement.value = String(this.timer)
            }
        }, 1000)
    }

    stopTimer(): void {
        if (this.timerInterval) {
            window.clearInterval(this.timerInterval)
        }
        this.timerInterval = null
    }

    logDebug(msg: string): void {
        if (this.isDebug && this.debugContainer) {
            this.debugContainer.innerHTML += `\n${msg}`
        }
    }

    render(): void {
        const level = this.levels[this.level]
        if (level && this.container) {
            this.container.innerHTML = ''
            this.container.classList.add('_running')
            let content = `<div class="ms-grid" style="grid-template-columns: repeat(${level.cols}, 1fr)">`
            const arr = this.getRandomArray()
            let z = 0
            for (let r = 0; r < level.rows; r++) {
                this.grid[r] = []
                for (let c = 0; c < level.cols; c++) {
                    content += `<div class="ms-cell" data-x="${c}" data-y="${r}"></div>`
                    this.grid[r].push(new Cell({ x: c, y: r, isMine: !!arr[z] }))
                    z++
                }
            }
            content += '</div>'
            this.container.innerHTML = content
            if (this.isDebug) {
                this.container.innerHTML += `<pre id="${this.debugContainerId}">Dubug mode on</pre>`
                this.debugContainer = document.getElementById(this.debugContainerId)
            }

            this.initCellHandlers()
        } else {
            console.error(`[Minesweeper] Incorrect level: ${this.level}`)
        }
    }

    redraw(): void {
        document.querySelectorAll('.ms-cell').forEach((el) => {
            const cell = this.getCellObj(el as HTMLElement)
            Object.values(this.states).forEach(v => {
                el.classList.remove(v)
            })
            el.innerHTML = ''
            if (cell.state) {
                el.classList.add(cell.state)
            }
            if (cell.isNumber) {
                el.innerHTML = String(cell.number || '')
                el.setAttribute('data-number', String(cell.number || ''))
            }
            if (cell.state === this.states.question) {
                el.innerHTML = '?'
            }
        })
        this.drawCounter()
    }

    drawCounter(): void {
        if (this.stepCounterElement) {
            this.stepCounterElement.value = String(this.stepCounter)
        }
        if (this.mineCounterElement) {
            this.mineCounterElement.value = String(this.mineCounter)
        }
    }

    initMenu(): void {
        document.querySelectorAll<HTMLElement>('.js-ms-level').forEach(el => {
            el.addEventListener('click', () => {
                // const level = (el as HTMLElement).dataset.level as LevelName
                // if (level) {
                // }
                this.startGame(el.dataset.level)
            })
        })
        const newBtn = document.querySelector('.js-ms-new')
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.startGame()
            })
        }
        const cheatBtn = document.querySelector('.js-ms-cheat')
        if (cheatBtn) {
            cheatBtn.addEventListener('click', () => {
                this.showCheat()
            })
        }
    }

    initCntHandlers(): void {
        window.addEventListener('keyup', (e) => {
            if (e.code === 'F2') {
                this.startGame()
            }
            if (e.code === 'KeyC') {
                this.showCheat()
            }
            if (e.code === 'KeyB') {
                this.startGame('beginner')
            }
            if (e.code === 'KeyI') {
                this.startGame('intermediate')
            }
            if (e.code === 'KeyE') {
                this.startGame('expert')
            }
        })
        if (this.btnElement) {
            this.btnElement.addEventListener('click', () => {
                this.startGame()
            })
        }
        if (this.container) {
            this.container.addEventListener('contextmenu', (e) => {
                e.preventDefault()
            })
            this.container.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // left mouse button
                    if (this.btnElement) {
                        this.btnElement.classList.add('_check')
                    }
                    if (this.leftButtonTimeout) {
                        clearTimeout(this.leftButtonTimeout)
                    }
                    this.leftMouseDown = true
                } else if (e.button === 2) { // right mouse button
                    if (this.rightButtonTimeout) {
                        clearTimeout(this.rightButtonTimeout)
                    }
                    this.rightMouseDown = true
                }
            })
            this.container.addEventListener('mouseup', (e) => {
                if (e.button === 0) { // left mouse button
                    if (this.btnElement) {
                        this.btnElement.classList.remove('_check')
                    }
                    this.leftButtonTimeout = window.setTimeout(() => {
                        this.leftMouseDown = false
                    }, 50)
                } else if (e.button === 2) { // right mouse button
                    this.rightButtonTimeout = window.setTimeout(() => {
                        this.rightMouseDown = false
                    }, 50)
                }
            })
        }
    }

    initCellHandlers(): void {
        if (this.container) {
            this.container.querySelectorAll('.ms-cell')
                .forEach((el: Element) => el.addEventListener('mouseup', (e: Event) => {
                    const ev = e as MouseEvent
                    if (ev.button === 0) { // left mouse button
                        if (ev.shiftKey || ev.ctrlKey) {
                            this.modifierKeyDown = true
                            setTimeout(() => {
                                this.modifierKeyDown = false
                            }, 50)
                            this.handleRightClick(ev.target as HTMLElement)
                        } else {
                            this.handleLeftClick(ev.target as HTMLElement)
                        }
                    } else if (ev.button === 2) { // right mouse button
                        this.handleRightClick(ev.target as HTMLElement)
                    }
                }))
        }
    }

    handleLeftClick(cell: HTMLElement): void {
        if (!this.isRunning) {
            return
        }
        if (!this.timer && !this.timerInterval) {
            this.startTimer()
        }

        const cellObj = this.getCellObj(cell)
        if (cellObj.isNumber) {
            // auto clear neighbor cells
            if (this.rightMouseDown) {
                this.altTouchAdjacentCells(cellObj)
            }
            this.stepCounter++
        } else {
            if (cellObj.state === this.states.open || cellObj.state === this.states.flag) {
                return
            }
            if (cellObj.isMine) {
                if (this.stepCounter === 0) {
                    // restart game
                    this.startGame()
                    this.handleLeftClick(cell)
                } else {
                    this.stepCounter++
                    this.gameLost()
                }
                return
            }

            this.touchAdjacentCells(cellObj)
            this.stepCounter++
        }
        this.redraw()
        if (this.checkWin()) {
            this.gameWin()
        }
    }

    handleRightClick(cell: HTMLElement): void {
        if (!this.isRunning) {
            return
        }
        if (!this.timer) {
            this.startTimer()
        }

        const cellObj = this.getCellObj(cell)
        if (cellObj.isNumber) {
            // auto clear neighbor cells
            if (this.leftMouseDown || this.modifierKeyDown) {
                this.altTouchAdjacentCells(cellObj)
            }
            this.stepCounter++
        } else {
            if (cellObj.state === this.states.open) {
                return
            }
            this.stepCounter++
            switch (cellObj.state) {
                case this.states.flag:
                    cellObj.state = this.states.question
                    this.mineCounter++
                    break
                case this.states.question:
                    cellObj.state = null
                    break
                default:
                    cellObj.state = this.states.flag
                    this.mineCounter--
            }
        }

        this.redraw()
        if (this.checkWin()) {
            this.gameWin()
        }
    }

    getCellObj(cell: HTMLElement): Cell {
        const x = parseInt(cell.dataset.x || '0')
        const y = parseInt(cell.dataset.y || '0')
        return this.grid[y][x]
    }

    showCheat(): void {
        console.log(this.gridToString())
    }

    gridToString(): string {
        let result = '\n'
        for (let r = 0, r_len = this.grid.length; r < r_len; r++) {
            for (let c = 0, c_len = this.grid[r].length; c < c_len; c++) {
                result += (this.grid[r][c].isMine ? 'x' : 'o') + ' '
            }
            result += '\n'
        }
        return result
    }

    getRandomArray(): number[] {
        const width = this.levels[this.level]['cols']
        const height = this.levels[this.level]['rows']
        const totalMines = this.levels[this.level]['mines']
        const array: number[] = []
        let x: number
        let max: number
        let infiniteLoop = 0
        // Put all mines in the beginning
        for (x = 0, max = width * height; x < max; x++) {
            if (x < totalMines) {
                array[x] = 1
            } else {
                array[x] = 0
            }
        }

        // shuffle array so it's like pulling out of a 'hat'
        // credit: http://sedition.com/perl/javascript-fy.html
        function fisherYates(myArray: number[]): void {
            let i = myArray.length, j: number, tempi: number, tempj: number
            if (i === 0) {
                return
            }
            while (--i) {
                j = Math.floor(Math.random() * (i + 1))
                tempi = myArray[i]
                tempj = myArray[j]
                myArray[i] = tempj
                myArray[j] = tempi
            }
        }

        do {
            fisherYates(array)
            infiniteLoop += 1
            if (infiniteLoop > 20) {
                break
            }
        } while (array[0] === 1)
        return array
    }

    getAdjacentCells(cell: Cell): Cell[] {
        const x = cell.x
        const y = cell.y
        const maxY = this.grid.length - 1
        const maxX = this.grid[0].length - 1
        const results: Cell[] = []
        for (let i = Math.max(0, y - 1); i <= Math.min(maxY, y + 1); i++) {
            for (let j = Math.max(0, x - 1); j <= Math.min(maxX, x + 1); j++) {
                if (i !== y || j !== x) {
                    const adjacentCell = this.grid[i][j]
                    if (adjacentCell) {
                        results.push(adjacentCell)
                    }
                }
            }
        }

        return results
    }

    touchAdjacentCells(cell: Cell): void {
        const stack: Cell[] = []
        stack.push(cell)
        while (stack.length > 0) {
            let adjacentCells: Cell[]
            let numMines = 0
            const curCell = stack.pop()!
            adjacentCells = this.getAdjacentCells(curCell)            // calc # of mines
            adjacentCells.forEach((el) => {
                if (el.isMine) {
                    numMines += 1
                }
            })
            curCell.number = numMines
            curCell.state = this.states.open
            if (numMines > 0) {
                curCell.isNumber = true
            } else {
                adjacentCells.forEach((el) => {
                    if (el.state !== this.states.open) {
                        stack.push(el)
                    }
                })
            }
        }
    }

    altTouchAdjacentCells(cell: Cell): void {
        if (!cell.isNumber) {
            return
        }
        const adjacentCells = this.getAdjacentCells(cell)
        const flagged = adjacentCells.filter(c => c.state === this.states.flag).length
        if (flagged === cell.number) {
            adjacentCells.forEach((adjacentCell) => {
                if (!adjacentCell.isMine) {
                    this.touchAdjacentCells(adjacentCell)
                }
            })
        }
    }

}
