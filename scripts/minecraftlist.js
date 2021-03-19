window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.querySelector('p.notification.errormsg') != null) {
            if (document.querySelector('p.notification.errormsg').textContent.includes('You can vote after')) {
                //Из полученного текста достаёт все цифры в Array List
                const numbers = document.querySelector('p.notification.errormsg').textContent.match(/\d+/g).map(Number)
                let count = 0
                let hour = 0
                let min = 0
                let sec = 0
                for (const i in numbers) {
                    if (count == 0) {
                        hour = numbers[i]
                    } else if (count == 1) {
                        min = numbers[i]
                    }
                    count++
                }
                const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({later: later})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('p.notification.errormsg').textContent})
            }
            return
        }
        if (document.querySelector('p.notification.successmsg') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) {
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '') return
        document.getElementById('voteusername').value = nick
        document.querySelector('form[method="POST"] > input[type="submit"]').click()
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
        chrome.storage[storageArea].get('AVMRprojectsMinecraftList', data=>{
            resolve(data['AVMRprojectsMinecraftList'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
