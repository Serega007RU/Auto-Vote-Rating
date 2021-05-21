window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (first) {
            document.querySelector('span[data-target="#voteModal"]').click()
            return
        }
        const project = await getProject()
        if (project == null) return
        if (document.getElementById("nickname") != null) {
            document.getElementById("nickname").value = project.nick
        } else {
            console.warn('[Auto Vote Minecraft Rating] Нет поля ввода никнейма')
        }
        document.querySelector("#voteModal > div.modal-dialog > div > div.modal-footer.clearfix > div.pull-right > a").click()
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
        chrome.storage[storageArea].get('AVMRprojectsTMonitoring', data=>{
            resolve(data['AVMRprojectsTMonitoring'])
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
        if (document.querySelector('div[class="message error"]') != null) {
            clearInterval(timer)
            if (document.querySelector('div[class="message error"]').textContent.includes('уже голосовали')) {
                const numbers = document.querySelector('div[class="message error"]').textContent.match(/\d+/g).map(Number)
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
                chrome.runtime.sendMessage({message: document.querySelector('div[class="message error"]').textContent})
            }
        } else if (document.querySelector('div[class="message success"]') != null) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
        clearInterval(timer)
    }
}, 1000)