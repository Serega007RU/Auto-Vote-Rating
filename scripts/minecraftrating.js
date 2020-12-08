vote()
async function vote() {
    if (document.URL.includes('.vk')) {
        chrome.runtime.sendMessage({errorAuthVK: true})
        return
    }
    try {
        if (document.querySelector('div.alert.alert-danger') != null) {
            if (document.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
//                    var numbers = document.querySelector('div.alert.alert-danger').textContent.match(/\d+/g).map(Number)
//                    var count = 0
//                    var year = 0
//                    var month = 0
//                    var day = 0
//                    var hour = 0
//                    var min = 0
//                    var sec = 0
//                    for (var i in numbers) {
//                        if (count == 0) {
//                            hour = numbers[i]
//                        } else if (count == 1) {
//                            min = numbers[i]
//                        } else if (count == 2) {
//                            sec = numbers[i]
//                        } else if (count == 3) {
//                            day = numbers[i]
//                        } else if (count == 4) {
//                            month = numbers[i]
//                        } else if (count == 5) {
//                            year = numbers[i]
//                        }
//                        count++
//                    }
//                    var later = Date.UTC(year, month - 1, day, hour, min, sec, 0) - 86400000 - 10800000
                chrome.runtime.sendMessage({later: true})
            }
        } else if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('input[name=nick]') != null) {
            let nick = await getNickName()
            if (nick == null || nick == '')
                return
            document.querySelector('input[name=nick]').value = nick
            document.querySelector('button[type=submit]').click()
        } else {
            setTimeout(()=>chrome.runtime.sendMessage({message: 'Ошибка, input[name=nick] является null'}), 10000)
        }
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}

async function getNickName() {
    let projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftRating', data=>{
            resolve(data['AVMRprojectsMinecraftRating'])
        })
    })
    for (project of projects) {
        if (project.MinecraftRating && document.URL.startsWith('http://minecraftrating.ru/projects/' + project.id)) {
            return project.nick
        }
    }
    if (!document.URL.startsWith('http://minecraftrating.ru/projects/')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}
