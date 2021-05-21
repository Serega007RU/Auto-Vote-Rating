window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

async function vote(first) {
    try {
        //Если пользователь не авторизован
        if (document.querySelector('div[class="notification is-primary text-center"]') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div[class="notification is-primary text-center"]').innerText})
            return
        }
        //Если есть ошибка
        if (document.querySelector('div[class="notification is-danger"]') != null) {
            //Если не удалось пройти капчу
            if (document.querySelector('div[class="notification is-danger"]').textContent != null) {
                chrome.runtime.sendMessage({message: document.querySelector('div[class="notification is-danger"]').textContent})
            }
            return
        }
        //Если успешное автоголосование
        if (document.querySelector('div[class="notification is-success has-text-centered"]') != null) {
            if (document.querySelector('div[class="notification is-success has-text-centered"]').textContent.includes('Голос засчитан')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (document.querySelector('div[class="notification is-success has-text-centered"]').textContent.includes('Вы уже голосовали')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div[class="notification is-success has-text-centered"]').textContent})
            }
            return
        }

        if (first) return
        
        const nick = await getNickName()
        if (nick == null) return
        document.querySelector('input[name=nickname]').value = nick
        document.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div > form > div.flex.my-1 > div.w-2\\/5 > button').click()
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
    }
}

async function getNickName() {
    const storageArea = await new Promise(resolve=>{
        chrome.storage.local.get('storageArea', data=>{
            resolve(data['storageArea'])
        })
    })
    const projects = await new Promise(resolve=>{
        chrome.storage[storageArea].get('AVMRprojectsIonMc', data=>{
            resolve(data['AVMRprojectsIonMc'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}
