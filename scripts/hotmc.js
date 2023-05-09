async function vote(first) {
    //Если успешное авто-голосование
    if (document.querySelector('.fullscreen-flash-message-container')) {
        const message = document.querySelector('.fullscreen-flash-message-container').innerText.trim()
        if (message.toLowerCase().includes('thank you for your vote') || message.toLowerCase().includes('спасибо за голосование')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message})
        }
        return
    }

    //Если вы уже голосовали
    if (document.querySelector('div[class="tabs-content-without-tabs"]') != null && document.querySelector('div[class="tabs-content-without-tabs"]').innerText.includes('Вы уже голосовали')) {
        let leftTime = parseInt(document.querySelector('span[class="time-left"]').innerText.match(/\d/g).join(''))
        leftTime = leftTime + 1
        leftTime = leftTime * 3600000
        chrome.runtime.sendMessage({later: Date.now() + leftTime})
        return
    }

    //Если есть ошибка
    if (document.querySelector('#w1 > div.error-message > div')) {
        const message = document.querySelector('#w1 > div.error-message > div').textContent
        //Если вы уже голосовали
        if (message.includes('Вы сможете повторно проголосовать')) {
            let leftTime = parseInt(message.match(/\d/g).join(''))
            leftTime = leftTime + 1
            leftTime = leftTime * 3600000
            chrome.runtime.sendMessage({later: Date.now() + leftTime})
            return
        } else if (message.includes('Я не робот') || message.includes('укажите ник')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            return
        }
    }

    if (first) return

    const project = await getProject('HotMC')
    document.querySelector('form[action*="/vote-"] #playercollector-nickname').value = project.nick
    document.querySelector('form[action*="/vote-"] button[type=submit]').click()
}