async function vote() {
    if (document.body.textContent.trim().length < 250) {
        const request = {}
        request.message = document.body.textContent.trim()
        if (request.message.includes('something went wrong')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

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

    // На удалённые сервера сайт просто переадресует на главную страницу без ошибки о том что сервер удалён
    if (document.querySelector('a.load-more-servers')) {
        const request = {}
        request.errorVoteNoElement = 'It looks like the site redirected to the main page (list of servers), most likely this server/project was deleted. If this is not the case and you think it is a error, inform the extension developer'
        request.ignoreReport = true
        chrome.runtime.sendMessage(request)
        return
    }

    // Капча была раньше
    // if (first) return

    const project = await getProject('MCListOrg')
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('#main-content button[type="submit"]').click()
}