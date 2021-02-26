window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('Již jsi hlasoval vrať se znovu za 2 hodiny')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }
        if (document.querySelector('div.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) {
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '') return
        document.querySelector('input[name="username"]').value = nick
        document.querySelector('form[method="post"] > button[type="submit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
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
