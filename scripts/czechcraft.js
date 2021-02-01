window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.querySelector('div.alert.alert-danger') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-danger').textContent})
            return
        }
        if (document.querySelector('div.alert.alert-error') != null) {
            if (document.querySelector('div.alert.alert-error').textContent.includes('Již si hlasoval')) {
                const numbers = document.querySelector('div.alert.alert-error').textContent.match(/\d+/g).map(Number)
                let count = 0
                let hour = 0
                let min = 0
                let sec = 0
                for (const i in numbers) {
                    if (count == 0) {
                        hour = numbers[i]
                    } else if (count == 1) {
                        min = numbers[i]
                    } else if (count == 2) {
                        sec = numbers[i]
                    }
                    count++
                }
                let time = new Date()
                if (time.getUTCHours() > hour || (time.getUTCHours() == hour && time.getUTCMinutes() >= min) || (time.getUTCHours() == hour && time.getUTCMinutes() == min && time.getUTCMinutes() >= sec)) {
                    time.setUTCDate(time.getUTCDate() + 1)
                }
                time.setUTCHours(hour, min, sec, 0)
                chrome.runtime.sendMessage({later: time.getTime()})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.alert.alert-error').textContent})
            }
            return
        }
        if (document.querySelector('div.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) {
            return
        }
        const nick = await getNickName()
        if (nick == null || nick == '') return
        document.getElementById('username').value = nick
        document.getElementById('privacy').checked = true
        document.querySelector('form[method="post"] > button.button').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsCzechCraft', data=>{
            resolve(data['AVMRprojectsCzechCraft'])
        })
    })
    for (const project of projects) {
        if (project.CzechCraft && document.URL.startsWith('https://czech-craft.eu/server/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://czech-craft.eu/server/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
