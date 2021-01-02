vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        //Если мы находимся на странице проверки ReCaptcha
        if (document.querySelector("body > iframe") != null && document.querySelector("body > iframe").src.startsWith('https://geo.captcha-delivery.com/captcha/')) {
            return
        }
        //Пилюля от жадности
        if (document.getElementById('adblock-notice') != null) document.getElementById('adblock-notice').style.display = 'none'
        if (document.getElementById('vote-loading-block') != null) document.getElementById('vote-loading-block').style.display = 'none'
        if (document.getElementById('vote-form-block') != null) document.getElementById('vote-form-block').removeAttribute('style')
        if (document.getElementById('blocked-notice') != null) document.getElementById('blocked-notice').style.display = 'none'
        
        if ((document.querySelector('body > div.content > div > div.row > div.col-xs-7 > p:nth-child(4) > strong') != null && document.querySelector('body > div.content > div > div.row > div.col-xs-7 > p:nth-child(4) > strong').textContent.includes('Thank you for your vote')) || (document.querySelector('strong') != null && document.querySelector('strong').textContent.includes('Thank you for your vote')) || (document.querySelector('h1') != null && document.querySelector('h1').nextElementSibling != null && document.querySelector('h1').nextElementSibling.nextElementSibling != null && document.querySelector('h1').nextElementSibling.nextElementSibling.textContent.includes('Thank you for your vote'))) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (document.querySelector('#vote_form > div.alert.alert-danger') != null) {
            if (document.querySelector('#vote_form > div.alert.alert-danger').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('#vote_form > div.alert.alert-danger').textContent})
            }
            return
        } else if (document.querySelector('body > iframe') != null) {
            return
        }
        let nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.getElementById('accept').checked = true
        document.getElementById('nickname').value = nick
        document.getElementById('voteBtn').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftMp', data=>{
            resolve(data['AVMRprojectsMinecraftMp'])
        })
    })
    for (project of projects) {
        if (project.MinecraftMp && (document.URL.startsWith('https://minecraft-mp.com/server/' + project.id))) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://minecraft-mp.com/server/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
