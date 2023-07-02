async function vote(/*first*/) {
    //Дожидаемся полной загрузки сайта
    if (document.querySelector('div.loading-bar')?.childElementCount === 0) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (document.querySelector('div.loading-bar')?.childElementCount !== 0) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    //Дожидаемся полной загрузки сайта
    // noinspection CssInvalidHtmlTagReference
    if (document.querySelector('iconify-icon.animate-spin')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                // noinspection CssInvalidHtmlTagReference
                if (!document.querySelector('iconify-icon.animate-spin')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    const voteButton = document.querySelector('#vote-button')
    if (voteButton.textContent.includes('can\'t vote now')) {
        const numbers = voteButton.textContent.match(/\d+/g).map(Number)
        const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        return
    }

    voteButton.querySelector('button').click()
}

const timer = setInterval(() => {
    try {
        const message = document.querySelector('div.Toastify__toast-container')?.innerText
        if (message) {
            if (message.includes('vote has been recorded')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            clearInterval(timer)
        }
    } catch (error) {
        clearInterval(timer)
        throwError(error)
    }
}, 1000)