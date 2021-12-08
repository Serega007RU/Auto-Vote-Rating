async function vote(first) {
    if (first === false) return
    try {
        if (document.querySelector('#flashes').textContent.trim() !== '') {
            if (document.querySelector('#flashes').textContent.includes('successfully voted')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            } else if (!document.querySelector('#flashes').textContent.includes('please see below')) {
                chrome.runtime.sendMessage({message: document.querySelector('#flashes').textContent.trim()})
                return
            }
        }

        for (const element of document.querySelectorAll('[name="web_server_vote"] .errors')) {
            if (element.textContent.includes('vote once per day')) {
                chrome.runtime.sendMessage({later: true})
                return
            } else {
                console.warn(element.textContent)
            }
        }

        document.getElementById('captcha-button').click()
        const project = await getProject('MineServers')
        document.getElementById('web_server_vote_username').value = project.nick
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    try {
        if (document.getElementById('captcha-input').style.display !== 'none') {
            chrome.runtime.sendMessage({captcha: true})
            clearInterval(timer)
        }
    } catch (e) {
        throwError(e)
        clearInterval(timer)
    }
}, 1000)