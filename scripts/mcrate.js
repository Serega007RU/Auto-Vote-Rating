vote()
function vote() {
    chrome.storage.local.get('AVMRprojectsMCRate', function(result) {
        if (document.URL.includes('.vk')) {
            chrome.runtime.sendMessage({errorAuthVK: true})
            return
        }
        try {
            //Если мы находимся на странице проверки CloudFlare
            if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
                return
            }
            //Авторизован ли пользователь в вк?
            if (document.querySelector('a[class=vk_authorization]') != null) {
                document.querySelector('a[class=vk_authorization]').click()
            } else if (document.querySelector('input[name=login_player]') != null) {
                //Ввод ника и голосование
                let nick = getNickName(result.AVMRprojectsMCRate)
                if (nick == null || nick == '')
                    return
                document.querySelector('input[name=login_player]').value = nick
                document.querySelector('span[id=buttonrate]').click()
            } else if (document.querySelector('div[class=report]') != null) {
                if (document.querySelector('div[class=report]').textContent.includes('Ваш голос засчитан')) {
                    chrome.runtime.sendMessage({successfully: true})
                } else {
                    chrome.runtime.sendMessage({message: document.querySelector('div[class=report]').textContent})
                }
            } else if (document.querySelector('span[class=count_hour]') != null) {
//                this.check = setInterval(()=>{
//                    //Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
//                    var hour = parseInt(document.querySelector('span[class=count_hour]').textContent)
//                    var min = parseInt(document.querySelector('span[class=count_min]').textContent)
//                    var sec = parseInt(document.querySelector('span[class=count_sec]').textContent)
//                    var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
//                    if (milliseconds == 0) return
//                    var later = Date.now() - (86400000 - milliseconds)
//                    clearInterval(this.check)
//                    chrome.runtime.sendMessage({later: later})
//                }, 2000)
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({errorVoteNoElement: true})
            }
        } catch (e) {
            if (document.URL.startsWith('chrome-error') || document.querySelector('#error-information-popup-content > div.error-code') != null) {
                chrome.runtime.sendMessage({message: 'Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector('#error-information-popup-content > div.error-code').textContent})
            } else {
                chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
            }
        }
    })
}

function getNickName(projects) {
    for (project of projects) {
        if (project.MCRate && (document.URL.startsWith('http://mcrate.su/rate/' + project.id) || document.URL.startsWith('http://mcrate.su/add/rate?idp=' + project.id + '&code='))) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('http://mcrate.su/rate/') && !document.URL.startsWith('http://mcrate.su/add/rate?idp=')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
