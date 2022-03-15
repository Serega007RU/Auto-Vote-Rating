async function vote(first) {
    if (first) {
        document.querySelector('span[data-target="#voteModal"]').click()
        return
    }
    const project = await getProject('TMonitoring')
    if (document.getElementById("nickname") != null) {
        document.getElementById("nickname").value = project.nick
    } else {
        console.warn('[Auto Vote Rating] Нет поля ввода никнейма')
    }
    document.querySelector("#voteModal > div.modal-dialog > div > div.modal-footer.clearfix > div.pull-right > a").click()
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div[class="message error"]') != null) {
            clearInterval(timer)
            if (document.querySelector('div[class="message error"]').textContent.includes('уже голосовали')) {
                const numbers = document.querySelector('div[class="message error"]').textContent.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
                chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div[class="message error"]').textContent})
            }
        } else if (document.querySelector('div[class="message success"]') != null) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)