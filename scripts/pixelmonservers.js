vote()
async function vote() {
    try {
        if (document.querySelector('#flashes').textContent.trim() != '') {
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
        const nick = await getNickName()
        if (nick == null || nick == '') return
        document.getElementById('web_server_vote_username').value = nick
        const timer = setInterval(()=>{
            try {
                if (document.getElementById('captcha-input').style.display != 'none') {
                    chrome.runtime.sendMessage({captcha: true})
                    clearInterval(timer)
                }
            } catch (e) {
                chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
                clearInterval(timer)
            }
        }, 1000)
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsPixelmonServers', data=>{
            resolve(data['AVMRprojectsPixelmonServers'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
