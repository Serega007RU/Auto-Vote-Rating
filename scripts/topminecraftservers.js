async function vote(first) {
    if (first === false) return
    if (document.querySelector('div.alert.alert-danger') != null) {
        const text = document.querySelector('div.alert.alert-danger').textContent
        if (text.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else if (text.includes('captcha')) {
            chrome.runtime.sendMessage({errorCaptcha: text, restartVote: true})
        } else {
            chrome.runtime.sendMessage({message: text})
        }
    } else if (document.querySelector('body > div.container > div > div > div > div.col-md-4 > button') != null) {
        if (document.querySelector('body > div.container > div > div > div > div.col-md-4 > button').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('body > div.container > div > div > div > div.col-md-4 > button').textContent})
        }
    } else {
        //Ожидание загрузки reCATPCHA
        const timer = setInterval(async ()=>{
            try {
                if (document.querySelector('input[name="t"]') != null && document.querySelector('input[name="t"]').value !== '') {
                    clearInterval(timer)
                    const project = await getProject('TopMinecraftServers')
                    document.getElementById('username').value = project.nick
                    document.getElementById('voteButton').click()
                }
            } catch (e) {
                clearInterval(timer)
                throwError(e)
            }
        }, 1000)
    }
}