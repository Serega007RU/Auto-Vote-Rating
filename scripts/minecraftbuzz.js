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

        if (first) {
            return
        }

        const nick = await getNickName()
        if (nick == null) return
        document.getElementById('review-check').checked = false
        document.getElementById('username-input').value = nick
        document.querySelector('#vote button[type="submit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftBuzz', data=>{
            resolve(data['AVMRprojectsMinecraftBuzz'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}

const timer = setInterval(()=>{
    if (document.getElementById('message') != null) {
        if (document.getElementById('message').textContent.includes('Thank you for voting')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.getElementById('message').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.getElementById('message').textContent.trim()})
        }
        clearInterval(timer)
    }
}, 1000)