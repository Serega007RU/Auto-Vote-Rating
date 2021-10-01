async function vote(first) {
    if (first === false) return
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

        const login = findElement('button', ['login to vote'])
        if (login != null) {
            login.click()
            return
        }

        const timer2 = setInterval(()=>{
            const vote = findElement('button', ['vote'])
            if (!vote.disabled) {
                vote.click()
                clearInterval(timer2)
            }
        })

        const timer1 = setInterval(()=>{
            const result = findElement('p.chakra-text', ['thanks for voting', 'already voted', 'something went wrong'])
            if (result != null) {
                if (result.textContent.toLowerCase().includes('thanks for voting')) {
                    chrome.runtime.sendMessage({successfully: true})
                } else if (result.parentElement.textContent.toLowerCase().includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
                } else if (result.textContent.toLowerCase().includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
                } else {
                    chrome.runtime.sendMessage({message: result.parentElement.textContent})
                }
                clearInterval(timer1)
            }
        }, 1000)

    } catch (e) {
        throwError(e)
    }
}

function findElement(selector, text) {
    for (const element of document.querySelectorAll(selector)) {
        for (const t of text) {
            if (element.textContent.toLowerCase().includes(t)) {
                return element
            }
        }
    }
}