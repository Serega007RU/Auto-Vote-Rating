async function vote(first) {
    //Если нас переадресовало на главную страницу после авторизации
    const project = await getProject('DiscordBoats')
    if (document.URL === 'https://discord.boats/') {
        document.location.replace('https://discord.boats/bot/' + project.id + '/vote')
        return
    }

    //Если нас переадресовало на страницу бота - значит голос прошёл
    if (document.URL === 'https://discord.boats/bot/' + project.id) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }

    if (document.querySelector('form[action="/auth/login"] button[type="submit"]') != null) {
        document.querySelector('#joinguild').checked = false
        document.querySelector('form[action="/auth/login"] button[type="submit"]').click()
        return
    }

    if (document.querySelector('div.flex-item > h1 > span[style="color:#ffffff"]') != null) {
        if (document.querySelector('div.flex-item > h1 > span[style="color:#ffffff"]').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: Date.now() + 43200000})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.flex-item > h1 > span[style="color:#ffffff"]').textContent})
        }
        return
    }

    if (first) return

    document.querySelector('#submitBtn').click()
}