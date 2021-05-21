window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
//Совместимость с Rocket Loader
document.addEventListener('DOMContentLoaded', (event)=>{
    vote(true)
})

async function vote(first) {
    try {
        if (document.querySelector('div.main-panel > p') != null) {
            if (document.querySelector('div.main-panel > p').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.main-panel > p').textContent})
            }
            return
        }
        if (document.querySelector('div.main-panel > span') != null) {
            if (document.querySelector('div.main-panel > span').textContent.includes('vote was success')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.main-panel > span').textContent})
            }
            return
        }

        if (document.querySelector('form[method="POST"] > button[type="submit"]').textContent.includes('Already Voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }

        if (first) return
        
        const nick = await getNickName()
        if (nick == null) return
        document.getElementById('username').value = nick
        document.querySelector('form[method="POST"] > button[type="submit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getNickName() {
    const storageArea = await new Promise(resolve=>{
        chrome.storage.local.get('storageArea', data=>{
            resolve(data['storageArea'])
        })
    })
    const projects = await new Promise(resolve=>{
        chrome.storage[storageArea].get('AVMRprojectsMCServers', data=>{
            resolve(data['AVMRprojectsMCServers'])
        })
    })
    for (const project of projects) {
        if (project.MCServers && document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
