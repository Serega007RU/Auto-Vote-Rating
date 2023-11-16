async function vote(first) {
    const project = await getProject()
    if (document.querySelector('a[href="/bots/auth"]')) {
        document.querySelector('a[href="/bots/auth"]').click()
        return
    }

    if (project.listing === 'servers') {
        const button = document.querySelector('.card-body button')
        if (button.disabled && button.textContent === 'Upvote') {
            await new Promise(resolve => {
                setInterval(()=>{
                    if (!button.disabled || button.textContent !== 'Upvote') resolve()
                }, 1000)
            })
        }
        if (!project.name) {
            project.name = document.querySelector('.card-body h1').textContent
            chrome.runtime.sendMessage({changeProject: project})
        }
        if (button.textContent === 'Upvote') {
            button.click()
            const timer = setInterval(()=> {
                if (button.textContent !== 'Upvote') {
                    chrome.runtime.sendMessage({successfully: true})
                }
                clearInterval(timer)
            }, 1000)
        } else if (button.textContent === 'Login to upvote') {
            button.click()
            // return
        } else {
            //Из полученного текста достаёт все цифры в Array List
            const numbers = button.textContent.match(/\d+/g).map(Number)
            const milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000) + (numbers[2] * 1000)
            chrome.runtime.sendMessage({later: Date.now() + milliseconds})
        }
    } else {
        if (document.querySelector('.four-o-four')) {
            const request = {}
            request.message = document.querySelector('.four-o-four').innerText.trim()
            if (request.message.includes('404')) {
                request.retryCoolDown = 21600000
            }
            request.ignoreReport = true
            chrome.runtime.sendMessage(request)
            return
        }
        //Сайт неверно сообщает о том что страница загружена когда на самом деле она не полностью загружена, приходится извращаться такими костылями
        if (!document.querySelector('.upvote-hero').innerText.trim().length) {
            await new Promise(resolve => {
                const timer = setInterval(() => {
                    try {
                        if (document.querySelector('.upvote-hero').innerText.trim().length) {
                            resolve()
                            clearInterval(timer)
                        }
                    } catch (error) {
                        clearInterval(timer)
                        throwError(error)
                    }
                })
            })
        }

        document.querySelector('.upvote-hero button').click()

        const timer = setInterval(() => {
            try {
                const message = document.querySelector('.upvote-hero').innerText.trim()
                if (message.length) {
                    if (message.includes('Thank you for voting')) {
                        clearInterval(timer)
                        chrome.runtime.sendMessage({successfully: true})
                    } else if (message.includes('You can upvote again in')) {
                        clearInterval(timer)
                        const numbers = message.match(/\d+/g).map(Number)
                        const milliseconds = (numbers[numbers.length - 2] * 60 * 60 * 1000) + (numbers[numbers.length - 1] * 60 * 1000)
                        chrome.runtime.sendMessage({later: Date.now() + milliseconds})
                    }
                }
            } catch (error) {
                clearInterval(timer)
                throwError(error)
            }
        }, 1000)
    }
}