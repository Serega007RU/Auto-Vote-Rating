window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        //Если идёт проверка CloudFlare
        if (document.querySelector('#cf-content > h1 > span') != null) {
            return
        }
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        //Ессли есть ошибка
        if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger') != null) {
            //Если не удалось пройти капчу
            if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent.includes('captcha')) {
                chrome.runtime.sendMessage({message: document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent})
                //Если вы уже голосовали
            } else if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent.includes('Vous avez déjà voté pour ce serveur')) {
                const numbers = document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent.match(/\d+/g).map(Number)
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
                const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({later: later})
                //Что?
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent})
            }
            return
        }
        //Если успешное автоголосование
        if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (first) {
            return
        }
        const nick = await getNickName()
        if (nick == null)
            return
        document.querySelector('#c > div > div > div.bvt > form > input.pseudov').value = nick
        document.querySelector('#c > div > div > div.bvt > form > button').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}

async function getNickName() {
    const projects = await new Promise(resolve=>{
        chrome.storage.local.get('AVMRprojectsServeurPrive', data=>{
            resolve(data['AVMRprojectsServeurPrive'])
        })
    })
    for (const project of projects) {
        if (project.ServeurPrive && document.URL.includes((project.game == null ? 'minecraft' : project.game)) && document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
