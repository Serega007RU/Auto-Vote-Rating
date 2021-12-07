async function vote(first) {
    try {
        if (document.querySelector('#alert_box') != null) {
            analyseText(document.querySelector('#alert_box').textContent)
            return
        }

        if (first) return

        const project = await getProject('ServerListGames')
        document.querySelector('#username').value = project.nick
        document.querySelector('button.vote-button').click()
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    if (document.querySelector('#toast-container') != null) {
        analyseText(document.querySelector('#toast-container').textContent)
        clearInterval(timer)
    }
}, 500)

function analyseText(text) {
    if (text.includes('have successfully cast your vote')) {
        chrome.runtime.sendMessage({successfully: true})
    } else if (text.includes('You can vote again in') && /\d/.test(text)) {
        const numbers = text.match(/\d+/g).map(Number)
        let count = 0
        let hour = 0
        let min = 0
        let sec = 0
        for (const i in numbers) {
            if (count === 0) {
                hour = numbers[i]
            } else if (count === 1) {
                min = numbers[i]
            } else if (count === 1) {
                sec = numbers[i]
            }
            count++
        }
        const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
        const later = Date.now() + milliseconds
        chrome.runtime.sendMessage({later: later})
    } else {
        chrome.runtime.sendMessage({message: text})
    }
}