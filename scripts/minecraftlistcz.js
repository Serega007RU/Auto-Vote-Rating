async function vote(first) {
    if (first === false) return
    try {
        if (document.querySelector('.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('.alert.alert-primary') != null) {
            if (document.querySelector('.alert.alert-primary').textContent.includes('si hlasoval')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-primary').textContent.trim()})
            }
            return
        }
        if (document.querySelector('.vote__box').textContent.includes('si hlasoval')) {
            chrome.runtime.sendMessage({later: true})
            return
        }

        const project = await getProject('MinecraftListCZ')
        document.querySelector('input[name="username"]').value = project.nick
        document.querySelector('#flexCheckDefault').checked = true
        document.querySelector('div.vote__box__buttonRow__button button[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}