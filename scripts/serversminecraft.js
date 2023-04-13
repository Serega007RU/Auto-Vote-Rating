async function vote(first) {
    if (document.querySelector('.container h3')?.textContent.toLowerCase().includes('submitting vote in')) {
        return
    }

    if (document.querySelector('div[id*="sp_message_container"]')) {
        chrome.runtime.sendMessage({auth: true})
        await new Promise(resolve => {
            const timer2 = setInterval(() => {
                if (!document.querySelector('div[id*="sp_message_container"]')) {
                    clearInterval(timer2)
                    resolve()
                }
            }, 1000)
        })
    }

    //Костыльный фикс на костыльные какие-то popup которые грузятся костыльно
    if (document.querySelector('.site-body > script')?.nextElementSibling.tagName === 'SCRIPT') {
        const script = document.querySelector('.site-body > script')?.nextElementSibling.textContent.toLowerCase()
        if (script.includes('popupvoted();') && script.includes('you voted') && script.includes('thank you')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
    }

    if (document.querySelector('.ct-popup-content')) {
        const message = document.querySelector('.ct-popup-content').innerText
        if (message.length > 10) {
            if ((message.toLowerCase().includes('you voted') && message.toLowerCase().includes('thank you')) || message.toLowerCase().includes('thanks for voting')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
            return
        }
    }
    if (document.querySelector('div.bg-green-100')) {
        chrome.runtime.sendMessage({successfully: true})
        return
    }
    if (document.querySelector('div.bg-blue-100')) {
        if (document.querySelector('div.bg-blue-100').textContent.toLowerCase().includes('you can vote for this server again in')) {
            chrome.runtime.sendMessage({later: true})
        } else {
            chrome.runtime.sendMessage({message: document.querySelector('div.bg-blue-100').textContent.trim()})
        }
        return
    }

    if (document.querySelector('div.bg-red-100')) {
        if (document.querySelector('div.bg-red-100').textContent.toLowerCase().includes('must wait until tomorrow')) {
            chrome.runtime.sendMessage({later: true})
            return
        }
    }

    if (document.querySelector('.site-body .text-center')?.textContent.includes('Page Not Found')) {
        chrome.runtime.sendMessage({message: document.querySelector('.site-body .text-center')?.textContent.trim(), ignoreReport: true})
    }

    //Костыль, reCAPTCHA загружается только после scroll, странно, да?
    document.querySelector('#username').scrollIntoView({block: 'center'})
    window.scrollTo(window.scrollX, window.scrollY + 16)
    document.dispatchEvent(new Event('scroll'))

    if (first) return

    const project = await getProject('ServersMinecraft')
    document.querySelector('#username').value = project.nick
    document.querySelector('form button[type="submit"]').click()
}