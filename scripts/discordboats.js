async function vote(first) {
    if (document.URL.startsWith('https://discord.com/')) {
        if (document.URL.includes('%20guilds') || document.URL.includes('%20email') || !document.URL.includes('prompt=none')) {
            let url = document.URL
            //Пилюля от жадности в правах
            url = url.replace('%20guilds.join', '')
            url = url.replace('%20guilds', '')
            url = url.replace('%20email', '')
            //Заставляем авторизацию авторизоваться не беспокоя пользователя если права уже были предоставлены
            if (!document.URL.includes('prompt=none')) url = url.concat('&prompt=none')
            document.location.replace(url)
        } else {
            const timer = setTimeout(()=>{//Да это костыль, а есть вариант по лучше?
                chrome.runtime.sendMessage({discordLogIn: true})
            }, 10000)
            window.onbeforeunload = ()=> clearTimeout(timer)
            window.onunload = ()=> clearTimeout(timer)
        }
        return
    }

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