async function vote(first) {
    if (first == false) {
        console.warn('[Auto Vote Rating] Произошёл повторный вызов функции vote(), сообщите разработчику расширения о данной ошибке')
        return
    }
    try {
        if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('Successfully voted')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        } else if (document.querySelector('#center > div > h1') != null && document.querySelector('#center > div > h1').textContent.includes('You already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
        const project = await getProject('PlanetMinecraft')
        if (document.querySelector('#submit_vote_form > input[name="mcname"]') != null) {
            document.querySelector('#submit_vote_form > input[name="mcname"]').value = project.nick
        } else {
            console.warn('Не удалось найти поле для никнейма, возможно это голосование без награды')
        }
        document.querySelector('#submit_vote_form > input[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}