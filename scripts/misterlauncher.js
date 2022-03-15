async function vote(first) {
    const project = await getProject('MisterLauncher')
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
            try {
                if (document.querySelector('#messages').textContent.length > 0) {
                    if (document.querySelector('#messages').textContent.includes('Спасибо за Ваш голос')) {
                        chrome.runtime.sendMessage({successfully: true})
                    } else if (document.querySelector('#messages').textContent.includes('уже голосовали')) {
                        const numbers = document.querySelector('#messages').textContent.match(/\d+/g).map(Number)
                        chrome.runtime.sendMessage({later: Date.UTC(numbers[2], numbers[1] -1, numbers[0], numbers[3], numbers[4], numbers[5]) - 10800000 + 60000})
                    } else {
                        chrome.runtime.sendMessage({message: document.querySelector('#messages').textContent})
                    }
                    clearInterval(timer)
                }
            } catch (e) {
                clearInterval(timer)
                throwError(e)
            }
        }, 500)

        if (first) return

        document.querySelector('#form-vote-server button[type="submit"]').click()
    }
}