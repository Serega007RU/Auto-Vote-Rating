async function vote(/*first*/) {
    const project = await getProject('ServeurMinecraftVoteFr')
    document.querySelector('#pseudo').value = project.nick
    document.querySelector('#vote-action').click()
}

const timer = setInterval(()=> {
    try {
        const message = document.querySelector('.toast-container')?.textContent
        if (message?.length > 0) {
            if (message.includes('devez attendre')) {
                const numbers = message.match(/\d+/g).map(Number)
                let milliseconds
                if (numbers.length === 1) milliseconds = (numbers[0] * 1000)
                else if (numbers.length === 2) milliseconds = (numbers[0] * 60 * 1000) + (numbers[1] * 1000)
                else if (numbers.length === 3) milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
                else milliseconds = 86400000
                chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            } else if (message.includes('Félicitation')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 500)