if (document.readyState !== 'loading') {
    // chrome.runtime.sendMessage({message: 'Ошибка уровня injectScript, скрипт isTrusted был внедрён слишком поздно, document.readyState: ' + document.readyState + ', работа авто-голосования прекращена во избежании обнаружения владельцем сайта что мы авто-голосуем', ignoreReport: true})
} else {
    window.portIsTrusted = document.createElement('div')
    window.portIsTrusted.id = 'avr-it-port'
    document.documentElement.appendChild(window.portIsTrusted)
}