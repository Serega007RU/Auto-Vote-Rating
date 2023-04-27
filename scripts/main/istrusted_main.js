{
    // https://github.com/69Type/istrusted-bypass

    const port = document.getElementById('avr-it-port')

    if (port) {
        port.remove()

        Node.prototype.addEventListener = new Proxy(Node.prototype.addEventListener, {
            apply(target, thisArg, args) {
                args[1] = new Proxy(args[1], {
                    apply(target, thisArg, args) {
                        if (args[0]?.detail?.avrId && port.dataset?.avrId && args[0].detail.avrId === port.dataset.avrId) {
                            const object = {}
                            for (const property in args[0]) {
                                if (property === 'detail') continue
                                object[property] = args[0][property]
                            }
                            for (const property in args[0].detail) {
                                if (property === 'avrId') continue
                                if (args[0].detail[property] === 'avrDelete_' + port.dataset.avrId) {
                                    delete object[property]
                                } else {
                                    object[property] = args[0].detail[property]
                                }
                            }
                            // object.isTrusted = true
                            args[0] = object
                        }
                        return Reflect.apply(...arguments)
                    }
                })
                return Reflect.apply(...arguments)
            }
        })

        // const s = Symbol('listeners')
        // Node.prototype.addEventListener = new Proxy(Node.prototype.addEventListener, {
        //     apply(target, thisArg, args) {
        //         thisArg[s] = thisArg[s] || {}
        //
        //         if (args[0] in thisArg[s]) {
        //             thisArg[s][args[0]].push(args[1])
        //         } else {
        //             thisArg[s][args[0]] = [args[1]]
        //         }
        //
        //         return Reflect.apply(...arguments)
        //     }
        // })

        // TODO наверно в этом нет смысла, мы можем сами модифицировать такое небезопасное объявление слушателя
        // const set = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick').set
        // Object.defineProperty(HTMLElement.prototype, 'onclick', {
        //     set() {
        //         this[s] = this[s] || {}
        //         if ('click' in this[s]) {
        //             this[s]['click'].push(arguments[0])
        //         } else {
        //             this[s]['click'] = [arguments[0]]
        //         }
        //         return set.call(this, ...arguments)
        //         // return Reflect.set(this, ...arguments)
        //     }
        // })

        // Node.prototype.dispatchEvent = new Proxy(Node.prototype.dispatchEvent, {
        //     apply(target, thisArg, args) {
        //         const list = thisArg[s]
        //         if (list) {
        //             const listeners = list[args[0].type]
        //             if (listeners) {
        //                 const object = {}
        //                 for (const property in args[0]) object[property] = args[0][property]
        //                 if (args[1]) for (const property in args[1]) object[property] = args[1][property]
        //                 for (const listener of listeners) {
        //                     listener(object)
        //                 }
        //             }
        //         }
        //     }
        // })

        // // https://stackoverflow.com/a/64991159/11235240
        // Element.prototype._addEventListener = Element.prototype.addEventListener
        // Element.prototype.addEventListener = function () {
        //     let args = [...arguments]
        //     let temp = args[1]
        //     args[1] = function () {
        //         let args2 = [...arguments]
        //         const type = args2[0].type
        //         console.log(args2)
        //         // if (type === 'mousemove' || type === 'click') {
        //         //     args2[0] = Object.assign({}, args2[0])
        //         //     args2[0].isTrusted = true
        //         //     if (type === 'mousemove') args2[0].pageX = 500
        //         // }
        //         return temp(...args2)
        //     }
        //     return this._addEventListener(...args)
        // }
    }
}