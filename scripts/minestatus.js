async function vote(/*first*/) {
    if (document.querySelector('div.alert.alert-danger') != null) {
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent.trim()})
        return
    }
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert.alert-warning')) {
        const request = {}
        request.message = document.querySelector('div.alert.alert-warning').textContent.trim()
        if (request.message.includes('already voted')) {
            const later = Date.now() + (document.querySelector('div.alert.alert-warning').textContent.match(/\d+/g).map(Number)[0] + 1) * 3600000
            chrome.runtime.sendMessage({later})
        } else {
            if (request.message.includes('Recapcha error')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return
    }

    const project = await getProject('MineStatus')
    document.querySelector('#mainForm input[name="username"]').value = project.nick
    document.querySelector('#mainForm input[value="Vote for server"]').click()
}