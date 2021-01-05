//Совместимость с Rocket Loader
document.addEventListener('DOMContentLoaded', (event)=>{
    vote()
})

function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector("#nav-collapse > ul.navbar-nav.ml-auto > li > a").firstElementChild.textContent.includes('Log in')) {
            chrome.runtime.sendMessage({discordLogIn: true})
            return
        }

        this.check2 = setInterval(()=>{
            if (document.querySelector('button[class="btn btn-blurple"]').disabled == false) {
                document.querySelector('button[class="btn btn-blurple"]').click()
                clearInterval(this.check2)
            }
        }, 1000)
        
        this.check = setInterval(()=>{
            if (document.querySelector('div[role="status"][aria-live="polite"]').textContent == 'User has already voted.') {
                chrome.runtime.sendMessage({later: true})
                clearInterval(this.check)
            } else if (document.querySelector('div[class="col-12 col-md-6 text-center"] > h1').textContent == 'Thank you for voting!') {
                chrome.runtime.sendMessage({successfully: true})
                clearInterval(this.check)
            } else if (document.querySelector('link[href="/_nuxt/pages/bots/_id/upvote/thanks.d767193.css"]') != null) {
                //Да это костыль но разбирать обфуцированный код я не хочу
                //ToDo <Serega007> сообщение Thank you for voting! не высвечивается если вкладка не сфокусирована, не понятно из-за чего это хрень, это костыль
                chrome.runtime.sendMessage({successfully: true})
                clearInterval(this.check)
            } else if (document.querySelector('div[role="status"][aria-live="polite"]').textContent != '') {
                chrome.runtime.sendMessage({message: document.querySelector('div[role="status"][aria-live="polite"]').textContent})
                clearInterval(this.check)
            }
        }, 1000)

    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}