export default class Storage {
    
    constructor(key) {
        Object.assign(
            this,
            {
                storageAvailable: false,
                key: key || 'app',
                data: {}
            }
        );
        this.check();
        this.readStorage();
    }

    check() {
        try {
            let storage = window.localStorage,
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            this.storageAvailable = true;
        } catch (e) {
            console.info('localStorage unavailable');
            this.storageAvailable = false;
        }
    }

    readStorage() {
        if (this.storageAvailable) {
            try {
                this.data = JSON.parse(window.localStorage.getItem(this.key)) || {};
            } catch (e) {
                console.error('Cat\'t read storage data');
            }
        }
    }

    writeStorage() {
        if (!this.storageAvailable) {
            return false;
        }
        try {
            window.localStorage.setItem(this.key, JSON.stringify(this.data));
            return true;
        } catch (e) {
            console.error('Cat\'t write storage data');
            return false;
        }
    }

    set(key, value) {
        if (!this.storageAvailable) {
            return false;
        }
        this.data[key] = value;
        return this.writeStorage();
    }
    
    get(key) {
        return this.data[key];
    }
}