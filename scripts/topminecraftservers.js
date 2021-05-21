vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('body > div.container > div > div > div.alert.alert-danger') != null) {
            if (document.querySelector('body > div.container > div > div > div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('body > div.container > div > div > div.alert.alert-danger').textContent})
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
                    if (document.querySelector('input[name="token"]') != null && document.querySelector('input[name="token"]').value != '') {
                        clearInterval(timer)
                        const project = await getProject()
                        if (project == null) return
                        document.getElementById('username').value = project.nick
                        document.getElementById('voteButton').click()
                    }
                } catch (e) {
                    chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
                    clearInterval(timer)
                }
            }, 1000)
        }
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
        chrome.storage[storageArea].get('AVMRprojectsTopMinecraftServers', data=>{
            resolve(data['AVMRprojectsTopMinecraftServers'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
