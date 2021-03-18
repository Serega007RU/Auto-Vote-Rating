//Костыль, чо ещё поделаешь с говно кодом сайта
setTimeout(()=>{vote()}, 3000)

async function vote() {
    try {
        const nick = await getNickName()
        if (nick == null || nick == '') return
        document.getElementById('username').value = nick
        document.getElementById('btn').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMCServerList', data=>{
            resolve(data['AVMRprojectsMCServerList'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').textContent != '') {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('Již jsi hlasoval vrať se znovu za 2 hodiny')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            }
            clearInterval(timer)
        }
        if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-danger').textContent != '') {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
        clearInterval(timer)
    }
}, 1000)
