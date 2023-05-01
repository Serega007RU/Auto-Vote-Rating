async function vote(first) {
    if (document.querySelector('div.alert.alert-warning')) {
        const message = document.querySelector('div.alert.alert-warning').innerText
        if (message.includes('have been selected for a second anti-bot validation')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            return
        }
    }

    if (document.querySelector('div.alert.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject('TopServersCom')
    document.querySelector('form#voteForm input#username').value = project.nick
    document.querySelector('form#voteForm button[type="submit"]').dispatchEvent(new Event('mousedown'))
    document.querySelector('form#voteForm button[type="submit"]').click()
}