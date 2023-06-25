async function vote(first) {
    if (document.querySelector('div.alert.alert-danger')) {
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent.trim()})
        return
    }

    if (document.querySelector('div.alert.alert-error:last-of-type') || document.querySelector('div.alert.alert-error')) {
        const request = {}
        const error = document.querySelector('div.alert.alert-error:last-of-type') || document.querySelector('div.alert.alert-error')
        request.message = error.innerText
        if (request.message.includes('Již si hlasoval') || request.message.includes('Nyní nemůžeš hlasovat. Zkus to prosím znovu')) {
            if (request.message.match(/\d+/g)) {
                const numbers = request.message.match(/\d+/g).map(Number)
                const date = new Date()
                chrome.runtime.sendMessage({later: Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), numbers[0] - 2/*На czech-craft время указано в часовом поясе UTC +2*/, numbers[1], numbers[2])})
            } else {
                chrome.runtime.sendMessage({later: true})
            }
        } else {
            if (request.message.includes('Nastala chyba')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return
    }

    if (document.querySelector('span.form-error')) {
        const request = {}
        request.message = document.querySelector('span.form-error').textContent
        if (request.message.includes('Nick obsahuje nepovolené znaky')) {
            request.ignoreReport = true
            request.retryCoolDown = 604800000
            chrome.runtime.sendMessage(request)
            return
        } else if (request.message.includes('response parameter is missing')) {
            // None
        } else {
            chrome.runtime.sendMessage(request)
            return
        }
    }

    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject('CzechCraft')
    document.getElementById('username').value = project.nick
    document.getElementById('privacy').checked = true
    document.querySelector('form[method="post"] > button.button').click()
}