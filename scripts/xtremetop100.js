async function vote(first) {
    if (first === false) return
    try {
        if (document.querySelector('#middlebb')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (document.querySelector('body').childElementCount === 0) {
            const url = document.URL.replace('-post', '')
            document.location.replace(url)
            return
        }

        chrome.runtime.sendMessage({captcha: true})
    } catch (e) {
        throwError(e)
    }
}

const timer = setInterval(()=>{
    if (document.querySelector('input[name="captcha_code"]') && document.querySelector('input[name="captcha_code"]').value >= 6) {
        clearInterval(timer)
        document.querySelector('#topbanner form[method="POST"] input[type="submit"]').click()
    }
}, 1000)