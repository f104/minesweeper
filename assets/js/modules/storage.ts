export class Storage {
    storageAvailable: boolean
    key: string
    data: Record<string, any>

    constructor(key: string = 'app') {
        this.key = key
        this.data = {}
        this.storageAvailable = this.checkStorageAvailable()
        this.readStorage()
    }

    checkStorageAvailable(): boolean {
        try {
            const x = '__storage_test__'
            localStorage.setItem(x, x)
            localStorage.removeItem(x)
            return true
        } catch (e) {
            console.info('localStorage unavailable')
            return false
        }
    }

    readStorage(): void {
        if (this.storageAvailable) {
            try {
                this.data = JSON.parse(localStorage.getItem(this.key) || '{}')
            } catch (e) {
                console.error('Cat\'t read storage data')
            }
        }
    }

    writeStorage(): boolean {
        if (!this.storageAvailable) {
            return false
        }
        try {
            localStorage.setItem(this.key, JSON.stringify(this.data))
            return true
        } catch (e) {
            console.error('Cat\'t write storage data')
            return false
        }
    }

    set(key: string, value: any): boolean {
        if (!this.storageAvailable) {
            return false
        }
        this.data[key] = value
        return this.writeStorage()
    }

    get(key: string): any {
        return this.data[key]
    }
}
