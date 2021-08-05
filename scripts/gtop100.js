async function vote(first) {
    if (first === false) return
    try {
        const timer = setInterval(()=>{
            if (document.getElementById('FunCaptcha') != null) {
                chrome.runtime.sendMessage({captcha: true})
                clearInterval(timer)
            }
        }, 1000)
        const timer2 = setInterval(()=>{
            if (document.getElementById('captcha-status') != null && document.getElementById('captcha-status').textContent !== '') {
                if (document.getElementById('captcha-status').textContent.includes('already voted')) {
                    clearInterval(timer2)
                    const numbers = document.getElementById('captcha-status').textContent.match(/\d+/g).map(Number)
                    let count = 0
                    let hour = 0
                    let min = 0
                    let sec = 0
                    for (const i in numbers) {
                        if (count === 0) {
                            hour = numbers[i]
                        } else if (count === 1) {
                            min = numbers[i]
                        } else if (count === 2) {
                            sec = numbers[i]
                        }
                        count++
                    }
                    const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                    const later = Date.now() + milliseconds
                    chrome.runtime.sendMessage({later: later})
                } else if (document.getElementById('captcha-status').textContent.includes('success')) {
                    clearInterval(timer2)
                    chrome.runtime.sendMessage({successfully: true})
                }
            }
        }, 1000)
    } catch (e) {
        throwError(e)
    }
}