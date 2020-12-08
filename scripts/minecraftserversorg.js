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
        //Если вы уже голосовали
        if (document.getElementById('error-message') != null) {
            if (document.getElementById('error-message').textContent.includes('You already voted today')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            chrome.runtime.sendMessage({message: document.getElementById('error-message').textContent})
            return
        }
        if (document.querySelector('#single > div.flash') != null) {
            if (document.querySelector('#single > div.flash').textContent.includes('You must wait until tomorrow before voting again')) {
                chrome.runtime.sendMessage({later: true})
                return
            }
            //Если успешное автоголосование
            if (document.querySelector('#single > div.flash').textContent.includes('Thanks for voting')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('#single > div.flash').textContent})
            return
        }
        //Если не удалось пройти капчу
        if (document.querySelector('#field-container > form > span') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('#field-container > form > span').textContent})
            return
        }
        if (first) {
            return
        }
        let nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.querySelector('#field-container > form > ul > li > input').value = nick
        document.querySelector('#field-container > form > button').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftServersOrg', data=>{
            resolve(data['AVMRprojectsMinecraftServersOrg'])
        })
    })
    for (project of projects) {
        if (project.MinecraftServersOrg && document.URL.startsWith('https://minecraftservers.org/vote/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://minecraftservers.org/vote/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
