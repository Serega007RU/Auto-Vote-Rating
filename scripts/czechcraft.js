async function vote(first) {
    if (document.querySelector('div.alert.alert-danger')) {
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent.trim()})
        return
    }
    if (document.querySelector('div.alert.alert-error')) {
        const request = {}
        request.message = document.querySelector('div.alert.alert-error').textContent.trim()
        if (request.message.includes('Již si hlasoval')) {
            if (request.message.match(/\d+/g)) {
                const numbers = request.message.match(/\d+/g).map(Number)
                const date = new Date()
                chrome.runtime.sendMessage({later: Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), numbers[0] - 2/*На czech-craft время указано в часовом поясе UTC +2*/, numbers[1], numbers[2])})
            } else {
                chrome.runtime.sendMessage({later: true})
            }
        } else {
            if (request.includes('Nastala chyba')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return
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