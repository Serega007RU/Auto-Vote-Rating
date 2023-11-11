async function vote(first) {

    // И ещё более наитупейший костыль дожидающийся загрузки сайта
    // Мы иногда получаем просто пустую страницу без ничего
    // даже нет иконки обозначающей что что-то загружается (настолько говно код на сайте)
    // нам ничего не остаётся кроме как подождать что-то?
    if (document.querySelector('#__next main')?.getElementsByTagName('*')?.length < 50) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (document.querySelector('#__next main')?.getElementsByTagName('*')?.length > 50) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    //А это ещё один костыль дожидающий загрузки сайта
    if (document.querySelector('#__next h2')?.textContent.includes('Application error')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (!document.querySelector('#__next h2')?.textContent.includes('Application error')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    //Дожидаемся полной загрузки сайта
    if (document.querySelector('img[alt="loader side"]')) {
        await new Promise(resolve => {
            const timer = setInterval(() => {
                if (!document.querySelector('img[alt="loader side"]')) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    if (document.querySelector('.ant-result')) {
        if (document.querySelector('.ant-result').innerText.trim().includes('404') && document.querySelector('.ant-result').innerText.trim().includes('not found')) {
            const request = {}
            request.message = document.querySelector('.ant-result').innerText.trim()
            request.retryCoolDown = 21600000
            chrome.runtime.sendMessage(request)
            return
        }
    }

    document.querySelector('button#vote-button').click()

    const project = await getProject('FindMCServer')

    const textInputRef = document.querySelector('div.ant-modal-body input[type="text"]')
    const prototype = Object.getPrototypeOf(textInputRef)
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set
    prototypeValueSetter.call(textInputRef, project.nick)
    textInputRef.dispatchEvent(new Event('input', { bubbles: true }))

    document.querySelector('div.ant-modal-body button.ant-btn').click()
}

const timer = setInterval(() => {
    const message = document.querySelector('div.ant-notification')?.innerText
    if (message) {
        const request = {}
        request.message = message
        if (request.message.includes('Thank you for voting')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({successfully: true})
        } else if (request.message.includes('can vote for this server once per day') || request.message.includes('can vote for this server again tomorrow in')) {
            clearInterval(timer)
            chrome.runtime.sendMessage({later: true})
        } else {
            clearInterval(timer)
            if (request.message.includes('Google ReCaptcha Failure')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
    }
}, 1000)