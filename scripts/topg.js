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

        if (document.querySelector('body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong') != null && document.querySelector('body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong').textContent.includes('You have voted successfully!')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('#voting > div > div > div:nth-child(3) > p') != null && document.querySelector('#voting > div > div > div:nth-child(3) > p').textContent.includes('You have already voted!')) {
            const numbers = document.querySelector('#voting > div > div > div:nth-child(3) > p').textContent.match(/\d+/g).map(Number)
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
