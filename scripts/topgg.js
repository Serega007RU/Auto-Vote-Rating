async function vote(first) {
    if (first === false) return

    const login = findElement('a', ['login to vote'])
    if (login != null) {
        login.click()
        return
    }

    const timer2 = setInterval(() => {
        try {
            const vote = findElement('button', ['vote'])
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

    const timer1 = setInterval(() => {
        try {
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
        } catch (e) {
            clearInterval(timer1)
            throwError(e)
        }
    }, 1000)
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