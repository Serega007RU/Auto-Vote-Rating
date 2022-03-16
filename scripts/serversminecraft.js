async function vote(first) {
    if (document.querySelector('div.bg-green-100') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.bg-blue-100') != null) {
        if (document.querySelector('div.bg-blue-100').textContent.includes('You can vote for this server again in')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.bg-blue-100').textContent.trim()})
        }
        return
    }

    if (first) return

    const project = await getProject('ServersMinecraft')
    document.querySelector('#username').value = project.nick
    document.querySelector('form button[type="submit"]').click()
}