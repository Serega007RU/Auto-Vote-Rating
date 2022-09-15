async function vote() {
    if (document.querySelector('div.ui.success.message') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.ui.error.message') != null) {
        if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent})
        return
    }

    // Капча была раньше
    // if (first) return

    const project = await getProject('MCListOrg')
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('#main-content button[type="submit"]').click()
}