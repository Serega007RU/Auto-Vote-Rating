async function vote(first) {
    if (document.querySelector('div.alert.alert-error')) {
        const request = {}
        request.message = document.querySelector('div.alert.alert-error').innerText
        if (request.message.includes('Du hast bereits innerhalb der letzten')) {
            const later = Date.now() + 86400000
            chrome.runtime.sendMessage({later})
            return
        } else if (request.message.includes('Captcha ist nicht valid')) {
            // None
        } else {
            if (request.message.includes('hatten ein Problem, deinen Vote an den Server zu senden')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
            return
        }
    }
    //Костыль селектор div.col-md-12 (там двойной div.alert.alert-success)
    if (document.querySelector('div.col-md-12 > div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject()
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('form > button[type="submit"]').click()
}