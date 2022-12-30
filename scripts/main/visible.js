Object.defineProperty(document, 'visibilityState', {
    get() {
        return 'visible'
    }
})
Object.defineProperty(document, 'hidden', {
    get() {
        return false
    }
})