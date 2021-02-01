window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
//Совместимость с Rocket Loader
document.addEventListener('DOMContentLoaded', (event)=>{
    vote(true)
})

async function vote(first) {
    try {
        if (document.querySelector('div.main-panel > p') != null) {
            if (document.querySelector('div.main-panel > p').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.main-panel > p').textContent})
            }
            return
        }
        if (document.querySelector('div.main-panel > span') != null) {
            if (document.querySelector('div.main-panel > span').textContent.includes('vote was success')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.main-panel > span').textContent})
            }
            return
        }

        if (document.querySelector('form[method="POST"] > button[type="submit"]').textContent.includes('Already Voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }

        if (first) {
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '') return
        document.getElementById('username').value = nick
        document.querySelector('form[method="POST"] > button[type="submit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMCServers', data=>{
            resolve(data['AVMRprojectsMCServers'])
        })
    })
    for (const project of projects) {
        if (project.MCServers && document.URL.startsWith('https://mc-servers.com/mcvote/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://mc-servers.com/mcvote/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
