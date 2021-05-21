vote()
async function vote() {
    try {
        //Если идёт проверка CloudFlare
        if (document.querySelector('#cf-content > h1 > span') != null) {
            return
        }
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        
        //К чему это ожидание?
        if (document.getElementById('infoMessage') != null) document.getElementById('infoMessage').style.display = 'none'
        if (document.getElementById('inputFields') != null) document.getElementById('inputFields').removeAttribute('style')
        
        if (document.querySelector('div.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }

        const project = await getProject()
        if (project == null) return
        document.getElementById('playername').value = project.nick
        document.getElementById('captcha').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getProject() {
    const storageArea = await new Promise(resolve=>{
        chrome.storage.local.get('storageArea', data=>{
            resolve(data['storageArea'])
        })
    })
    const projects = await new Promise(resolve=>{
        chrome.storage[storageArea].get('AVMRprojectsMinecraftServerEu', data=>{
            resolve(data['AVMRprojectsMinecraftServerEu'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}