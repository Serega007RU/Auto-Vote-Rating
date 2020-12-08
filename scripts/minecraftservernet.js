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
        //Если есть сообщение
        if (document.querySelector('h4[class="alert-heading text-center"]') != null) {
            if (document.querySelector('h4[class="alert-heading text-center"]').textContent.includes('Vote Successful')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }
            if (document.querySelector('h4[class="alert-heading text-center"]').textContent.includes('Vote Un-successful')) {
                if (document.querySelector('h4[class="alert-heading text-center"]').nextElementSibling.textContent.includes('already voting')) {
                    chrome.runtime.sendMessage({later: Date.now() + 86400000})
                    //+ 24 часа
                    return
                }
            }
            chrome.runtime.sendMessage({message: document.querySelector('h4[class="alert-heading text-center"]').nextElementSibling.textContent})
            return
        }
        if (first) {
            return
        }
        let nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.getElementById('mc_user').value = nick
        document.getElementById('rate-10').click()
        document.querySelector('input[value="Confirm Vote"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftServerNet', data=>{
            resolve(data['AVMRprojectsMinecraftServerNet'])
        })
    })
    for (project of projects) {
        if (project.MinecraftServerNet && document.URL.startsWith('https://minecraft-server.net/vote/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://minecraft-server.net/vote/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
