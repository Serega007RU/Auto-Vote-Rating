//Совместимость с Rocket Loader
document.addEventListener('DOMContentLoaded', (event)=>{
    const timer = setInterval(()=>{
        //Ожидаем загрузки reCAPTCHA
        if (document.getElementById('g-recaptcha-response') != null && document.getElementById('g-recaptcha-response').value && document.getElementById('g-recaptcha-response').value != '') {
            vote()
            clearInterval(timer)
        }
    }, 1000)
})

async function vote(first) {
    if (first == true) return
    if (first == false) {
        console.warn('[Auto Vote Rating] Произошёл повторный вызов функции vote(), сообщите разработчику расширения о данной ошибке')
        return
    }
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        const project = await getProject('MinecraftServerList')
        document.getElementById('ignn').value = project.nick
        document.querySelector('#voteform > input.buttonsmall.pointer.green.size10').click()
    } catch (e) {
        throwError(e)
    }
}

//Ждёт готовности recaptcha (Anti Spam check) и проверяет что с голосованием и пытается вновь нажать vote()
const timer2 = setInterval(()=>{
    try {
        if (document.querySelector('#voteerror > font') != null) {
            if (document.querySelector('#voteerror > font').textContent.includes('Vote Registered')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (document.querySelector('#voteerror > font').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
            } else if (document.querySelector('#voteerror > font').textContent.includes('Please Wait')) {
                return
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('#voteerror > font').textContent})
            }
            clearInterval(timer2)
        }
    } catch (e) {
        throwError(e)
        clearInterval(timer2)
    }
}, 1000)
