window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        //Если вы уже голосовали
        if (document.getElementById('error-message') != null) {
            if (document.getElementById('error-message').textContent.includes('You already voted today')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.getElementById('error-message').textContent})
            return
        }
        if (document.querySelector('#single > div.flash') != null) {
            if (document.querySelector('#single > div.flash').textContent.includes('You must wait until tomorrow before voting again')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            //Если успешное автоголосование
            if (document.querySelector('#single > div.flash').textContent.includes('Thanks for voting')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('#single > div.flash').textContent})
            return
        }
        //Если не удалось пройти капчу
        if (document.querySelector('#field-container > form > span') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('#field-container > form > span').textContent})
            return
        }

        if (first) return
        
        const nick = await getNickName()
        if (nick == null) return
        document.querySelector('#field-container > form > ul > li > input').value = nick
        document.querySelector('#field-container > form > button').click()
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
        chrome.storage[storageArea].get('AVMRprojectsMinecraftServersOrg', data=>{
            resolve(data['AVMRprojectsMinecraftServersOrg'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
