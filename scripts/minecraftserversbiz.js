async function vote(first) {
    //Если есть ошибка
    if (document.querySelector('#cookies-message > div') != null) {
        //Если вы уже голосовали
        if (document.querySelector('#cookies-message > div').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
            //Если успешное автоголосование
        } else if (document.querySelector('#cookies-message > div').textContent.includes('successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else {
            const request = {}
            request.message = document.querySelector('#cookies-message > div').textContent
            if (request.message.includes('captcha')) {
                if (first) chrome.runtime.sendMessage({captcha: true})
            } else {
                chrome.runtime.sendMessage(request)
                return
            }
        }
    }

    if (first) return

    const project = await getProject('MinecraftServersBiz')
    document.getElementById('vote_username').value = project.nick
    document.querySelector('input[name="commit"]').click()
}