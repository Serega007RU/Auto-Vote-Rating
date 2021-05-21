window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.querySelector('div.box.error') != null) {
            if (document.querySelector('div.box.error').textContent.includes('Du hast heute schon')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.box.error').textContent})
            return
        }
        if (document.querySelector('div.box.success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }


        if (first) return

        const project = await getProject()
        if (project == null) return
        document.querySelector('input[name="spieler"]').value = project.nick
        document.querySelector('#vote_form a.button').click()
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
        chrome.storage[storageArea].get('AVMRprojectsServerListe', data=>{
            resolve(data['AVMRprojectsServerListe'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}