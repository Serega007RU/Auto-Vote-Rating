async function vote(first) {
    if (document.querySelector('.notification') != null) {
        if (document.querySelector('.notification.is-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
        } else if (document.querySelector('.notification.is-warning') != null && document.querySelector('.notification.is-warning').textContent.includes('Hlasovat můžete až')) {
            //Сайт предоставляет когда следующее голосование но не понятно в каком часовом поясе указано время, также не указывается день (пишет только часы и минуты) что ещё больше осложняет определение времени следующего голосования
            chrome.runtime.sendMessage({later: Date.now() + 7200000})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('.notification').textContent.trim()})
        }
        return
    }

    if (first) {
        document.getElementById('vote-modal').previousElementSibling.click()
        return
    }
    let project = await getProject('MinecraftServery')
    document.querySelector('#vote-modal form input[name="nickname"]').value = project.nick
    document.querySelector('#vote-modal form button[type="submit"]').click()
}