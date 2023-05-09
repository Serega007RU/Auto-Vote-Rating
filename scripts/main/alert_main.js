{
    const port = document.getElementById('avr-alert-port')

    if (port) {
        port.remove()

        alert = new Proxy(alert, {
            apply(target, thisArg, args) {
                port.dispatchEvent(new CustomEvent('state', {detail: {alert: true, url: document.location.href, message: args[0]}}))
            }
        })

        confirm = new Proxy(confirm, {
            apply(target, thisArg, args) {
                port.dispatchEvent(new CustomEvent('state', {detail: {confirm: true, url: document.location.href, message: args[0]}}))
                return true
            }
        })
    }
}