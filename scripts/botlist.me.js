async function vote(/*first*/) {
    //Дожидаемся полной загрузки сайта
    if (document.querySelector('span.loading.spinner-border')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (!document.querySelector('span.loading.spinner-border')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    if (checkAnswer()) return

    if (document.querySelector('nav.navbar a.nav-link[href="#"]')?.textContent.includes('Log in')) {
        document.querySelector('nav.navbar a.nav-link[href="#"]').click()
        return
    }

    document.querySelector('#page-container button[type="button"].btn-success').click()
}

function checkAnswer() {
    const message = document.querySelector('div.b-toaster-slot')?.innerText || document.querySelector('#page-container div.text-center p')?.innerText
    if (message) {
        if (message.includes('vote has been registered')) {
            chrome.runtime.sendMessage({successfully: true})
            return true
        } else if (message.includes('already voted')) {
            const numbers = message.match(/\d+/g).map(Number)
            const milliseconds = numbers[1] * 60 * 60 * 1000
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            return true
        } else if (message.includes('Click the vote button')) {
            // None
        } else {
            chrome.runtime.sendMessage({message})
            return true
        }
    }
    return false
}

const timer = setInterval(() => {
    try {
        if (checkAnswer()) {
            clearInterval(timer)
        }
    } catch (error) {
        clearInterval(timer)
        throwError(error)
    }
}, 1000)