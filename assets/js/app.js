import Minesweeper from './modules/minesweeper.js';
import Drag from './modules/drag.js';

document.addEventListener('DOMContentLoaded', () => {
    let ms = new Minesweeper();
    window.ms = ms;

    new Drag({
        wrapper: document.querySelector('.ms-body'),
        element: document.querySelector('.ms'),
        drag: document.querySelector('.ms-drag'),
    });

    document.querySelectorAll('.js-dark-mode')
        .forEach(el => el.addEventListener('change', () => {
            document.querySelector('.ms-body').classList.toggle('dark');
        }));
});