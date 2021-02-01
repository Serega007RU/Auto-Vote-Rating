window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        //Если вы уже голосовали
        if (document.querySelector('div[class="tabs-content-without-tabs"]') != null && document.querySelector('div[class="tabs-content-without-tabs"]').innerText.includes('Вы уже голосовали')) {
            let leftTime = parseInt(document.querySelector('span[class="time-left"]').innerText.match(/\d/g).join(''))
            leftTime = leftTime + 1
            leftTime = leftTime * 3600000
            chrome.runtime.sendMessage({later: Date.now() + leftTime})
            return
        }
        //Если есть ошибка
        if (document.querySelector('#w1 > div.error-message > div') != null) {
            //Если вы уже голосовали
            if (document.querySelector('#w1 > div.error-message > div').textContent.includes('Вы сможете повторно проголосовать')) {
                let leftTime = parseInt(document.querySelector('#w1 > div.error-message > div').textContent.match(/\d/g).join(''))
                leftTime = leftTime + 1
                leftTime = leftTime * 3600000
                chrome.runtime.sendMessage({later: Date.now() + leftTime})
                return
            }
            chrome.runtime.sendMessage({message: document.querySelector('#w1 > div.error-message > div').textContent})
            return
        }
        //Если успешное авто-голосование
        if (document.querySelector('body > div.wrapper > div.all_content > div > h1') != null && document.querySelector('body > div.wrapper > div.all_content > div > h1').textContent.includes('Спасибо за голосование')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (first) {
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '')
            return
        document.querySelector('#playercollector-nickname').value = nick
        document.querySelector('#w0 > div:nth-child(4) > button').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsHotMC', data=>{
            resolve(data['AVMRprojectsHotMC'])
        })
    })
    for (const project of projects) {
        if (project.HotMC && document.URL.startsWith('https://hotmc.ru/vote-' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://hotmc.ru/vote-')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
