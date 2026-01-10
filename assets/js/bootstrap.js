export default class Bootstrap {
    constructor() {
        Object.assign(
            this,
            {
                total: 0,
                loaded: 0,
                bar: document.querySelector('.loader__bar'),
                body: document.querySelector('.ms-body'),
                sources: [
                    { type: 'css', source: 'assets/css/minesweeper.css' },
                    { type: 'js', source: 'assets/js/app.js' },
                ],
            }
        );
        this.load();
    }

    load() {
        (async () => {
            await Promise.all(this.sources.map(async (source) => await this.loadSource(source)));
            console.log(this.total);
            this.run();
        })();
    }

    loadSource(source) {
        return new Promise((res, rej) => {
            (async () => {
                const response = await fetch(source.source);
                this.total += Number(response.headers.get('content-length'));
                const reader = response.body.getReader();
                while (true) {
                    const result = await reader.read();
                    if (result.done) {
                        this.appendSource(source);
                        console.log('Fetch complete');
                        break;
                    }
                    this.loaded += result.value.length;
                    this.setBar();
                    console.log('Received', this.loaded, 'bytes of', this.total);
                }
                res(source);
            })();
            // setTimeout(() => res(source), 250);

        });
    }

    setBar() {
        const percent = Math.ceil(this.loaded * 100 / this.total);
        this.bar.style.width = `${percent}%`;
    }

    appendSource(source) {
        let ref = null;
        switch (source.type) {
            case 'js':
                ref = document.createElement('script');
                ref.setAttribute('type', 'module');
                ref.setAttribute('src', source.source);
                break;
            case 'css':
                ref = document.createElement('link');
                ref.setAttribute('rel', 'stylesheet');
                ref.setAttribute('type', 'text/css');
                ref.setAttribute('href', source.source);
        }
        if (ref) {
            document.getElementsByTagName('head')[0].appendChild(ref);
        }
    }

    run() {
        this.body.classList.add('_init');
    }
}

new Bootstrap();