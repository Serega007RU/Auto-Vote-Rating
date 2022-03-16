//Фикс-костыль двойной загрузки (для Rocket Loader)
if (typeof loaded2 === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var loaded2 = true
    runVote()
}

async function vote() {
    await new Promise(resolve => {
        const timer = setInterval(()=>{
            try {
                //Ожидаем загрузки reCAPTCHA
                if (document.getElementById('g-recaptcha-response') != null && document.getElementById('g-recaptcha-response').value && document.getElementById('g-recaptcha-response').value !== '') {
                    clearInterval(timer)
                    resolve()
                }
            } catch (e) {
                clearInterval(timer)
                throwError(e)
            }
        }, 1000)
    })
    const project = await getProject('MinecraftServerList')
    document.getElementById('ignn').value = project.nick
    document.querySelector('#voteform > input.buttonsmall.pointer.green.size10').click()
}

function runVote() {
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
            clearInterval(timer2)
            throwError(e)
        }
    }, 1000)
}
