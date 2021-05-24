async function vote(first) {
    try {
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
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('div[class="message error"]') != null) {
            clearInterval(timer)
            if (document.querySelector('div[class="message error"]').textContent.includes('уже голосовали')) {
                const numbers = document.querySelector('div[class="message error"]').textContent.match(/\d+/g).map(Number)
                let count = 0
                let hour = 0
                let min = 0
                let sec = 0
                for (const i in numbers) {
                    if (count == 0) {
                        hour = numbers[i]
                    } else if (count == 1) {
                        min = numbers[i]
                    }
                    count++
                }
                const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({later: later})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div[class="message error"]').textContent})
            }
        } else if (document.querySelector('div[class="message success"]') != null) {
            chrome.runtime.sendMessage({successfully: true})
            clearInterval(timer)
        }
    } catch (e) {
        throwError(e)
        clearInterval(timer)
    }
}, 1000)