//Клик "Я не робот" для ReCaptcha или hCaptcha
this.check = setInterval(()=>{
    //Если мы находимся на странице проверки CloudFlare
    if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
        clearInterval(this.check)
        clearInterval(this.check2)
        clearInterval(this.check3)
        return
    }
    if (document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border') != null
        && isScrolledIntoView(document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border'))
        && document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border').style.display != 'none') {
        document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border').click()
        clearInterval(this.check)
    }
    if (document.getElementById('checkbox') != null
        && isScrolledIntoView(document.getElementById('checkbox'))
        && document.getElementById('checkbox').style.display != 'none') {
        document.getElementById('checkbox').click()
        clearInterval(this.check)
    }
}, 1000)

//Интеграция с расширением Buster: Captcha Solver for Humans
//Работает весьма хреново, + требуется в этом расширении удалить проверку isTrusted для того что б можно было нажать на кнопку
this.check2 = setInterval(()=>{
    if (document.getElementById('solver-button') != null && !document.getElementById('solver-button').className.includes('working')) {
        document.getElementById('solver-button').click()
        clearInterval(this.check2)
    }
}, 1000)

//Проверяет прошла ли проверка ReCaptcha или hCaptcha
let notified = false
this.check3 = setInterval(()=>{
    if (document.getElementsByClassName('recaptcha-checkbox-checked').length >= 1 || document.getElementsByClassName('checkbox checked').length >= 1 || (document.getElementById('g-recaptcha-response') != null && document.getElementById('g-recaptcha-response').value.length > 0)) {
        window.top.postMessage('vote', '*')
        clearInterval(this.check)
        clearInterval(this.check2)
        clearInterval(this.check3)
        return
    }
    if (document.getElementById('solver-button') == null && !notified && document.getElementById('recaptcha-anchor').ariaDisabled == 'false' && document.getElementById('recaptcha-anchor').ariaChecked == 'false') {
        notified = true
        chrome.runtime.sendMessage({captcha: true})
    }
}, 1000)

function isScrolledIntoView(el) {
    var rect = el.getBoundingClientRect()
    var elemTop = rect.top
    var elemBottom = rect.bottom

    // Only completely visible elements return true:
    var isVisible// = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    isVisible = elemTop < window.innerHeight && elemBottom >= 0
    return isVisible
}
