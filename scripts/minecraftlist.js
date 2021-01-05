window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        if (document.querySelector('p.notification.errormsg') != null) {
            if (document.querySelector('p.notification.errormsg').textContent.includes('You can vote after')) {
                //Из полученного текста достаёт все цифры в Array List
                let numbers = document.querySelector('p.notification.errormsg').textContent.match(/\d+/g).map(Number)
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
                chrome.runtime.sendMessage({message: document.querySelector('p.notification.errormsg').textContent})
            }
            return
        }
        if (document.querySelector('p.notification.successmsg') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) {
            return
        }
        let nick = await getNickName()
        if (nick == null || nick == '') return
        document.getElementById('voteusername').value = nick
        document.querySelector('form[method="POST"] > input[type="submit"]').click()
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftList', data=>{
            resolve(data['AVMRprojectsMinecraftList'])
        })
    })
    for (project of projects) {
        if (project.MinecraftList && document.URL.startsWith('https://minecraftlist.org/vote/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('https://minecraftlist.org/vote/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
