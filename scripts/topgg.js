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

        if (document.querySelector('div.modal.is-active') != null) {
            if (document.querySelector('div.modal.is-active > div.modal-content.content').textContent.includes('You must be logged')) {
                document.querySelector('div.modal.is-active > div.modal-content.content a.btn.primary').click()
//              chrome.runtime.sendMessage({discordLogIn: true})
                return
            } else if (document.querySelector('div.modal.is-active a[class="btn"]') != null) {
                document.querySelector('div.modal.is-active a[class="btn"]').click()
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.modal.is-active > div.modal-content.content').textContent.trim()})
                return
            }
        }

        //Пилюля от жадности
        document.getElementById('video-root').style.display = 'none'
        document.getElementById('vote-root').style.display = 'block'
        document.querySelector('.slider-root').removeAttribute('style')
        document.querySelector('#vote-button-container > a').click()

        //Ждём загрузки bot manager (а зачем нам это делать адекватно?)
        await new Promise(resolve => {
            const timer3 = setInterval(()=>{
                if (document.getElementById('vote-label') != null) {
                    if (document.getElementById('vote-label').textContent === 'Ready to vote') {
                        resolve()
                        clearInterval(timer3)
                    }
                }
            }, 1000)
        })

        //Пилюля от жадности
        document.getElementById('video-root').style.display = 'none'
        document.getElementById('vote-root').style.display = 'block'
        document.querySelector('.slider-root').removeAttribute('style')
        document.querySelector('#vote-button-container > a').click()
        //Мы типо не роботы, мы человеки
        for (let i = 0; i < 20; i++) {
            triggerMouseEvent(document, 'mousedown')
            triggerMouseEvent(document, 'mousemove')
        }
        function triggerMouseEvent(node, eventType) {
            const clickEvent = document.createEvent('MouseEvents')
            clickEvent.initEvent(eventType, true, true)
            node.dispatchEvent(clickEvent)
        }
        document.querySelector('.vote-slider').value = 250
        document.querySelector('.vote-slider').dispatchEvent(new Event('touchend'))

        const timer2 = setInterval(()=>{
            try {
                const text = document.getElementById('vote-label').textContent
                if (text.includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
                } else if (document.getElementById('reminder').textContent.includes('Thanks for voting!')) {
                    chrome.runtime.sendMessage({successfully: true})
                } else if (text.includes('Ready to vote')) {
                    return
                } else {
                    chrome.runtime.sendMessage({message: text})
                }
                clearInterval(timer2)
            } catch (e) {
                throwError(e)
                clearInterval(timer2)
            }
        }, 1000)

    } catch (e) {
        throwError(e)
    }
}