async function vote(first) {
    if (first === false) return

    //Дожидаемся полной загрузки сайта
    if (document.querySelector('div.chakra-spinner')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (!document.querySelector('div.chakra-spinner')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    const login = findElement('a', ['login to vote'])
    if (login != null) {
        login.click()
        return
    }

    const login2 = findElement('a', ['login'])
    if (login2 != null) {
        login2.click()
        return
    }

    let countAlreadyVoted = 0
    const timer1 = setInterval(() => {
        try {
            const result = findElement('p.chakra-text', ['thanks for voting', 'already voted', 'something went wrong'])
            if (result != null) {
                if (result.textContent.toLowerCase().includes('thanks for voting')) {
                    chrome.runtime.sendMessage({successfully: true})
                    clearInterval(timer1)
                } else if (result.textContent.toLowerCase().includes('already voted')) {
                    if (countAlreadyVoted > 15) {
                        chrome.runtime.sendMessage({later: true})
                        clearInterval(timer1)
                    } else {
                        countAlreadyVoted = countAlreadyVoted + 1
                    }
                } else {
                    const request = {}
                    request.message = result.parentElement.textContent
                    if (request.message.includes('Something went wrong while trying to vote')) {
                        request.ignoreReport = true
                    }
                    chrome.runtime.sendMessage(request)
                    clearInterval(timer1)
                }
            }
        } catch (e) {
            clearInterval(timer1)
            throwError(e)
        }
    }, 1000)

    // TODO этот костыль сделан из-за того что сайт сначало показывает что вот голосуй, а потом через несколько секунд пишет "Вы уже голосовали"
    await wait(Math.floor(Math.random() * (15000 - 10000) + 10000))

    const timer2 = setInterval(() => {
        try {
            const vote = findElement('button', ['vote'])
            if (!vote) return
            if (!vote.disabled) {
                for (let i = 0; i < 20; i++) {
                    triggerMouseEvent(document, 'mousedown')
                    triggerMouseEvent(document, 'mousemove')
                }
                function triggerMouseEvent(node, eventType) {
                    const clickEvent = document.createEvent('MouseEvents')
                    clickEvent.initEvent(eventType, true, true)
                    node.dispatchEvent(clickEvent)
                }

                vote.click()
                clearInterval(timer2)
            }
        } catch (e) {
            clearInterval(timer2)
            throwError(e)
        }
    })

    // TODO иногда сайт просто зависает на "You must be logged in to vote." или "You will be able to vote after this ad.", просто втупую через некоторое время перезагружаем страницу
    setTimeout(() => {
        document.location.reload()
    }, Math.floor(Math.random() * (300000 - 420000) + 420000))
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