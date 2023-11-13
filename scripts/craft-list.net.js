async function vote(first) {
    if (document.querySelector('div.alert.alert-danger') != null) {
        if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
        return
    }
    if (document.querySelector('div.alert.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (first) return

    const project = await getProject()
    document.getElementById('username').value = project.nick
    document.querySelector('form[action="/sendvote"] button[type="submit"]').click()
}