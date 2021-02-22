window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        //Если есть ошибка
        if (document.querySelector('#cookies-message > div') != null) {
            //Если вы уже голосовали
            if (document.querySelector('#cookies-message > div').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
                //Если успешное автоголосование
            } else if (document.querySelector('#cookies-message > div').textContent.includes('successfully voted')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('#cookies-message > div').textContent})
                return
            }
        }
        if (first) {
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.getElementById('vote_username').value = nick
        document.querySelector('input[name="commit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftServersBiz', data=>{
            resolve(data['AVMRprojectsMinecraftServersBiz'])
        })
    })
    for (const project of projects) {
        if (project.MinecraftServersBiz && document.URL.startsWith('https://minecraftservers.biz/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://minecraftservers.biz/')) {
        chrome.runtime.sendMessage({errorVoteNoNick: document.URL})
    } else {
        chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
    }
}
