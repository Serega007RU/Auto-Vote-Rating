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
        let nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.getElementById('vote_username').value = nick
        document.querySelector('input[name="commit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftServersBiz', data=>{
            resolve(data['AVMRprojectsMinecraftServersBiz'])
        })
    })
    for (project of projects) {
        if (project.MinecraftServersBiz && document.URL.startsWith('https://minecraftservers.biz/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://minecraftservers.biz/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
