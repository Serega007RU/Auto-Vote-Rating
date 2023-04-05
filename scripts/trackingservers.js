async function vote(first) {
    if (document.querySelector('div.success.message')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.red.message')) {
        const message = document.querySelector('div.red.message').innerText
        if (message.includes('must wait until tomorrow')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (first) return

    const project = await getProject('TrackingServers')
    document.querySelector('#main-content input[name="username"]').value = project.nick
    document.querySelector('#main-content button[type="submit"]').click()
}