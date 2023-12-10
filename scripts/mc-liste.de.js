async function vote(first) {
    if (document.querySelector('.ui.success.message')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('.ui.error.message')) {
        const request = {}
        request.message = document.querySelector('.ui.error.message').innerText.trim()
        if (request.message.includes('musst bis morgen warten')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage(request)
        }
        return
    }

    const project = await getProject()
    document.querySelector('#main-content input[name="username"]').value = project.nick

    chrome.runtime.sendMessage({captcha: true})
}
