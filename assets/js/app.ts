import { Minesweeper } from './modules/minesweeper.ts'
import Drag from './modules/drag.ts'

declare global {
    interface Window {
        ms: Minesweeper
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ms = new Minesweeper(true)
    window.ms = ms

    const wrapper = document.querySelector('.ms-body')
    const element = document.querySelector('.ms')
    const drag = document.querySelector('.ms-drag')

    if (wrapper && element && drag) {
        new Drag({
            wrapper: wrapper as HTMLElement,
            element: element as HTMLElement,
            drag: drag as HTMLElement,
        })
    }

    document.querySelectorAll('.js-dark-mode')
        .forEach(el => el.addEventListener('change', () => {
            const body = document.querySelector('.ms-body')
            if (body) {
                body.classList.toggle('dark')
            }
        }))
})
