vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('Successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('You already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        let nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.querySelector('#submit_vote_form > input[type=text]:nth-child(1)').value = nick
        document.querySelector('#submit_vote_form > input.r3submit').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsPlanetMinecraft', data=>{
            resolve(data['AVMRprojectsPlanetMinecraft'])
        })
    })
    for (project of projects) {
        if (project.PlanetMinecraft && (document.URL.startsWith('https://www.planetminecraft.com/server/' + project.id))) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://www.planetminecraft.com/server/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
