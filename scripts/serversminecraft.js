async function vote(first) {
    try {
        if (document.querySelector('div.ui.error.message') != null) {
            if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow before voting again')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent.trim()})
            }
            return
        }
        if (document.querySelector('div.ui.warning.message') != null) {
            if (document.querySelector('div.ui.warning.message').textContent.includes('You have voted for this server')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.ui.warning.message').textContent.trim()})
            }
            return
        }
        if (document.querySelector('div.ui.success.message') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) return

        const project = await getProject('ServersMinecraft')
        document.querySelector('#main-content input[name="username"]').value = project.nick
        document.querySelector('#main-content button[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}