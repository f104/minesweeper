import { Storage } from './storage.ts'

interface DragConfig {
    wrapper: HTMLElement | null
    element: HTMLElement | null
    drag: HTMLElement | null
}

export default class Drag {
    wrapper: HTMLElement | null
    elmnt: HTMLElement | null
    drag: HTMLElement | null
    top: number
    left: number
    pos1: number
    pos2: number
    pos3: number
    pos4: number
    storage: Storage
    mouseup?: () => void
    mousemove?: () => void

    constructor(config: DragConfig) {
        this.wrapper = config.wrapper || null
        this.elmnt = config.element || null
        this.drag = config.drag || null
        this.top = 0
        this.left = 0
        this.pos1 = 0
        this.pos2 = 0
        this.pos3 = 0
        this.pos4 = 0
        this.storage = new Storage(this.constructor.name)
        
        if (this.wrapper && this.elmnt && this.drag) {
            const top = this.storage.get('top')
            const left = this.storage.get('left')
            if (top && left) {
                this.setPosition(top, left)
            }
            this.drag.addEventListener('mousedown', (e) => this.dragMouseDown(e))
        }
    }

    dragMouseDown(e: MouseEvent): void {
        e.preventDefault()
        // get the mouse cursor position at startup:
        this.pos3 = e.clientX
        this.pos4 = e.clientY
        this.mouseup = () => this.closeDragElement()
        this.mousemove = () => this.elementDrag()
        document.addEventListener('mouseup', this.mouseup)
        // call a function whenever the cursor moves:
        document.addEventListener('mousemove', this.mousemove)
    }

    elementDrag(e?: MouseEvent): void {
        if (!e) {
            e = window.event as MouseEvent
        }
        e.preventDefault()
        // calculate the new cursor position:
        this.pos1 = this.pos3 - e.clientX
        this.pos2 = this.pos4 - e.clientY
        this.pos3 = e.clientX
        this.pos4 = e.clientY
        // set the element's new position:
        if (this.elmnt) {
            this.setPosition(this.elmnt.offsetTop - this.pos2, this.elmnt.offsetLeft - this.pos1)
        }
    }

    closeDragElement(): void {
        // stop moving when mouse button is released:
        if (this.mouseup) {
            document.removeEventListener('mouseup', this.mouseup)
        }
        if (this.mousemove) {
            document.removeEventListener('mousemove', this.mousemove)
        }
        this.storage.set('top', this.top)
        this.storage.set('left', this.left)
    }

    /**
     * Set the element's new position
     * @param top 
     * @param left 
     */
    setPosition(top: number, left: number): void {
        if (!this.wrapper || !this.elmnt) {
            return
        }
        if (top > this.wrapper.offsetTop && top < this.wrapper.offsetHeight - this.elmnt.offsetHeight) {
            this.elmnt.style.top = `${top}px`
            this.top = top
        }
        if (left > this.wrapper.offsetLeft && left < this.wrapper.offsetWidth - this.elmnt.offsetWidth) {
            this.elmnt.style.left = `${left}px`
            this.left = left
        }
    }
}
