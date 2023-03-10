async function vote(first) {
    if (document.querySelector('div.alert-success') != null) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.alert-danger') != null) {
        const message = document.querySelector('div.alert-danger').textContent.trim()
        if (message.includes('Vous devez attendre')) {
            // const numbers = document.querySelector('div.error.message').textContent.match(/\d+/g).map(Number)
            // chrome.runtime.sendMessage({later: new Date(numbers[0][1]...)})
            chrome.runtime.sendMessage({later: true})
        } else if (message.includes('Répondre au captcha est obligatoire') || message.includes('Le captcha est invalide')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    if (document.querySelector('#vote').getAttribute('aria-hidden') === 'true') {
        document.querySelector('[data-target="#vote"]').click()
    }

    if (first) return

    const project = await getProject('ServeursMinecraftOrg')
    if (document.querySelector('#vote form #pseudo')) document.querySelector('form #pseudo').value = project.nick
    document.querySelector('#vote form input[type="submit"]').click()
}