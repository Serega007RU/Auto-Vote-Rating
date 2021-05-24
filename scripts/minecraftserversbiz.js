async function vote(first) {
    try {
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
                chrome.runtime.sendMessage({message: document.querySelector('#cookies-message > div').textContent})
                return
            }
        }
        
        if (first) return

        const project = await getProject('MinecraftServersBiz')
        document.getElementById('vote_username').value = project.nick
        document.querySelector('input[name="commit"]').click()
    } catch (e) {
        throwError(e)
    }
}