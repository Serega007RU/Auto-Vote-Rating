//Клик "Я не робот" для ReCaptcha или hCaptcha
this.check = setInterval(()=>{
    //Если мы находимся на странице проверки CloudFlare
    if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
        clearInterval(this.check);
        clearInterval(this.check2);
        clearInterval(this.check3);
        return;
    }
       if (document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border") != null) {
           document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border").click();
           clearInterval(this.check);
       }
       if (document.querySelector("#checkbox") != null) {
           document.querySelector("#checkbox").click();
           clearInterval(this.check);
       }
}, 1000);

//Интеграция с расширением Buster: Captcha Solver for Humans
//Работает весьма хреново, + требуется в этом расширении удалить проверку isTrusted для того что б можно было нажать на кнопку
this.check2 = setInterval(()=>{
       if (document.querySelector("#solver-button") != null && !document.querySelector("#solver-button").className.includes('working')) {
           document.querySelector("#solver-button").click();
           clearInterval(this.check2);
       }
}, 1000);

//Проверяет прошла ли проверка ReCaptcha или hCaptcha
let notified = false;
this.check3 = setInterval(()=>{
       if (document.getElementsByClassName('recaptcha-checkbox-checked').length >= 1 || document.getElementsByClassName('checkbox checked').length >= 1 || (document.getElementById("g-recaptcha-response") != null && document.getElementById("g-recaptcha-response").value.length > 0)) {
           window.top.postMessage('vote', '*');
           clearInterval(this.check);
           clearInterval(this.check2);
           clearInterval(this.check3);
           return
       }
       if (document.querySelector("#solver-button") == null && !notified && document.querySelector("#recaptcha-verify-button") != null && !document.querySelector("#recaptcha-verify-button").disabled) {
           notified = true;
        chrome.runtime.sendMessage({captcha: true})
       }
}, 1000);