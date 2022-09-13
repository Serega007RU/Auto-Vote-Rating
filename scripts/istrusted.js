const script = document.createElement('script')
// https://stackoverflow.com/a/64991159/11235240
script.textContent = `
    Element.prototype._addEventListener = Element.prototype.addEventListener
    Element.prototype.addEventListener = function () {
        let args = [...arguments]
        let temp = args[1]
        args[1] = function () {
            let args2 = [...arguments]
            const type = args2[0].type
            if (type === 'mousemove' || type === 'click') {
                args2[0] = Object.assign({}, args2[0])
                args2[0].isTrusted = true
                if (type === 'mousemove') args2[0].pageX = 500
            }
            return temp(...args2)
        }
        return this._addEventListener(...args)
    }
    document.currentScript.parentNode.removeChild(document.currentScript)
    `
document.head.appendChild(script)