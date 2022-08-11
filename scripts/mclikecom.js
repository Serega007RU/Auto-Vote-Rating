async function vote(first) {
    //Если успешное авто-голосование
    if (document.querySelector('.fullscreen-flash-message-container')) {
        const message = document.querySelector('.fullscreen-flash-message-container').innerText.trim()
        if (message.toLowerCase().includes('cпасибо за голосование')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    //Если вы уже голосовали
    if (document.querySelector('div[class="tabs-content-without-tabs"]') != null && document.querySelector('div[class="tabs-content-without-tabs"]').innerText.includes('have already voted recently')) {
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

    if (first) return

    const project = await getProject('MCLikeCom')
    document.querySelector('#playercollector-nickname').value = project.nick
    document.querySelector('#w0 button[type=submit]').click()
}