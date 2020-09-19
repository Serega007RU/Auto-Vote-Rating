this.check = setInterval(()=>{
   	if (document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border") != null) {
   		document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border").click();
   		clearInterval(this.check);
   	}
}, 1000);

this.check2 = setInterval(()=>{
   	if (document.querySelector("#solver-button") != null) {
   		document.querySelector("#solver-button").click();
   		clearInterval(this.check2);
   	}
}, 1000);

this.check3 = setInterval(()=>{
   	if (document.querySelector("#checkbox") != null) {
   		document.querySelector("#checkbox").click();
   		clearInterval(this.check3);
   	}
}, 1000);

this.check4 = setInterval(()=>{
   	if (document.getElementsByClassName('recaptcha-checkbox-checked').length >= 1) {
   		window.top.postMessage('vote', '*');
   		clearInterval(this.check);
   		clearInterval(this.check2);
   		clearInterval(this.check3);
   		clearInterval(this.check4);
   	}
}, 1000);