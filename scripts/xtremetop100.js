async function vote(first) {
    if (first === false) return
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
}

const timer = setInterval(()=>{
    try {
        if (document.querySelector('input[name="captcha_code"]') && document.querySelector('input[name="captcha_code"]').value >= 6) {
            clearInterval(timer)
            document.querySelector('#topbanner form[method="POST"] input[type="submit"]').click()
        }
    } catch (e) {
        clearInterval(timer)
        throwError(e)
    }
}, 1000)