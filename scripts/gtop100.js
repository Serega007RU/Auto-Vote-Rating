async function vote(/*first*/) {
    document.querySelector('#votebutton').click()
}

let sendedNotifCaptcha = false
const timer = setInterval(()=>{
    try {
        if (document.querySelector('#captcha-status') && document.querySelector('#captcha-status').textContent) {
            const text = document.querySelector('#captcha-status').textContent
            if (text.includes('already voted')) {
                clearInterval(timer)
                const numbers = text.match(/\d+/g).map(Number)
                const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({later})
            } else if (text.includes('Thank you for voting')) {
                clearInterval(timer)
                chrome.runtime.sendMessage({successfully: true})
            } else if (text.includes('please solve the') && text.includes('captcha')) {
                // None
            } else {
                clearInterval(timer)
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