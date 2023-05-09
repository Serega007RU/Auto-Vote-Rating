if (document.readyState === 'loading') {
    window.portAlert = document.createElement('div')
    window.portAlert.id = 'avr-alert-port'
    document.documentElement.appendChild(window.portAlert)
}