async function vote(first) {
    if (document.querySelector('div.vote-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (document.querySelector('div.warning-container')) {
        const message = document.querySelector('div.warning-container').innerText
        if (message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (first) return

    const project = await getProject('MineListNet')
    document.querySelector('form input[name="username"]').value = project.nick
    document.querySelector('form button[name="btn-vote"]').click()
}