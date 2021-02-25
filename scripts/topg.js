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
                const numbers = document.querySelector('.alert.alert-warning').textContent.match(/\d+/g).map(Number)
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
                chrome.runtime.sendMessage({message: document.querySelector('.alert.alert-warning').textContent.trim()})
            }
            return
        } else if (document.querySelector('.alert.alert-success') != null && document.querySelector('.alert.alert-success').textContent.includes('voted successfully')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        
        if (first) return

        const nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.getElementById('game_user').value = nick
        document.querySelector('#vote button[type="submit"]').click()

    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsTopG', data=>{
            resolve(data['AVMRprojectsTopG'])
        })
    })
    for (const project of projects) {
        if (project.TopG && (document.URL.startsWith('https://topg.org/Minecraft/in-' + project.id))) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://topg.org/Minecraft/in-')) {
        chrome.runtime.sendMessage({errorVoteNoNick: document.URL})
    } else {
        chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
    }
}
