window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (first) {
            document.querySelector('span[data-target="#voteModal"]').click()
            return
        }
        let nick = await getNickName()
        if (nick == null || nick == '')
            return
        if (document.getElementById("nickname") != null) {
            document.getElementById("nickname").value = nick
        } else {
            console.warn('[Auto Vote Minecraft Rating] Нет поля ввода никнейма')
        }
        document.querySelector("#voteModal > div.modal-dialog > div > div.modal-footer.clearfix > div.pull-right > a").click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsTMonitoring', data=>{
            resolve(data['AVMRprojectsTMonitoring'])
        })
    })
    for (project of projects) {
        if (project.TMonitoring && document.URL.startsWith('https://tmonitoring.com/server/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://tmonitoring.com/server/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}

this.check = setInterval(()=>{
    if (document.querySelector('div[class="message error"]') != null) {
        clearInterval(this.check)
        if (document.querySelector('div[class="message error"]').textContent.includes('уже голосовали')) {
            let numbers = document.querySelector('div[class="message error"]').textContent.match(/\d+/g).map(Number)
            let count = 0
            let hour = 0
            let min = 0
            let sec = 0
            for (var i in numbers) {
                if (count == 0) {
                    hour = numbers[i]
                } else if (count == 1) {
                    min = numbers[i]
                }
                count++
            }
            var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
            var later = Date.now() + milliseconds
            chrome.runtime.sendMessage({later: later})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div[class="message error"]').textContent})
        }
    } else if (document.querySelector('div[class="message success"]') != null) {
        clearInterval(this.check)
        chrome.runtime.sendMessage({successfully: true})
    }
}, 1000)