async function vote(first) {
    if (document.querySelector('div.ui.success')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (document.querySelector('div.ui.error')) {
        const message = document.querySelector('div.ui.error').innerText
        if (message.includes('must wait') && message.includes('before voting again')) {
            chrome.runtime.sendMessage({later: true})
            return
        } else if (message.includes('Captcha wasn\'t entered correctly')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            return
        }
    }

    if (first) return

    const project = await getProject('MinecraftMenu')
    document.querySelector('#serverPage form input[name="username"]').value = project.nick
    document.querySelector('#serverPage form button[type="submit"]').click()
}