vote()
async function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong') != null && document.querySelector('body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong').textContent.includes('You have voted successfully!')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('#voting > div > div > div:nth-child(3) > p') != null && document.querySelector('#voting > div > div > div:nth-child(3) > p').textContent.includes('You have already voted!')) {
            const numbers = document.querySelector('#voting > div > div > div:nth-child(3) > p').textContent.match(/\d+/g).map(Number)
            let count = 0
            let hour = 0
            let min = 0
            let sec = 0
            for (const i in numbers) {
                if (count == 0) {
                    hour = numbers[i]
                } else if (count == 1) {
                    min = numbers[i]
                }
                count++
            }
            const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
            const later = Date.now() + milliseconds
            chrome.runtime.sendMessage({later: later})
        } else if (document.getElementById('vtx') != null && document.getElementById('vtx').textContent.includes('Submit your vote') && document.getElementById('game_user').value.length == 0) {
            clearInterval(this.check)
            const nick = await getNickName()
            if (nick == null || nick == '')
                return
            document.getElementById('game_user').value = nick
            document.getElementById('vtx').click()
        }
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsTopG', data=>{
            resolve(data['AVMRprojectsTopG'])
        })
    })
    for (const project of projects) {
        if (project.TopG && (document.URL.startsWith('https://topg.org/Minecraft/in-' + project.id))) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://topg.org/Minecraft/in-')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}

this.check = setInterval(()=>{
    //Ждёт готовности кнопки 'Submit your vote'
    if (document.readyState == 'complete' && document.getElementById('vtx') != null && document.getElementById('vtx').textContent.includes('Submit your vote')) {
        clearInterval(this.check)
        vote()
    }
}, 1000)
