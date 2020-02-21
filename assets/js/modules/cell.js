export default class Cell {
    constructor({
        x,
        y,
        isMine = false,
        isNumber = false,
        state = null
    }) {
        Object.assign(this, {
            x,
            y,
            isMine,
            isNumber,
            state
        });
    }

    getElement() {
        return document.querySelector(`.ms-cell[data-x="${this.x}"][data-y="${this.y}"]`);
    }
}