async function vote(first) {
    if (document.querySelector('div.ui.success.message') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (document.querySelector('div.ui.error.message') != null) {
        if (document.querySelector('div.ui.error.message').textContent.includes('must wait until tomorrow')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        chrome.runtime.sendMessage({message: document.querySelector('div.ui.error.message').textContent})
        return
    }

    //Если на странице есть кнопка входа через Steam то жмём её
    if (document.querySelector('#serverPage > div > a > img') != null) {
        document.querySelector('#serverPage > div > a > img').click()
        return
    }

    if (first) return

    const project = await getProject()
    if (document.querySelector('input[name="username"]') != null && document.querySelector('input[name="username"]').type !== 'hidden') {
        if (project.nick == null || project.nick === '') {
            chrome.runtime.sendMessage({requiredNick: true})
            return
        }
        document.querySelector('input[name="username"]').value = project.nick
    }
    document.querySelector('#serverPage > form button[type="submit"]').click()
}