//Клик "Я не робот" для ReCaptcha
this.check = setInterval(()=>{
   	if (document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border") != null) {
   		document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border").click();
   		clearInterval(this.check);
   	}
}, 1000);

//Интеграция с расширением Buster: Captcha Solver for Humans
//Работает весьма хреново, + требуется в этом расширении удалить проверку isTrusted для того что б можно было нажать на кнопку
this.check2 = setInterval(()=>{
   	if (document.querySelector("#solver-button") != null && !document.querySelector("#solver-button").className.includes('working')) {
   		document.querySelector("#solver-button").click();
   	}
}, 1000);

//Клик "Я не робот" для hCaptcha //ToDo пока не работает из-за проверки isTrusted
this.check3 = setInterval(()=>{
   	if (document.querySelector("#checkbox") != null) {
   		document.querySelector("#checkbox").click();
   		clearInterval(this.check3);
   	}
}, 1000);

//Проверяет прошла ли проверка капчи
let notified = false;
this.check4 = setInterval(()=>{
   	if (document.getElementsByClassName('recaptcha-checkbox-checked').length >= 1) {
   		window.top.postMessage('vote', '*');
   		clearInterval(this.check);
   		clearInterval(this.check2);
   		clearInterval(this.check3);
   		clearInterval(this.check4);
   	}
   	if (document.querySelector("#solver-button") == null && !notified && document.querySelector("#recaptcha-verify-button") != null) {
   	    notified = true;
        sendMessage("Requires manually passing the captcha");
   	}
}, 1000);

function sendMessage(message) {
    chrome.runtime.sendMessage({
         message: message
    }, function(response) {});
}