async function vote(first) {
    try {

        if (first) return

        const project = await getProject('MinecraftServersOrg')
        document.querySelector('#vote-form input[name="username"]').value = project.nick
        document.querySelector('#vote-btn').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    // if (document.querySelector('#vote-form span') != null) {
    //     chrome.runtime.sendMessage({message: document.querySelector('#field-container > form > span').textContent})
    //     clearInterval(timer)
    //     return
    // }
    if (document.querySelector('#error-message') != null) {
        if (document.querySelector('#error-message').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else if (document.querySelector('#error-message').textContent.includes('Thanks for voting')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('#error-message').textContent})
        }
        clearInterval(timer)
    }
}, 1000)