async function vote(first) {
    if (document.querySelector('div.notification')) {
        const request = {}
        request.message = document.querySelector('div.notification').innerText.trim()
        if (request.message.includes('failed the reCAPTCHA challenge')) {
            // None
        } else if (request.message.includes('vote has been received')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (request.message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else {
            if (request.message.includes('server you are trying to visit has been removed')) {
                request.ignoreReport = true
                request.retryCoolDown = 21600000
            }
            chrome.runtime.sendMessage(request)
            return
        }
    }

    if (document.querySelector('div.quick-vote').innerText.includes('already voted')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject('MinecraftServerListCom')
    document.querySelector('div.quick-vote form input[name="mc_username"]').value = project.nick
    document.querySelector('div.quick-vote form button[type="submit"]').click()
}