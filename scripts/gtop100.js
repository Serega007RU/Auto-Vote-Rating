async function vote(first) {
    if (document.querySelector('#captcha-status') && document.querySelector('#captcha-status').textContent) return

    document.querySelector('#votebutton').click()

    if (first) chrome.runtime.sendMessage({captcha: true})
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('#captcha-status') && document.querySelector('#captcha-status').textContent) {
            clearInterval(timer)
            const text = document.querySelector('#captcha-status').textContent
            if (text.includes('already voted')) {
                const numbers = text.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({later})
            } else if (text.includes('Thank you for voting')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (text.includes('please solve the') && text.includes('captcha')) {
                chrome.runtime.sendMessage({captcha: true})
            } else {
                chrome.runtime.sendMessage({message: text})
            }
        } else if (document.querySelector('.sfs.s-server') != null) {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 100)