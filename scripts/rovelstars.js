async function vote(/*first*/) {
    if (document.querySelectorAll('a[onclick*="login"]')?.[1]) {
        document.querySelectorAll('a[onclick*="login"]')[1].click()
        document.querySelector('button.swal2-confirm').click()
        return
    }

    document.querySelector('#submitbutton').click()
}

const timer = setInterval(() => {
    try {
        const message = document.querySelector('div.swal2-show')?.innerText
        if (message) {
            if (message.includes('You Voted')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (message.includes('wait before your next vote')) {
                const numbers = message.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
                chrome.runtime.sendMessage({later: Date.now() + milliseconds})
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