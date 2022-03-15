async function vote(first) {
    try {
        const project = await getProject('MinecraftRating')
        if (project.game === 'projects') {
            if (first === false) return
            if (document.querySelector('div.alert.alert-danger') != null) {
                if (document.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
                    chrome.runtime.sendMessage({later: true})
                }
            } else if (document.querySelector('div.alert.alert-success') != null && document.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (document.querySelector('input[name=nick]') != null) {
                document.querySelector('input[name=nick]').value = project.nick
                document.querySelector('button[type=submit]').click()
            } else {
                setTimeout(()=>chrome.runtime.sendMessage({message: 'Ошибка, input[name=nick] является null'}), 10000)
            }
        } else {
            const timer = setInterval(()=>{
                if (document.querySelector('#msgBox').textContent.length > 0) {
                    if (document.querySelector('#msgBox').textContent.includes('Спасибо за Ваш голос')) {
                        chrome.runtime.sendMessage({successfully: true})
                    } else if (document.querySelector('#msgBox').textContent.includes('уже голосовали')) {
                        const numbers = document.querySelector('#msgBox').textContent.match(/\d+/g).map(Number)
                        chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] -1, numbers[0], numbers[3], numbers[4], numbers[5]) - 10800000 + 60000})
                    } else {
                        chrome.runtime.sendMessage({message: document.querySelector('#msgBox').textContent})
                    }
                    clearInterval(timer)
                }
            }, 500)

            if (first) return

            document.querySelector('#voteForm button[type="submit"]').click()
        }
    } catch (e) {
        throwError(e)
    }
}