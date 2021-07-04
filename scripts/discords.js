async function vote(first) {
    try {
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
                const timer = setTimeout(()=>{//Да это костыль, а есть варинт по лучше?
                    chrome.runtime.sendMessage({discordLogIn: true})
                }, 10000)
                window.onbeforeunload = ()=> clearTimeout(timer)
                window.onunload = ()=> clearTimeout(timer)
            }
            return
        }

        if (document.querySelector('a[href="/bots/auth"]') != null) {
            document.querySelector('a[href="/bots/auth"]').click()
            //Старый код BotsForDiscord
            // document.querySelector('a[href="/bots/login"]').click()
            return
        } else if (document.URL === 'https://discords.com/bots/me') {//Костыль перадресации на страницу голосования (на время перехода с BotsForDiscord на Discords)
            const project = await getProject()
            document.location.replace('https://discords.com/bots/bot/' + project.id + '/vote')
        }

        if (document.querySelector('#votecontainer > h2') != null && document.querySelector('#votecontainer > h2').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }

        if (document.getElementById('errorsubtitle') != null) {
            if (document.getElementById('errorsubtitle').firstChild.textContent.includes('successfully voted')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }
            chrome.runtime.sendMessage({message: document.getElementById('errorsubtitle').firstChild.textContent.trim()})
            return
        }

        if (first) return
        
        document.querySelector('button[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}