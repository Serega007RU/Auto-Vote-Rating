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

        if (document.querySelector('.alert.alert-danger') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-danger').textContent.trim()})
            return
        } else if (document.querySelector('.alert.alert-warning') != null) {
            if (document.querySelector('.alert.alert-warning').textContent.includes('already voted')) {
                let hour = 0
                let min = 0
                let sec = 0
                if (document.querySelector('.alert.alert-warning').textContent.match(/\d+ hour/g) != null) {
                    hour = Number(document.querySelector('.alert.alert-warning').textContent.match(/\d+ hour/g)[0].match(/\d+/g)[0])
                }
                if (document.querySelector('.alert.alert-warning').textContent.match(/\d+ min/g) != null) {
                    min = Number(document.querySelector('.alert.alert-warning').textContent.match(/\d+ min/g)[0].match(/\d+/g)[0])
                }
                if (document.querySelector('.alert.alert-warning').textContent.match(/\d+ sec/g) != null) {
                    sec = Number(document.querySelector('.alert.alert-warning').textContent.match(/\d+ sec/g)[0].match(/\d+/g)[0])
                }
                const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({later: later})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-warning').textContent.trim()})
            }
            return
        } else if (document.querySelector('.alert.alert-success') != null && document.querySelector('.alert.alert-success').textContent.includes('voted successfully')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        
        if (first) return

        const project = await getProject()
        if (project == null) return
        document.getElementById('game_user').value = project.nick
        document.querySelector('#vote button[type="submit"]').click()

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
        chrome.storage[storageArea].get('AVMRprojectsTopG', data=>{
            resolve(data['AVMRprojectsTopG'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
