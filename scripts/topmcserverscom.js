async function vote(first) {
    if (document.querySelector('div.success.message') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.error.message') != null) {
        if (document.querySelector('div.error.message').textContent.includes('must wait until tomorrow')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.error.message').textContent})
        return
    }

    if (first) return

    const project = await getProject('TopMCServersCom')
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('#main-content button[type="submit"]').click()
}