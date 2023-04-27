// https://github.com/brian-girko/always-active

{
    /* visibility */
    Object.defineProperty(document, 'visibilityState', {
        get() {
            return 'visible'
        }
    })
    Object.defineProperty(document, 'webkitVisibilityState', {
        get() {
            return 'visible'
        }
    })

    /* hidden */
    Object.defineProperty(document, 'hidden', {
        get() {
            return false
        }
    })
    Object.defineProperty(document, 'webkitHidden', {
        get() {
            return false
        }
    })

    /* focus */
    // noinspection JSUnusedLocalSymbols
    Document.prototype.hasFocus = new Proxy(Document.prototype.hasFocus, {
        apply(target, self, args) {
            return true
            // return Reflect.apply(target, self, args)
        }
    })

    /* requestAnimationFrame */
    let lastTime = 0
    window.requestAnimationFrame = new Proxy(window.requestAnimationFrame, {
        apply(target, self, args) {
            const currTime = Date.now()
            const timeToCall = Math.max(0, 16 - (currTime - lastTime))
            const id = window.setTimeout(function() {
                args[0](performance.now())
            }, timeToCall)
            lastTime = currTime + timeToCall
            return id
            // return Reflect.apply(target, self, args)
        }
    })
    window.cancelAnimationFrame = new Proxy(window.cancelAnimationFrame, {
        apply(target, self, args) {
            clearTimeout(args[0])
            // return Reflect.apply(target, self, args)
        }
    })
}