async function vote(first) {
    const message = document.querySelector('#vote i')?.parentElement?.innerText
    if (message && message.length > 3) {
        const request = {}
        request.message = message.trim()
        if (request.message.includes('hast erfolgreich')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (request.message.includes('hast heute schon')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            if (request.message.includes('Fehler bei Captcha-Prüfung')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return
    }

    const project = await getProject()
    document.querySelector('input[name="username"]').value = project.nick
    document.querySelector('button[data-callback="submitVoteForm"]').click()
}