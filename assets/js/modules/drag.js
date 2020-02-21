export default class Drag {
    constructor(config) {
        Object.assign(
            this,
            {
                wrapper: config.wrapper || null,
                elmnt: config.element || null,
                drag: config.drag || null,
                pos1: 0,
                pos2: 0,
                pos3: 0,
                pos4: 0,
            });
        if (this.wrapper && this.elmnt && this.drag) {
            this.drag.addEventListener('mousedown', () => this.dragMouseDown());
        }
    }

    dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        this.pos3 = e.clientX;
        this.pos4 = e.clientY;
        document.addEventListener('mouseup', this.mouseup = () => this.closeDragElement());
        // call a function whenever the cursor moves:
        document.addEventListener('mousemove', this.mousemove = () => this.elementDrag());
    }

    elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        this.pos1 = this.pos3 - e.clientX;
        this.pos2 = this.pos4 - e.clientY;
        this.pos3 = e.clientX;
        this.pos4 = e.clientY;
        // set the element's new position:
        let top = this.elmnt.offsetTop - this.pos2;
        let left = this.elmnt.offsetLeft - this.pos1;
        if (top > this.wrapper.offsetTop && top < this.wrapper.offsetHeight - this.elmnt.offsetHeight) {
            this.elmnt.style.top = `${top}px`;
        }
        if (left > this.wrapper.offsetLeft && left < this.wrapper.offsetWidth - this.elmnt.offsetWidth) {
            this.elmnt.style.left = `${left}px`;
        }
    }

    closeDragElement() {
        // stop moving when mouse button is released:
        document.removeEventListener('mouseup', this.mouseup);
        document.removeEventListener('mousemove', this.mousemove);
    }
}