window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').parentElement.style.display != 'none') {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').parentElement.style.display != 'none') {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }

        document.querySelector('a[data-target="#vote"]').click()
        
        if (first) return
        
        const project = await getProject()
        if (project == null) return
        document.querySelector('input[name="username"]').value = project.nick
        document.querySelector('form.vote button[type="submit"]').click()
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
        chrome.storage[storageArea].get('AVMRprojectsTrackyServer', data=>{
            resolve(data['AVMRprojectsTrackyServer'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}

const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').parentElement.style.display != 'none') {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.alert.alert-danger') != null && document.querySelector('div.alert.alert-danger').parentElement.style.display != 'none') {
            clearInterval(timer)
            if (document.querySelector('div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
        clearInterval(timer)
    }
}, 100)