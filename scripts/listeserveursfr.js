async function vote(first) {
    if (document.querySelector('.success.message') && document.querySelector('.success.message').textContent.includes('vote a bien été comptabilisé')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.error.message')) {
        if (document.querySelector('.error.message').textContent.includes('ne pouvez voter que')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.error.message').innerText.trim()})
        }
        return
    }

    if (first) return

    const project = await getProject('ListeServeursFr')
    document.querySelector('#main-content input[name="username"]').value = project.nick
    document.querySelector('#main-content button[type="submit"]').click()
}