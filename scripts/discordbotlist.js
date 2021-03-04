vote()

function vote() {
    try {
        if (document.URL.startsWith('https://discord.com/')) {
            const timer = setTimeout(()=>{//Да это костыль, а есть варинт по лучше?
                chrome.runtime.sendMessage({discordLogIn: true})
            }, 10000)
            window.onbeforeunload = function(e) {
                clearTimeout(timer)
            }
            window.onunload = function(e) {
                clearTimeout(timer)
            }
            return
        }

        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
//      if (document.querySelector("#nav-collapse > ul.navbar-nav.ml-auto > li > a").firstElementChild.textContent.includes('Log in')) {
//          chrome.runtime.sendMessage({discordLogIn: true})
//          return
//      }

        if (document.querySelector('div.main-content') != null && document.querySelector('div.main-content').textContent == 'Logging you in...') {
            return
        }

        const timer2 = setInterval(()=>{
            try {
                if (document.querySelector('button.btn.btn-blurple').disabled == false) {
                    document.querySelector('button.btn.btn-blurple').click()
                    clearInterval(timer2)
                }
            } catch (e) {
                chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
                clearInterval(timer2)
            }
        }, 1000)
        
        const timer3 = setInterval(()=>{
            try {
                if (document.querySelector('div[role="status"][aria-live="polite"]').textContent == 'User has already voted.') {
                    chrome.runtime.sendMessage({later: true})
                    clearInterval(timer3)
                } else if (document.querySelector('div[class="col-12 col-md-6 text-center"] > h1').textContent == 'Thank you for voting!') {
                    chrome.runtime.sendMessage({successfully: true})
                    clearInterval(timer3)
                } else if (document.querySelector('div[role="status"][aria-live="polite"]').textContent != '') {
                    chrome.runtime.sendMessage({message: document.querySelector('div[role="status"][aria-live="polite"]').textContent})
                    clearInterval(timer3)
                } else {
                    for (const el of document.querySelectorAll('link')) {
                        if (el.href.includes('thanks')) {
                            chrome.runtime.sendMessage({successfully: true})
                            clearInterval(timer3)
                            break
                        }
                    }
                    if (document.URL.includes('thanks')) {
                        chrome.runtime.sendMessage({successfully: true})
                        clearInterval(timer3)
                    }
                }
            } catch (e) {
                chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
                clearInterval(timer3)
            }
        }, 1000)

    } catch (e) {
        chrome.runtime.sendMessage({errorVoteNoElement2: e.stack})
    }
}