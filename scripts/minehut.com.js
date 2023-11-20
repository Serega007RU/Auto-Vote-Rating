async function vote(first) {
    await document.querySelector('span[aria-label="caret-up"]').click()

    // Ожидаем когда модалка откроется
    await new Promise(resolve => {
        const timer = setInterval(() => {
            if (document.querySelector('.ant-modal-content')) {
                clearInterval(timer)
                resolve()
            }
        }, 1000)
    })

    const project = await getProject()

    const textInputRef = document.querySelector('div.ant-modal-body input[type="text"]')
    const prototype = Object.getPrototypeOf(textInputRef)
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set
    prototypeValueSetter.call(textInputRef, project.nick)
    textInputRef.dispatchEvent(new Event('input', { bubbles: true }))

    document.querySelector('.ant-modal-footer button.ant-btn-primary').click()
}

const timer = setInterval(() => {
    try {
        if (document.querySelector('.ant-typography-warning')) {
            clearInterval(timer)
            const message = document.querySelector('.ant-typography-warning').innerText.trim()
            if (message.includes('Vote again in')) {
                const numbers = message.match(/\d+/g).map(Number)
                const milliseconds = numbers[0] * 60 * 60 * 1000
                chrome.runtime.sendMessage({later: Date.now() + milliseconds})
            } else {
                chrome.runtime.sendMessage({message})
            }
        } else if (document.querySelector('.ant-notification')) {
            clearInterval(timer)
            const message = document.querySelector('.ant-notification').innerText.trim()
            if (message.includes('Success') && message.includes('Your vote for') && message.includes('was recorded')) {
                chrome.runtime.sendMessage({successfully: true})
            } else {
                chrome.runtime.sendMessage({message})
            }
        }
    } catch (error) {
        throwError(error)
    }
}, 1000)