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
                const timer = setTimeout(()=>{//Да это костыль, а есть вариант по лучше?
                    chrome.runtime.sendMessage({discordLogIn: true})
                }, 10000)
                window.onbeforeunload = ()=> clearTimeout(timer)
                window.onunload = ()=> clearTimeout(timer)
            }
            return
        }

        const project = await getProject('Discords')
        if (document.querySelector('a[href="/bots/auth"]') != null) {
            document.querySelector('a[href="/bots/auth"]').click()
            //Старый код BotsForDiscord
            // document.querySelector('a[href="/bots/login"]').click()
            return
        } else if (document.URL === 'https://discords.com/bots/me' || document.URL === 'https://discords.com/u/dashboard') {//Костыль переадресации на страницу голосования (на время перехода с BotsForDiscord на Discords)
            document.location.replace('https://discords.com/' + project.game + '/' + project.id + (project.game === 'servers' ? '/upvote' : '/vote'))
        }

        if (project.game === 'servers') {
            const button = document.querySelector('.card-body button')
            if (button.disabled && button.textContent === 'Upvote') {
                await new Promise(resolve => {
                    setInterval(()=>{
                        if (!button.disabled || button.textContent !== 'Upvote') resolve()
                    }, 1000)
                })
            }
            if (!project.name) {
                project.name = document.querySelector('.card-body h1').textContent
                chrome.runtime.sendMessage({changeProject: true, project})
            }
            if (button.textContent === 'Upvote') {
                button.click()
                const timer = setInterval(()=> {
                    if (button.textContent !== 'Upvote') {
                        chrome.runtime.sendMessage({successfully: true})
                    }
                    clearInterval(timer)
                }, 1000)
            } else if (button.textContent === 'Login to upvote') {
                button.click()
                // return
            } else {
                //Из полученного текста достаёт все цифры в Array List
                const numbers = button.textContent.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
                chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            }
        } else {
            if (document.querySelector('#votecontainer > h2') != null && document.querySelector('#votecontainer > h2').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                return
            }

            if (document.getElementById('errorsubtitle') != null) {
                if (document.getElementById('errorsubtitle').textContent.toLowerCase().includes('successfully')) {
                    chrome.runtime.sendMessage({successfully: true})
                    return
                }
                chrome.runtime.sendMessage({message: document.getElementById('errorsubtitle').textContent.trim()})
                return
            }

            if (document.querySelector('.upvotes-result-up') != null && document.querySelector('.upvotes-result-up').textContent.includes('uccessfully')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }

            if (first) return

            document.querySelector('button[type="submit"]').click()
        }
    } catch (e) {
        throwError(e)
    }
}