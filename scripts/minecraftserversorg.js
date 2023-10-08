async function vote(first) {
    if (checkAnswer()) return

    if (first) return

    const project = await getProject('MinecraftServersOrg')
    document.querySelector('#vote-form #username').value = project.nick
    document.querySelector('#vote-form button[type="submit"]').click()
}

const timer = setInterval(()=>{
    try {
        checkAnswer()
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)

function checkAnswer() {
    // if (document.querySelector('#vote-form span') != null) {
    //     chrome.runtime.sendMessage({message: document.querySelector('#field-container > form > span').textContent})
    //     clearInterval(timer)
    //     return true
    // }
    if (document.querySelector('#vote div[class="auth-msg"]')) {
        const request = {}
        request.message = document.querySelector('#vote div[class="auth-msg"]').innerText
        if (request.message.includes('already voted') || request.message.includes('reached your daily voting limit')) {
            const numbers = request.message.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
            chrome.runtime.sendMessage({later: Date.now() + milliseconds + 60000})
        } else if (request.message.includes('Thanks for voting')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            if (request.message.includes('session expired')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        clearInterval(timer)
        return true
    }
}