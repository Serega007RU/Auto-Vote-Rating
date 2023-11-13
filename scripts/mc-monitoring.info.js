async function vote(first) {
    const notif = document.querySelector('.votes_wrap')
    if (notif.textContent.includes('успешно проголосовали')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    } else if (notif.textContent.includes('уже проголосовали')) {
        chrome.runtime.sendMessage({later: true})
        return
    }

    if (first) return

    const project = await getProject()
    //Если голосование с никнеймом
    if (document.querySelector('#vote')) {
        document.querySelector('#vote').click()
        document.querySelector('#username').value = project.nick
        document.querySelector('#myModal button[type="submit"]').click()
    } else {
        document.querySelector('input[value="Голосовать"]').click()
    }

}