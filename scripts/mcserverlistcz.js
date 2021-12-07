async function vote(first) {
    try {
        if (document.querySelector('div.ui.error.message') != null) {
            if (document.querySelector('div.ui.error.message').textContent.includes('ste hlasovali')) {
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

        if (first) return

        const project = await getProject('MCServerListCZ')
        document.querySelector('#main-content input[name="username"]').value = project.nick
        document.querySelector('#main-content button[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}