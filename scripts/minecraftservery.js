window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.querySelector('article.message.is-success') != null && document.querySelector('article.message.is-success').textContent.includes('Úspěšně jste zahlasoval')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('article.message.is-danger') != null) {
            if (document.querySelector('article.message.is-danger').textContent.includes('Hlasovat můžete až')) {
                chrome.runtime.sendMessage({later: Date.now() + 7200000})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('article.message.is-danger').textContent})
            }
            return
        }

        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }

        if (first) {
            document.getElementById('vote-modal').previousElementSibling.click()
            return
        }
        let nick = await getNickName()
        if (!nick) return
        document.querySelector('input[name="nickname"]').value = nick
        document.querySelector('input[name="vote"]').click()
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
        chrome.storage[storageArea].get('AVMRprojectsMinecraftServery', data=>{
            resolve(data['AVMRprojectsMinecraftServery'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
