async function vote(first) {
    if (document.querySelector('.alert-success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.alert-danger')) {
        const message = document.querySelector('.alert-danger').textContent
        if (message.toLowerCase().includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (first) return

    const project = await getProject()
    document.querySelector('.panel-body input[name="username"]').value = project.nick
    document.querySelector('.panel-body button[type="submit"]').click()
}