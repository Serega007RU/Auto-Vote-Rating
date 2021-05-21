vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('Successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('You already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        const project = await getProject()
        if (project == null) return
        if (document.querySelector('#submit_vote_form > input[name="mcname"]') != null) {
            document.querySelector('#submit_vote_form > input[name="mcname"]').value = project.nick
        } else {
            console.warn('Не удалось найти поле для никнейма, возможно это голосование без награды')
        }
        document.querySelector('#submit_vote_form > input[type="submit"]').click()
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
        chrome.storage[storageArea].get('AVMRprojectsPlanetMinecraft', data=>{
            resolve(data['AVMRprojectsPlanetMinecraft'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
