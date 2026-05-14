interface CellProps {
    x: number
    y: number
    isMine?: boolean
    isNumber?: boolean
    state?: string | null
}

export class Cell {
    x: number
    y: number
    isMine: boolean
    isNumber: boolean
    state: string | null
    number?: number

    constructor({
        x,
        y,
        isMine = false,
        isNumber = false,
        state = null
    }: CellProps) {
        this.x = x
        this.y = y
        this.isMine = isMine
        this.isNumber = isNumber
        this.state = state
    }

    getElement(): HTMLElement | null {
        return document.querySelector(`.ms-cell[data-x="${this.x}"][data-y="${this.y}"]`)
    }
}
