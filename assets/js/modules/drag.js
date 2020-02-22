import Storage from './storage.js';

export default class Drag {
    constructor(config) {
        Object.assign(
            this,
            {
                wrapper: config.wrapper || null,
                elmnt: config.element || null,
                drag: config.drag || null,
                top: 0,
                left: 0,
                pos1: 0,
                pos2: 0,
                pos3: 0,
                pos4: 0,
                storage: new Storage(this.constructor.name),
            });
        if (this.wrapper && this.elmnt && this.drag) {
            let top = this.storage.get('top'),
                left = this.storage.get('left');
            if (top && left) {
                this.setPosition(top, left);
            }
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
        this.setPosition(this.elmnt.offsetTop - this.pos2, this.elmnt.offsetLeft - this.pos1);
    }

    closeDragElement() {
        // stop moving when mouse button is released:
        document.removeEventListener('mouseup', this.mouseup);
        document.removeEventListener('mousemove', this.mousemove);
        this.storage.set('top', this.top);
        this.storage.set('left', this.left);
    }

    /**
     * Set the element's new position
     * @param {integer} top 
     * @param {integer} left 
     */
    setPosition(top, left) {
        if (top > this.wrapper.offsetTop && top < this.wrapper.offsetHeight - this.elmnt.offsetHeight) {
            this.elmnt.style.top = `${top}px`;
            this.top = top;
        }
        if (left > this.wrapper.offsetLeft && left < this.wrapper.offsetWidth - this.elmnt.offsetWidth) {
            this.elmnt.style.left = `${left}px`;
            this.left = left;
        }
    }
}