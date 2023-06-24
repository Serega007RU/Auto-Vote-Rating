async function vote(first) {
    if (first) return

    const project = await getProject('TopMinecraftIo')
    document.querySelector('#vote-form #vote-pseudo').value = project.nick
    document.querySelector('#vote-form #vote').click()
}

const timer = setInterval(() => {
    const message = document.querySelector('#vote-result')?.innerText
    if (message?.length) {
        if (message.includes('compléter le captcha de sécurité') || message.includes('complete the captcha')) {
            // None
        } else if (message.includes('avec le paramètre URL du serveur')) {
            chrome.runtime.sendMessage({message, ignoreReport: true})
            clearInterval(timer)
        } else if (message.includes('vote a bien été validé') || message.includes('vote has been successfully')) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        } else if (message.includes('avez déjà voté pour ce serveur') || message.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            clearInterval(timer)
        } else {
            chrome.runtime.sendMessage({message})
        }
    }
}, 1000)