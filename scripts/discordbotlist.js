function vote(first) {
    if (first === false) return
    const timer1 = setInterval(()=>{
        try {
            if (document.querySelector('.main-content').innerText.includes('ogging you in')) {
                return
            }
            const vote = findElement('button', ['upvote'])
            if (!vote.disabled) {
                clearInterval(timer1)
                vote.click()

                const timer4 = setInterval(()=>{
                    const vote2 = findElement('button', ['upvote anyway'])
                    console.log(vote2)
                    if (vote2 && !vote2.disabled) {
                        clearInterval(timer4)
                        vote2.click()
                    }
                }, 1000)
            }
        } catch (e) {
            clearInterval(timer1)
            throwError(e)
        }
    }, 1000)

    const timer2 = setInterval(()=>{
        try {
            const result = findElement('h1', ['thank you for voting'])
            if (result != null) {
                clearInterval(timer2)
                if (result.textContent.toLowerCase().includes('thank you for voting')) {
                    chrome.runtime.sendMessage({successfully: true})
                }
                return
            } else {
                for (const el of document.querySelectorAll('link')) {
                    if (el.href.includes('thanks')) {
                        chrome.runtime.sendMessage({successfully: true})
                        clearInterval(timer2)
                        return
                    }
                }
                if (document.URL.includes('thanks')) {
                    chrome.runtime.sendMessage({successfully: true})
                    clearInterval(timer2)
                    return
                }
            }
            //Костыль, на servers при успешном голосовании тупо перекидывает на страницу проекта
            if (document.querySelector('.upvotes') != null) {
                chrome.runtime.sendMessage({successfully: true})
                clearInterval(timer2)
            }
        } catch (e) {
            clearInterval(timer2)
            throwError(e)
        }
    }, 1000)

    const timer3 = setInterval(()=>{
        try {
            if (document.querySelector('div[role="status"]').children.length > 0) {
                clearTimeout(timer3)
                let text
                for (const el of document.querySelector('.toasted-container').children) {
                    if (el.textContent.includes('already voted')) {
                        chrome.runtime.sendMessage({later: true})
                        return
                    } else {
                        text = el.textContent
                    }
                }
                chrome.runtime.sendMessage({message: text})
            }
        } catch (e) {
            clearInterval(timer3)
            throwError(e)
        }
    }, 1000)
}

function findElement(selector, text) {
    for (const element of document.querySelectorAll(selector)) {
        for (const t of text) {
            if (element.textContent.toLowerCase().includes(t) || element.innerText.toLowerCase().includes(t)) {
                return element
            }
        }
    }
}