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
            const nick = await getNickName()
            if (nick == null || nick == '')
                return
            document.querySelector('input[name=nick]').value = nick
            document.querySelector('button[type=submit]').click()
        } else {
            setTimeout(()=>chrome.runtime.sendMessage({message: 'Ошибка, input[name=nick] является null'}), 10000)
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsMinecraftRating', data=>{
            resolve(data['AVMRprojectsMinecraftRating'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
