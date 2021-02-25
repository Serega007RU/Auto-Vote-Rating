window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.getElementById('first_auth_vk') != null) {
            document.getElementById('first_auth_vk').click()
            return
        }

        if (first) {
            return
        }

        const nick = await getNickName()
        if (nick == null) return
        document.getElementById('char_name').value = nick
        document.getElementById('captcha_button').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsQTop', data=>{
            resolve(data['AVMRprojectsQTop'])
        })
    })
    for (const project of projects) {
        if (project.QTop && document.URL.startsWith('http://q-top.ru/vote' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('http://q-top.ru/vote')) {
        chrome.runtime.sendMessage({errorVoteNoNick: document.URL})
    } else {
        chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
    }
}

const timer = setInterval(()=> {
    try {
        if (document.querySelector('.error_window') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('.error_window').innerText})
            clearInterval(timer)
        } else if (document.querySelector('.info_window') != null) {
            if (document.querySelector('.info_window').innerText.includes('Вы сможете проголосовать завтра')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('.info_window').innerText})
            }
            clearInterval(timer)
        } else if (document.querySelector('.ok_window') != null) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}, 1000)