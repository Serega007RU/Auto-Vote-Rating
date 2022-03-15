async function vote(/*first*/) {
    if (document.querySelector('div.ui.error.message') != null) {
        if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow before voting again')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent.trim()})
        }
        return
    }
    if (document.querySelector('div.ui.success.message') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    const project = await getProject('BestMinecraftServers')
    document.querySelector('#main-content input[name="username"]').value = project.nick
    document.querySelector('#main-content button[type="submit"]').click()
}