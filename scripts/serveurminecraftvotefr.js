async function vote(/*first*/) {
    try {
        const project = await getProject('ServeurMinecraftVoteFr')
        document.querySelector('#pseudo').value = project.nick
        document.querySelector('#vote-action').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=> {
    const message = document.querySelector('.toast-container').textContent
    if (message.length > 0) {
        if (message.includes('devez attendre')) {
            const numbers = message.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        } else if (message.includes('Félicitation')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        console.log('sendMessage', message)
        clearInterval(timer)
    }
}, 500)