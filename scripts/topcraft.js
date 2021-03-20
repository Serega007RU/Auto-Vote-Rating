vote()
async function vote() {
    if (document.URL.includes('.vk')) {
        chrome.runtime.sendMessage({errorAuthVK: true})
        return
    }
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        //Если погльзователь уже авторизован в вк, сразу голосует
        if (document.querySelector('button[data-type=vote]') == null) {
            //Клик 'Голосовать'
            document.querySelector('button.btn.btn-info.btn-vote.openVoteModal').click()
            //Вводит никнейм
            const nick = await getNickName()
            if (nick == null || nick == '')
                return
            document.querySelector('input[name=nick]').value = nick
            //Клик 'Голосовать' в окне голосования
            document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
        } else {
            document.querySelector('button[data-type=vote]').click()
            //Надо ли авторизовываться в вк, если не надо то сразу голосует
            if (document.querySelector('#loginModal > div.modal-dialog > div > div.modal-body > div > ul > li > a > i') != null) {
                //Клик VK
                document.querySelector('#loginModal > div.modal-dialog > div > div.modal-body > div > ul > li > a > i').click()
                clearInterval(timer)
            } else {
                const nick = await getNickName()
                if (nick == null || nick == '')
                    return
                document.querySelector('input[name=nick]').value = nick
                document.querySelector('button.btn.btn-info.btn-vote.voteBtn').click()
            }
        }
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
        chrome.storage[storageArea].get('AVMRprojectsTopCraft', data=>{
            resolve(data['AVMRprojectsTopCraft'])
        })
    })
    for (const project of projects) {
        if (document.URL.includes(project.id)) {
            return project.nick
        }
    }

    chrome.runtime.sendMessage({errorVoteNoNick2: document.URL})
}

const timer = setInterval(()=>{
    try {
        //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
        if (document.readyState == 'complete' && document.querySelectorAll('div[class=tooltip-inner]').item(0) != null) {
            const textContent = document.querySelectorAll('div[class=tooltip-inner]').item(0).textContent
            if (textContent.includes('Сегодня Вы уже голосовали')) {
                chrome.runtime.sendMessage({later: true})
            } else if (textContent.includes('Спасибо за Ваш голос, Вы сможете повторно проголосовать завтра.')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message: textContent})
            }
            clearInterval(timer)
        }
    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack + (document.body.textContent.trim().length < 500 ? ' ' + document.body.textContent.trim() : '')})
        clearInterval(timer)
    }
}, 1000)
