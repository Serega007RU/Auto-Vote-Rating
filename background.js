//Список рейтингов
var allProjects = {
    TopCraft: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/'
        case 'pageURL': return 'https://topcraft.ru/servers/' + project.id + '/'
        case 'jsPath': return '#project-about > table > tbody > tr:nth-child(1) > td:nth-child(2) > a'
        case 'exampleURL': return ['https://topcraft.ru/servers/', '10496', '/']
        case 'URL': return 'TopCraft.ru'
    }},
    McTOP: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://mctop.su/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/'
        case 'pageURL': return 'https://mctop.su/servers/' + project.id + '/'
        case 'jsPath': return '#project-about > div.row > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a'
        case 'exampleURL': return ['https://mctop.su/servers/', '5231', '/']
        case 'URL': return 'McTOP.su'
    }},
    MCRate: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=' + project.id + '&response_type=code'  
        case 'pageURL': return 'http://mcrate.su/project/' + project.id
        case 'jsPath': return '#button-circle > a'
        case 'exampleURL': return ['http://mcrate.su/rate/', '4396', '']
        case 'URL': return 'MCRate.su'
    }},
    MinecraftRating: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=https://minecraftrating.ru/projects/' + project.id + '/&state=' + project.nick + '&response_type=code&v=5.45'
        case 'pageURL': return 'https://minecraftrating.ru/projects/' + project.id + '/'
        case 'jsPath': return 'table[class="table server-table"] > tbody > tr:nth-child(2) > td:nth-child(2) > a'
        case 'exampleURL': return ['https://minecraftrating.ru/projects/', 'cubixworld', '/']
        case 'URL': return 'MinecraftRating.ru'
    }},
    MonitoringMinecraft: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://monitoringminecraft.ru/top/' + project.id + '/vote'
        case 'pageURL': return 'https://monitoringminecraft.ru/top/' + project.id + '/'
        case 'jsPath': return '#page > div.box.visible.main > div.left > table > tbody > tr:nth-child(1) > td.wid > noindex > a'
        case 'exampleURL': return ['https://monitoringminecraft.ru/top/', 'gg', '/vote']
        case 'URL': return 'MonitoringMinecraft.ru'
    }},
    IonMc: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://ionmc.top/projects/' + project.id + '/vote'
        case 'pageURL': return 'https://ionmc.top/projects/' + project.id + '/vote'
        case 'jsPath': return '#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.mx-2.-mt-1.mb-1.sm\\:mx-5.sm\\:my-2 > ul > li:nth-child(2) > a'
        case 'exampleURL': return ['https://ionmc.top/projects/', '80', '/vote']
        case 'URL': return 'IonMc.top'
    }},
    MinecraftServersOrg: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraftservers.org/vote/' + project.id
        case 'pageURL': return 'https://minecraftservers.org/server/' + project.id
        case 'jsPath': return '#left > div > h1'
        case 'exampleURL': return ['https://minecraftservers.org/vote/', '25531', '']
        case 'URL': return 'MinecraftServers.org'
    }},
    ServeurPrive: (type, project)=> { switch (type) {
        case 'voteURL': 
        case 'pageURL':
            if (project.lang == 'en') {
                return 'https://serveur-prive.net/' + project.lang + '/' + project.game + '/' + project.id + '/vote'
            } else {
                return 'https://serveur-prive.net/' + project.game + '/' + project.id + '/vote'
            }
        case 'jsPath': return '#t > div > div > h2'
        case 'exampleURL': return ['https://serveur-prive.net/minecraft/', 'gommehd-net-4932', '/vote']
        case 'URL': return 'Serveur-Prive.net'
    }},
    PlanetMinecraft: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.planetminecraft.com/server/' + project.id + '/vote/'
        case 'pageURL': return 'https://www.planetminecraft.com/server/' + project.id + '/'
        case 'jsPath': return '#resource-title-text'
        case 'exampleURL': return ['https://www.planetminecraft.com/server/', 'legends-evolved', '/vote/']
        case 'URL': return 'PlanetMinecraft.com'
    }},
    TopG: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://topg.org/' + project.game + '/server-' + project.id
        case 'pageURL': return 'https://topg.org/' + project.game + '/server-' + project.id
        case 'jsPath': return 'div.sheader'
        case 'exampleURL': return ['https://topg.org/minecraft-servers/server-', '405637', '']
        case 'URL': return 'TopG.org'
    }},
    ListForge: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://' + project.game + '/server/' + project.id + '/vote/'
        case 'pageURL': return 'https://' + project.game + '/server/' + project.id + '/vote/'
        case 'jsPath': return 'head > title'
        case 'exampleURL': return ['https://minecraft-mp.com/server/', '81821', '/vote/']
        case 'URL': return 'ListForge.net'
    }},
    MinecraftServerList: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraft-server-list.com/server/' + project.id + '/vote/'
        case 'pageURL': return 'https://minecraft-server-list.com/server/' + project.id + '/'
        case 'jsPath': return '#site-wrapper > section > div.hfeed > span > div.serverdatadiv > table > tbody > tr:nth-child(5) > td > a'
        case 'exampleURL': return ['https://minecraft-server-list.com/server/', '292028', '/vote/']
        case 'URL': return 'Minecraft-Server-List.com'
    }},
    ServerPact: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.serverpact.com/vote-' + project.id
        case 'pageURL': return 'https://www.serverpact.com/vote-' + project.id
        case 'jsPath': return 'body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(2) > div > div.panel-body > table > tbody > tr:nth-child(6) > td:nth-child(2) > a'
        case 'exampleURL': return ['https://www.serverpact.com/vote-', '26492123', '']
        case 'URL': return 'ServerPact.com'
    }},
    MinecraftIpList: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id
        case 'pageURL': return 'https://minecraftiplist.com/server/-' + project.id
        case 'jsPath': return '#addr > span:nth-child(3)'
        case 'exampleURL': return ['https://minecraftiplist.com/index.php?action=vote&listingID=', '2576', '']
        case 'URL': return 'MinecraftIpList.com'
    }},
    TopMinecraftServers: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://topminecraftservers.org/vote/' + project.id
        case 'pageURL': return 'https://topminecraftservers.org/server/' + project.id
        case 'jsPath': return 'body > div.container > div > div > div > div.col-md-8 > h1'
        case 'exampleURL': return ['https://topminecraftservers.org/vote/', '9126', '']
        case 'URL': return 'TopMinecraftServers.org'
    }},
    MinecraftServersBiz: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraftservers.biz/' + project.id + '/'
        case 'pageURL': return 'https://minecraftservers.biz/' + project.id + '/'
        case 'jsPath': return 'table[class="table table-hover table-striped"] > tbody > tr:nth-child(4) > td:nth-child(2)'
        case 'exampleURL': return ['https://minecraftservers.biz/', 'servers/145999', '/']
        case 'URL': return 'MinecraftServers.biz'
    }},
    HotMC: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://hotmc.ru/vote-' + project.id
        case 'pageURL': return 'https://hotmc.ru/minecraft-server-' + project.id
        case 'jsPath': return 'div[class="text-server"] > h1'
        case 'exampleURL': return ['https://hotmc.ru/vote-', '199493', '']
        case 'URL': return 'HotMC.ru'
    }},
    MinecraftServerNet: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraft-server.net/vote/' + project.id + '/'
        case 'pageURL': return 'https://minecraft-server.net/details/' + project.id + '/'
        case 'jsPath': return 'div.card-header > h1'
        case 'exampleURL': return ['https://minecraft-server.net/vote/', 'TitanicFreak', '/']
        case 'URL': return 'Minecraft-Server.net'
    }},
    TopGames: (type, project)=> { switch (type) {
        case 'voteURL':
            if (project.lang == 'fr') {
                return 'https://top-serveurs.net/' + project.game + '/vote/' + project.id
            } else if (project.lang == 'en') {
                return 'https://top-games.net/' + project.game + '/vote/' + project.id
            } else {
                return 'https://' + project.lang + '.top-games.net/' + project.game + '/vote/' + project.id
            }
        case 'pageURL':
            if (project.lang == 'fr') {
                return 'https://top-serveurs.net/' + project.game + '/' + project.id
            } else if (project.lang == 'en') {
                return 'https://top-games.net/' + project.game + '/' + project.id
            } else {
                return 'https://' + project.lang + '.top-games.net/' + project.game + '/' + project.id
            }
        case 'jsPath': return 'body > div.game-jumbotron > div > div > h1'
        case 'exampleURL': return ['https://top-serveurs.net/minecraft/', 'icesword-pvpfaction-depuis-2014-crack-on', '']
        case 'URL': return 'Top-Games.net'
    }},
    TMonitoring: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://tmonitoring.com/server/' + project.id + '/'
        case 'pageURL': return 'https://tmonitoring.com/server/' + project.id + '/'
        case 'jsPath': return 'div[class="info clearfix"] > div.pull-left > h1'
        case 'exampleURL': return ['https://tmonitoring.com/server/', 'qoobworldru', '']
        case 'URL': return 'TMonitoring.com'
    }},
    TopGG: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://top.gg/' + project.game + '/' + project.id + '/vote' + project.addition
        case 'pageURL': return 'https://top.gg/' + project.game + '/' + project.id + '/vote'
        case 'jsPath': return '#entity-title'
        case 'exampleURL': return ['https://top.gg/bot/', '270904126974590976', '/vote']
        case 'URL': return 'Top.gg'
    }},
    DiscordBotList: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://discordbotlist.com/bots/' + project.id + '/upvote'
        case 'pageURL': return 'https://discordbotlist.com/bots/' + project.id
        case 'jsPath': return 'h1[class="bot-name"]'
        case 'exampleURL': return ['https://discordbotlist.com/bots/', 'dank-memer', '/upvote']
        case 'URL': return 'DiscordBotList.com'
    }},
    BotsForDiscord: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://botsfordiscord.com/bot/' + project.id + '/vote'
        case 'pageURL': return 'https://botsfordiscord.com/bot/' + project.id + '/vote'
        case 'jsPath': return 'h2[class="subtitle"] > b'
        case 'exampleURL': return ['https://botsfordiscord.com/bot/', '469610550159212554', '/vote']
        case 'URL': return 'BotsForDiscord.com'
    }},
    MMoTopRU: (type, project)=> { switch (type) {
        case 'voteURL':
            if (project.lang == 'ru') {
                return 'https://' + project.game + '.mmotop.ru/servers/' + project.id + '/votes/new'
            } else {
                return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id + '/votes/new'
            }
        case 'pageURL':
            if (project.lang == 'ru') {
                return 'https://' + project.game + '.mmotop.ru/servers/' + project.id
            } else {
                return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id
            }
        case 'jsPath': return '#site-link'
        case 'exampleURL': return ['https://pw.mmotop.ru/servers/', '25895', '/votes/new']
        case 'URL': return 'MMoTop.ru'
    }},
    MCServers: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://mc-servers.com/mcvote/' + project.id + '/'
        case 'pageURL': return 'https://mc-servers.com/details/' + project.id + '/'
        case 'jsPath': return 'a[href="/details/' + project.id + '"]'
        case 'exampleURL': return ['https://mc-servers.com/mcvote/', '1890', '/']
        case 'URL': return 'MC-Servers.com'
    }},
    MinecraftList: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraftlist.org/vote/' + project.id
        case 'pageURL': return 'https://minecraftlist.org/server/' + project.id
        case 'jsPath': return 'h1'
        case 'exampleURL': return ['https://minecraftlist.org/vote/', '11227', '']
        case 'URL': return 'MinecraftList.org'
    }},
    MinecraftIndex: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.minecraft-index.com/' + project.id + '/vote'
        case 'pageURL': return 'https://www.minecraft-index.com/' + project.id
        case 'jsPath': return 'h3.stitle'
        case 'exampleURL': return ['https://www.minecraft-index.com/', '33621-extremecraft-net', '/vote']
        case 'URL': return 'Minecraft-Index.com'
    }},
    ServerList101: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://serverlist101.com/server/' + project.id + '/vote/'
        case 'pageURL': return 'https://serverlist101.com/server/' + project.id + '/'
        case 'jsPath': return 'li > h1'
        case 'exampleURL': return ['https://serverlist101.com/server/', '1547', '/vote/']
        case 'URL': return 'ServerList101.com'
    }},
    MCServerList: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://mcserver-list.eu/hlasovat?id=' + project.id
        case 'pageURL': return 'https://api.mcserver-list.eu/server/?id=' + project.id
        case 'jsPath': return ''
        case 'exampleURL': return ['https://mcserver-list.eu/hlasovat/?id=', '307', '']
        case 'URL': return 'MCServer-List.eu'
    }},
    CraftList: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://craftlist.org/' + project.id
        case 'pageURL': return 'https://craftlist.org/' + project.id
        case 'jsPath': return 'main h1'
        case 'exampleURL': return ['https://craftlist.org/', 'basicland', '']
        case 'URL': return 'CraftList.org'
    }},
    CzechCraft: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://czech-craft.eu/server/' + project.id + '/vote/'
        case 'pageURL': return 'https://czech-craft.eu/server/' + project.id + '/'
        case 'jsPath': return 'a.server-name'
        case 'exampleURL': return ['https://czech-craft.eu/server/', 'trenend', '/vote/']
        case 'URL': return 'Czech-Craft.eu'
    }},
    PixelmonServers: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://pixelmonservers.com/server/' + project.id + '/vote'
        case 'pageURL': return 'https://pixelmonservers.com/server/' + project.id + '/vote'
        case 'jsPath': return '#title'
        case 'exampleURL': return ['https://pixelmonservers.com/server/', '8IO9idMv', '/vote']
        case 'URL': return 'PixelmonServers.com'
    }},
    QTop: (type, project)=> { switch (type) {
        case 'voteURL': return 'http://q-top.ru/vote' + project.id
        case 'pageURL': return 'http://q-top.ru/vote' + project.id
        case 'jsPath': return 'a[href="profile' + project.id + '"]'
        case 'exampleURL': return ['http://q-top.ru/vote', '1549', '']
        case 'URL': return 'Q-Top.ru'
    }},
    MinecraftBuzz: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraft.buzz/server/' + project.id + '&tab=vote'
        case 'pageURL': return 'https://minecraft.buzz/server/' + project.id
        case 'jsPath': return '[href="server/' + project.id + '"]'
        case 'exampleURL': return ['https://minecraft.buzz/server/', '306', '&tab=vote']
        case 'URL': return 'Minecraft.Buzz'
    }},
    MinecraftServery: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraftservery.eu/server/' + project.id
        case 'pageURL': return 'https://minecraftservery.eu/server/' + project.id
        case 'jsPath': return 'div.container div.box h1.title'
        case 'exampleURL': return ['https://minecraftservery.eu/server/', '105', '']
        case 'URL': return 'MinecraftServery.eu'
    }},
    RPGParadize: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.rpg-paradize.com/?page=vote&vote=' + project.id
        case 'pageURL': return 'https://www.rpg-paradize.com/?page=vote&vote=' + project.id
        case 'jsPath': return 'div.div-box > h1'
        case 'exampleURL': return ['https://www.rpg-paradize.com/?page=vote&vote=', '113763', '']
        case 'URL': return 'RPG-Paradize.com'
    }},
    MinecraftServerListNet: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.minecraft-serverlist.net/vote/' + project.id
        case 'pageURL': return 'https://www.minecraft-serverlist.net/vote/' + project.id
        case 'jsPath': return 'a.server-name'
        case 'exampleURL': return ['https://www.minecraft-serverlist.net/vote/', '51076', '']
        case 'URL': return 'Minecraft-ServerList.net'
    }},
    MinecraftServerEu: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://minecraft-server.eu/vote/index/' + project.id
        case 'pageURL': return 'https://minecraft-server.eu/server/index/' + project.id
        case 'jsPath': return 'div.serverName'
        case 'exampleURL': return ['https://minecraft-server.eu/vote/index/', '1A73C', '']
        case 'URL': return 'Minecraft-Server.eu'
    }},
    MinecraftKrant: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.minecraftkrant.nl/serverlijst/' + project.id
        case 'pageURL': return 'https://www.minecraftkrant.nl/serverlijst/' + project.id
        case 'jsPath': return 'div.inner-title'
        case 'exampleURL': return ['https://www.minecraftkrant.nl/serverlijst/', 'torchcraft', '']
        case 'URL': return 'MinecraftKrant.nl'
    }},
    TrackyServer: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.trackyserver.com/server/' + project.id
        case 'pageURL': return 'https://www.trackyserver.com/server/' + project.id
        case 'jsPath': return 'div.panel h1'
        case 'exampleURL': return ['https://www.trackyserver.com/server/', 'anubismc-486999', '']
        case 'URL': return 'TrackyServer.com'
    }},
    MCListsOrg: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://mc-lists.org/' + project.id + '/vote'
        case 'pageURL': return 'https://mc-lists.org/' + project.id + '/vote'
        case 'jsPath': return 'div.header > div.ui.container'
        case 'exampleURL': return ['https://mc-lists.org/', 'server-luxurycraft.1818', '/vote']
        case 'URL': return 'MC-Lists.org'
    }},
    TopMCServersCom: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://topmcservers.com/server/' + project.id + '/vote'
        case 'pageURL': return 'https://topmcservers.com/server/' + project.id
        case 'jsPath': return '#serverPage > h1.header'
        case 'exampleURL': return ['https://topmcservers.com/server/', '17', '/vote']
        case 'URL': return 'TopMCServers.com'
    }},
    BestServersCom: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://bestservers.com/server/' + project.id + '/vote'
        case 'pageURL': return 'https://bestservers.com/server/' + project.id + '/vote'
        case 'jsPath': return 'a[href="/server/' + project.id + '"]'
        case 'exampleURL': return ['https://bestservers.com/server/', '1135', '/vote']
        case 'URL': return 'BestServers.com'
    }},
    CraftListNet: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://craft-list.net/minecraft-server/' + project.id + '/vote'
        case 'pageURL': return 'https://craft-list.net/minecraft-server/' + project.id
        case 'jsPath': return 'div.serverpage-navigation-headername.header'
        case 'exampleURL': return ['https://craft-list.net/minecraft-server/', 'Advancius-Network', '/vote']
        case 'URL': return 'Craft-List.net'
    }},
    MinecraftServersListOrg: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.minecraft-servers-list.org/index.php?a=in&u=' + project.id
        case 'pageURL': return 'https://www.minecraft-servers-list.org/details/' + project.id + '/'
        case 'jsPath': return 'div.card-header > h1'
        case 'exampleURL': return ['https://www.minecraft-servers-list.org/index.php?a=in&u=', 'chromity', '']
        case 'URL': return 'Minecraft-Servers-List.org'
    }},
    ServerListe: (type, project)=> { switch (type) {
        case 'voteURL': return 'https://www.serverliste.net/vote/' + project.id
        case 'pageURL': return 'https://www.serverliste.net/vote/' + project.id
        case 'jsPath': return '#bar > h3'
        case 'exampleURL': return ['https://www.serverliste.net/vote/', '775', '']
        case 'URL': return 'ServerListe.net'
    }},
    Custom: (type, project)=> { switch (type) {
        case 'pageURL': return project.responseURL
        case 'exampleURL': return ['', '', '']
        case 'URL': return 'Custom'
    }}
}

var db

//Настройки
var settings

//Общая статистика
var generalStats

//Текущие открытые вкладки расширением
var openedProjects = new Map()
//Текущие fetch запросы
let fetchProjects = new Map()
//Текущие проекты за которые сейчас голосует расширение
var queueProjects = new Set()

//Есть ли доступ в интернет?
var online = true

var secondVoteMinecraftIpList = false

//Нужно ли щас делать проверку голосования, false может быть только лишь тогда когда предыдущая проверка ещё не завершилась
var check = true

//Закрывать ли вкладку после окончания голосования? Это нужно для диагностирования ошибки
var closeTabs = true

//Где храним настройки
let storageArea = 'local'

if (chrome.runtime.onSuspend) {
    chrome.runtime.onSuspend.addListener(function(){
        console.warn(chrome.i18n.getMessage('suspended'))
    })
}

//Инициализация настроек расширения
initializeConfig()
async function initializeConfig() {

    const openRequest = indexedDB.open('avr', 1)
    openRequest.onupgradeneeded = function() {
        // срабатывает, если на клиенте нет базы данных
        // ...выполнить инициализацию...
        const ratings = openRequest.result.createObjectStore('projects', {autoIncrement: true})
        ratings.createIndex('rating, id, nick', ['rating', 'id', 'nick'])
        ratings.createIndex('rating, id', ['rating', 'id'])
        ratings.createIndex('rating, nick', ['rating', 'nick'])
        ratings.createIndex('rating', 'rating')
        openRequest.result.createObjectStore('other')
        const other = openRequest.transaction.objectStore('other')
        settings = {
            disabledNotifStart: true,
            disabledNotifInfo: false,
            disabledNotifWarn: false,
            disabledNotifError: false,
            enabledSilentVote: true,
            disabledCheckTime: false,
            disabledCheckInternet: false,
            enableCustom: false,
            cooldown: 1000
        }
        other.add(settings, 'settings')
        generalStats = {
            successVotes: 0,
            monthSuccessVotes: 0,
            lastMonthSuccessVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null,
            added: Date.now()
        }
        other.add(generalStats, 'generalStats')
    }
    db = await new Promise((resolve, reject) => {
        openRequest.onerror = function() {
            reject(openRequest.error)
        }
        openRequest.onsuccess = function() {
            resolve(openRequest.result)
        }
    })
    db.onerror = function(event) {
        console.error(chrome.i18n.getMessage('errordb', ['avr', event.target.error]))
    }
    await new Promise(resolve => {
        const transaction = db.transaction('other')
        transaction.objectStore('other').get('settings').onsuccess = function(event) {
            settings = event.target.result
        }
        transaction.objectStore('other').get('generalStats').onsuccess = function(event) {
            generalStats = event.target.result
        }
        transaction.oncomplete = resolve
    })

//  storageArea = await getValue('storageArea', 'local')
//  if (storageArea == null || storageArea == '') {
//      if (await getValue('AVMRsettings', 'sync') != null) {
//          storageArea = 'sync'
//      } else {
//          storageArea = 'local'
//      }
//      await setValue('storageArea', storageArea)
//  }

    let cooldown = 1000
    if (settings && settings.cooldown && Number.isInteger(settings.cooldown)) cooldown = settings.cooldown

    if (settings && !settings.disabledCheckTime) checkTime()
    
    //Да да, целую минуту ждём перед запуском расширения, больше никак не понять когда закончилась синхронизация браузера
//  if (storageArea == 'sync') await wait(60000)

    //Проверка на голосование
    setInterval(async()=>{
        await checkVote()
    }, cooldown)
}

//Проверялка: нужно ли голосовать, сверяет время текущее с временем из конфига
async function checkVote() {

    //Если после попытки голосования не было интернета, проверяется есть ли сейчас интернет и если его нет то не допускает последующую проверку но есои наоборот появился интернет, устаналвивает статус online на true и пропускает код дальше
    if (!settings.disabledCheckInternet && !online) {
        if (navigator.onLine) {
            console.log(chrome.i18n.getMessage('internetRestored'))
            online = true
        } else {
            return
        }
    }

    if (check) {
        check = false
    } else {
        return
    }
    
    const projects = await new Promise(resolve=> db.transaction('projects').objectStore('projects').getAll().onsuccess = event => resolve(event.target.result))

    for (const project of projects) {
        if (project.time == null || project.time < Date.now()) {
            await checkOpen(project)
        }
    }

    check = true
}

async function checkOpen(project) {
    //Если нет подключения к интернету
    if (!settings.disabledCheckInternet) {
        if (!navigator.onLine && online) {
            online = false
            console.warn(chrome.i18n.getMessage('internetDisconected'))
            if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('internetDisconected'))
            return
        } else if (!online) {
            return
        }
    }

    //Не позволяет открыть больше одной вкладки для одного топа или если проект рандомизирован но если проект голосует больше 5 или 15 минут то идёт на повторное голосование
    for (let value of queueProjects) {
        if (project.rating == value.rating || value.randomize && project.randomize) {
            if (!value.nextAttempt)
                return
            if (Date.now() < value.nextAttempt) {
                return
            } else {
                queueProjects.delete(value)
                console.warn(getProjectPrefix(value, true) + chrome.i18n.getMessage('timeout'))
                if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(value, false), chrome.i18n.getMessage('timeout'))
            }
        }
    }

    let retryCoolDown
    if (project.rating == 'TopCraft' || project.rating == 'McTOP' || project.rating == 'MCRate' || project.rating == 'MinecraftRating' || project.rating == 'MonitoringMinecraft' || project.rating == 'ServerPact' || project.rating == 'MinecraftIpList' || project.rating == 'MCServerList') {
        retryCoolDown = 300000
    } else {
        retryCoolDown = 900000
    }
    project.nextAttempt = Date.now() + retryCoolDown
    queueProjects.add(project)

    //Если эта вкладка была уже открыта, он закрывает её
    for (let[key,value] of openedProjects.entries()) {
        if (value.nick == project.nick && value.id == project.id && project.rating == value.rating) {
            openedProjects.delete(key)
            if (closeTabs) {
                chrome.tabs.remove(key, function() {
                    if (chrome.runtime.lastError) {
                        console.warn(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                        if (!settings.disabledNotifError && chrome.runtime.lastError.message != 'No tab with id.')
                            sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                    }
                })
            }
        }
    }

    delete project.error

    console.log(getProjectPrefix(project, true) + chrome.i18n.getMessage('startedAutoVote'))
    if (!settings.disabledNotifStart)
        sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('startedAutoVote'))

    if (project.rating == 'MonitoringMinecraft') {
        let url
        if (project.rating == 'MonitoringMinecraft') {
            url = '.monitoringminecraft.ru'
        }
        let cookies = await new Promise(resolve=>{
            chrome.cookies.getAll({domain: url}, function(cookies) {
                resolve(cookies)
            })
        })
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].domain.charAt(0) == '.') {
                await removeCookie('https://' + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name)
            } else {
                await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
            }
        }
    }

    await newWindow(project)
}

//Открывает вкладку для голосования или начинает выполнять fetch закросы
async function newWindow(project) {
    if (new Date(project.stats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(project.stats.lastAttemptVote).getFullYear() < new Date().getFullYear()) {
        project.stats.lastMonthSuccessVotes = project.stats.monthSuccessVotes
        project.stats.monthSuccessVotes = 0
    }
    project.stats.lastAttemptVote = Date.now()

    if (new Date(generalStats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(generalStats.lastAttemptVote).getFullYear() < new Date().getFullYear()) {
        generalStats.lastMonthSuccessVotes = generalStats.monthSuccessVotes
        generalStats.monthSuccessVotes = 0
    }
    generalStats.lastAttemptVote = Date.now()
    await updateGeneralStats()
    await updateProject(project)

    let silentVoteMode = false
    if (project.rating == 'Custom') {
        silentVoteMode = true
    } else if (settings.enabledSilentVote) {
        if (!project.emulateMode && (project.rating == 'TopCraft' || project.rating == 'McTOP' || project.rating == 'MCRate' || project.rating == 'MinecraftRating' || project.rating == 'MonitoringMinecraft' || project.rating == 'ServerPact' || project.rating == 'MinecraftIpList' || project.rating == 'MCServerList')) {
            silentVoteMode = true
        }
    } else if (project.silentMode && (project.rating == 'TopCraft' || project.rating == 'McTOP' || project.rating == 'MCRate' || project.rating == 'MinecraftRating' || project.rating == 'MonitoringMinecraft' || project.rating == 'ServerPact' || project.rating == 'MinecraftIpList' || project.rating == 'MCServerList')) {
        silentVoteMode = true
    }
    if (silentVoteMode) {
        silentVote(project)
    } else {
        let window = await new Promise(resolve=>{
            chrome.windows.getCurrent(function(win) {
                if (chrome.runtime.lastError && chrome.runtime.lastError.message == 'No current window') {} else if (chrome.runtime.lastError) {
                    console.error(chrome.i18n.getMessage('errorOpenTab') + chrome.runtime.lastError.message)
                }
                resolve(win)
            })
        })
        if (window == null) {
            window = await new Promise(resolve=>{
                chrome.windows.create({focused: false}, function(win) {
                    resolve(win)
                })
            })
            chrome.windows.update(window.id, {focused: false})
        }

        const url = allProjects[project.rating]('voteURL', project)
        
        let tab = await new Promise(resolve=>{
            chrome.tabs.create({url, active: false}, function(tab_) {
                resolve(tab_)
            })
        })
        openedProjects.set(tab.id, project)
    }
}

async function silentVote(project) {
    try {
        if (project.rating == 'TopCraft') {
            let response = await _fetch('https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/', null, project)
            if (!await checkResponseError(project, response, 'topcraft.ru', null, true)) return
            let csrftoken = response.doc.querySelector('input[name="csrfmiddlewaretoken"]').value
            response = await _fetch('https://topcraft.ru/projects/vote/', {
                'headers': {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                'body': 'csrfmiddlewaretoken=' + csrftoken + '&project_id=' + project.id + '&nick=' + project.nick,
                'method': 'POST'
            }, project)
            if (!await checkResponseError(project, response, 'topcraft.ru', [400], true)) return
            if (response.status == 400) {
                if (response.html == 'vk_error' || response.html == 'nick_error') {
                    endVote({later: response.html}, null, project)
                } else if (response.html.length > 0 && response.html.length < 500) {
                    endVote({message: response.html}, null, project)
                } else {
                    endVote({message: chrome.i18n.getMessage('errorVote', String(response.status))}, null, project)
                }
                return
            }
            endVote({successfully: true}, null, project)
            return
        } else

        if (project.rating == 'McTOP') {
            let response = await _fetch('https://mctop.su/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/', null, project)
            if (!await checkResponseError(project, response, 'mctop.su', null, true)) return
            let csrftoken = response.doc.querySelector('input[name="csrfmiddlewaretoken"]').value
            response = await _fetch('https://mctop.su/projects/vote/', {
                'headers': {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                'body': 'csrfmiddlewaretoken=' + csrftoken + '&project_id=' + project.id + '&nick=' + project.nick,
                'method': 'POST'
            }, project)
            if (!await checkResponseError(project, response, 'mctop.su', [400], true)) return
            if (response.status == 400) {
                if (response.html == 'vk_error' || response.html == 'nick_error') {
                    endVote({later: response.html}, null, project)
                } else if (response.html.length > 0 && response.html.length < 500) {
                    endVote({message: response.html}, null, project)
                } else {
                    endVote({message: chrome.i18n.getMessage('errorVote', String(response.status))}, null, project)
                }
                return
            }
            endVote({successfully: true}, null, project)
            return
        } else

        if (project.rating == 'MCRate') {
            let response = await _fetch('https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=' + project.id + '&response_type=code', null, project)
            if (!await checkResponseError(project, response, 'mcrate.su', null, true)) return
            let code = response.url.substring(response.url.length - 18)
            if (response.doc.querySelector('input[name=login_player]') != null) {
                response = await _fetch('http://mcrate.su/save/rate', {
                    'headers': {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                        'cache-control': 'max-age=0',
                        'content-type': 'application/x-www-form-urlencoded',
                        'upgrade-insecure-requests': '1'
                    },
                    'referrer': 'http://mcrate.su/add/rate?idp=' + project.id + '&code=' + code,
                    'referrerPolicy': 'no-referrer-when-downgrade',
                    'body': 'login_player=' + project.nick + '&token_vk_secure=' + response.doc.getElementsByName('token_vk_secure').item(0).value + '&uid_vk_secure=' + response.doc.getElementsByName('uid_vk_secure').item(0).value + '&id_project=' + project.id + '&code_vk_secure=' + response.doc.getElementsByName('code_vk_secure').item(0).value + '&mcrate_hash=' + response.doc.getElementsByName('mcrate_hash').item(0).value,
                    'method': 'POST'
                }, project)
                if (!await checkResponseError(project, response, 'mcrate.su', null, true)) return
            }
            if (response.doc.querySelector('div[class=report]') != null) {
                if (response.doc.querySelector('div[class=report]').textContent.includes('Ваш голос засчитан')) {
                    endVote({successfully: true}, null, project)
                } else {
                    endVote({message: response.doc.querySelector('div[class=report]').textContent}, null, project)
                }
                return
            } else if (response.doc.querySelector('span[class=count_hour]') != null) {
//              Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
//              Берёт из скрипта переменную в которой хранится сколько осталось до следующего голосования
//              let count2 = response.doc.querySelector('#center-main > div.center_panel > script:nth-child(2)').text.substring(30, 45)
//              let count = count2.match(/\d+/g).map(Number)
//              let hour = parseInt(count / 3600)
//              let min = parseInt((count - hour * 3600) / 60)
//              let sec = parseInt(count - (hour * 3600 + min * 60))
//              let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
//              if (milliseconds == 0) return
//              let later = Date.now() - (86400000 - milliseconds)
                endVote({later: true}, null, project)
                return
            } else if (response.doc.querySelector('div[class="error"]') != null) {
                if (response.doc.querySelector('div[class="error"]').textContent.includes("уже голосовали")) {
                    endVote({later: true}, null, project)
                }
                endVote({message: response.doc.querySelector('div[class="error"]').textContent}, null, project)
                return
            } else {
                endVote({errorVoteNoElement: true}, null, project)
                return
            }
        } else

        if (project.rating == 'MinecraftRating') {
            let response = await _fetch('https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=https://minecraftrating.ru/projects/' + project.id + '/&state=' + project.nick + '&response_type=code&v=5.45', null, project)
            if (!await checkResponseError(project, response, 'minecraftrating.ru', null, true)) return
            if (response.doc.querySelector('div.alert.alert-danger') != null) {
                if (response.doc.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
//                  let numbers = response.doc.querySelector('div.alert.alert-danger').textContent.match(/\d+/g).map(Number)
//                  let count = 0
//                  let year = 0
//                  let month = 0
//                  let day = 0
//                  let hour = 0
//                  let min = 0
//                  let sec = 0
//                  for (let i in numbers) {
//                      if (count == 0) {
//                          hour = numbers[i]
//                      } else if (count == 1) {
//                          min = numbers[i]
//                      } else if (count == 2) {
//                          sec = numbers[i]
//                      } else if (count == 3) {
//                          day = numbers[i]
//                      } else if (count == 4) {
//                          month = numbers[i]
//                      } else if (count == 5) {
//                          year = numbers[i]
//                      }
//                      count++
//                  }
//                  let later = Date.UTC(year, month - 1, day, hour, min, sec, 0) - 86400000 - 10800000
                    endVote({later: true}, null, project)
                    return
                } else {
                    endVote({message: response.doc.querySelector('div.alert.alert-danger').textContent}, null, project)
                    return
                }
            } else if (response.doc.querySelector('div.alert.alert-success') != null) {
                if (response.doc.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
                    endVote({successfully: true}, null, project)
                    return
                } else {
                    endVote({message: response.doc.querySelector('div.alert.alert-success').textContent}, null, project)
                    return
                }
            } else {
                endVote({message: 'Error! div.alert.alert-success или div.alert.alert-danger is null'}, null, project)
                return
            }
        } else

        if (project.rating == 'MonitoringMinecraft') {
            let i = 0
            while (i <= 3) {
                i++
                let response = await _fetch('https://monitoringminecraft.ru/top/' + project.id + '/vote', {
                    'headers': {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    'body': 'player=' + project.nick + '',
                    'method': 'POST'
                }, project)
                if (!await checkResponseError(project, response, 'monitoringminecraft.ru', [503], true)) return
                if (response.status == 503) {
                    if (i >= 3) {
                        endVote({message: chrome.i18n.getMessage('errorAttemptVote', 'response code: ' + String(response.status))}, null, project)
                        return
                    }
                    await wait(5000)
                    continue
                }

                if (response.doc.querySelector('body') != null && response.doc.querySelector('body').textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
                    if (i >= 3) {
                        endVote({message: chrome.i18n.getMessage('errorAttemptVote') + response.doc.querySelector('body').textContent}, null, project)
                        return
                    }
                    await wait(5000)
                    continue
                }
                if (document.querySelector('form[method="POST"]') != null && document.querySelector('form[method="POST"]').textContent.includes('Ошибка')) {
                    endVote({message: document.querySelector('form[method="POST"]').textContent.trim()}, null, project)
                    return
                }
                if (response.doc.querySelector('input[name=player]') != null) {
                    if (i >= 3) {
                        endVote({message: chrome.i18n.getMessage('errorAttemptVote', 'input[name=player] is ' + JSON.stringify(response.doc.querySelector('input[name=player]')))}, null, project)
                        return
                    }
                    await wait(5000)
                    continue
                }

                if (response.doc.querySelector('center').textContent.includes('Вы уже голосовали сегодня')) {
//                  //Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
//                  //Берёт последние 30 символов
//                  let string = response.doc.querySelector('center').textContent.substring(response.doc.querySelector('center').textContent.length - 30)
//                  //Из полученного текста достаёт все цифры в Array List
//                  let numbers = string.match(/\d+/g).map(Number)
//                  let count = 0
//                  let hour = 0
//                  let min = 0
//                  let sec = 0
//                  for (let i in numbers) {
//                      if (count == 0) {
//                          hour = numbers[i]
//                      } else if (count == 1) {
//                          min = numbers[i]
//                      }
//                      count++
//                  }
//                  let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
//                  let later = Date.now() + milliseconds
//                  endVote({later: later}, null, project)
                    endVote({later: true}, null, project)
                    return
                } else if (response.doc.querySelector('center').textContent.includes('Вы успешно проголосовали!')) {
                    endVote({successfully: true}, null, project)
                    return
                } else {
                    endVote({errorVoteNoElement: true}, null, project)
                    return
                }
            }
        } else

        if (project.rating == 'ServerPact') {
            let response = await _fetch('https://www.serverpact.com/vote-' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'none',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': null,
                'method': 'GET',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'serverpact.com')) return
            function generatePass(nb) {
                let chars = 'azertyupqsdfghjkmwxcvbn23456789AZERTYUPQSDFGHJKMWXCVBN_-#@'
                let pass = ''
                for (let i = 0; i < nb; i++) {
                    let wpos = Math.round(Math.random() * chars.length)
                    pass += chars.substring(wpos, wpos + 1)
                }
                return pass
            }
            let captchaPass = generatePass(32)
            let captcha = await _fetch('https://www.serverpact.com/v2/QapTcha-master/php/Qaptcha.jquery.php', {
                'headers': {
                    'accept': 'application/json, text/javascript, */*; q=0.01',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'x-requested-with': 'XMLHttpRequest'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': 'action=qaptcha&qaptcha_key=' + captchaPass,
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            let json = captcha.json()
            if (json.error) {
                endVote({message: 'Error in captcha'}, null, project)
                return
            }

            response = await _fetch('https://www.serverpact.com/vote-' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,en-US;q=0.8',
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': response.doc.querySelector('div.QapTcha > input[type=hidden]').name + '=' + response.doc.querySelector('div.QapTcha > input[type=hidden]').value + '&' + captchaPass + '=&minecraftusername=' + project.nick + '&voten=Send+your+vote',
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'serverpact.com')) return
            if (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)') != null && response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)').textContent.includes('You have successfully voted')) {
                endVote({successfully: true}, null, project)
                return
            } else if (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null && (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('You can only vote once') || response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('already voted'))) {
                endVote({later: Date.now() + 43200000}, null, project)
                return
            } else if (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null) {
                endVote({message: response.doc.querySelector('body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning').textContent.substring(0, response.doc.querySelector('body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning').textContent.indexOf('\n'))}, null, project)
                return
            } else {
                endVote({errorVoteUnknown2: true}, null, project)
                return
            }
        } else

        if (project.rating == 'MinecraftIpList') {
            let response = await _fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': null,
                'method': 'GET',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'minecraftiplist.com')) return

            if (response.doc.querySelector('#InnerWrapper > script:nth-child(10)') != null && response.doc.querySelector('table[class="CraftingTarget"]') == null) {
                if (secondVoteMinecraftIpList) {
                    secondVoteMinecraftIpList = false
                    endVote('Error time zone', null, project)
                    return
                }
                await _fetch('https://minecraftiplist.com/timezone.php?timezone=Europe/Moscow', {
                    'headers': {
                        'accept': '*/*',
                        'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                        'cache-control': 'no-cache',
                        'pragma': 'no-cache',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'x-requested-with': 'XMLHttpRequest'
                    },
                    'referrerPolicy': 'no-referrer-when-downgrade',
                    'body': null,
                    'method': 'GET',
                    'mode': 'cors',
                    'credentials': 'include'
                }, project)
                secondVoteMinecraftIpList = true
                silentVote(project)
                return
            }
            if (secondVoteMinecraftIpList) secondVoteMinecraftIpList = false

            if (response.doc.querySelector('#Content > div.Error') != null) {
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
                    endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                    return
                }
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server') || response.doc.querySelector('#Content > div.Error').textContent.includes('has no votes')) {
                    let numbers = response.doc.querySelector('#Content > div.Error').textContent.substring(response.doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
                    let count = 0
                    let hour = 0
                    let min = 0
                    let sec = 0
                    for (let i in numbers) {
                        if (count == 0) {
                            hour = numbers[i]
                        } else if (count == 1) {
                            min = numbers[i]
                        }
                        count++
                    }
                    let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                    endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
                    return
                }
                endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                return
            }

            if (!await getRecipe(response.doc.querySelector('table[class="CraftingTarget"]').firstElementChild.firstElementChild.firstElementChild.firstElementChild.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com'))) {
                endVote({message: 'Couldnt find the recipe: ' + response.doc.querySelector('#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img').src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')}, null, project)
                return
            }
            await craft(response.doc.querySelector('#Content > form > table > tbody > tr:nth-child(2) > td > table').getElementsByTagName('img'))

            code = 0
            code2 = 0

            for (let i = 0; i < 6; i++) {
                code += content[i] << (i * 5)
            }
            for (let i = 6; i < 9; i++) {
                code2 += content[i] << ((i - 6) * 5)
            }

            response = await _fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': 'userign=' + project.nick + '&action=vote&action2=placevote&captchacode1=' + code + '&captchacode2=' + code2,
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'minecraftiplist.com')) return

            if (response.doc.querySelector('#Content > div.Error') != null) {
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
                    endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                    return
                }
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server')) {
                    let numbers = response.doc.querySelector('#Content > div.Error').textContent.substring(response.doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
                    let count = 0
                    let hour = 0
                    let min = 0
                    let sec = 0
                    for (let i in numbers) {
                        if (count == 0) {
                            hour = numbers[i]
                        } else if (count == 1) {
                            min = numbers[i]
                        }
                        count++
                    }
                    let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                    endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
                    return
                }
                endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                return
            }
            if (response.doc.querySelector('#Content > div.Good') != null && response.doc.querySelector('#Content > div.Good').textContent.includes('You voted for this server!')) {
                endVote({successfully: true}, null, project)
                return
            }
        } else

        if (project.rating == 'MCServerList') {
            let response = await _fetch('https://api.mcserver-list.eu/vote/', {'headers': {'content-type': 'application/x-www-form-urlencoded'}, 'body': 'username=' + project.nick + '&id=' + project.id,'method': 'POST'}, project)
            let json = await response.json()
            if (response.ok) {
                if (json[0].success == "false") {
                    if (json[0].error == 'username_voted') {
                        endVote({later: true}, null, project)
                        return
                    } else {
                        endVote({message: json[0].error}, null, project)
                        return
                    }
                } else {
                    endVote({successfully: true}, null, project)
                    return
                }
            } else {
                endVote({message: chrome.i18n.getMessage('errorVote', String(response.status))}, null, project)
                return
            }
        } else

        if (project.rating == 'Custom') {
            let response = await _fetch(project.responseURL, {...project.body}, project)
            await response.text()
            if (response.ok) {
                endVote({successfully: true}, null, project)
                return
            } else {
                endVote({message: chrome.i18n.getMessage('errorVote', String(response.status))}, null, project)
                return
            }
        }
    } catch (e) {
        if (e == 'TypeError: Failed to fetch') {
//          endVote({notConnectInternet: true}, null, project)
        } else {
            endVote({message: chrome.i18n.getMessage('errorVoteUnknown') + (e.stack ? e.stack : e)}, null, project)
        }
    }
}

async function checkResponseError(project, response, url, bypassCodes, vk) {
    let host = extractHostname(response.url)
    if (vk && host.includes('vk.com')) {
        if (response.headers.get('Content-Type').includes('windows-1251')) {
            //Почему не UTF-8?
            response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
        } else {
            console.warn(getProjectPrefix(project, true), 'Что-то не так с кодирвкой', response.headers.get('Content-Type'))
        }
    }
    response.html = await response.text()
    response.doc = new DOMParser().parseFromString(response.html, 'text/html')
    if (vk && host.includes('vk.com')) {
        //Узнаём причину почему мы зависли на авторизации ВК
        let text
        if (response.doc.querySelector('div.oauth_form_access') != null) {
            text = response.doc.querySelector('div.oauth_form_access').textContent.replace(response.doc.querySelector('div.oauth_access_items').textContent, '').trim()
        } else if (response.doc.querySelector('div.oauth_content > div') != null) {
            text = response.doc.querySelector('div.oauth_content > div').textContent
        } else if (response.doc.querySelector('#login_blocked_wrap') != null) {
            text = response.doc.querySelector('#login_blocked_wrap div.header').textContent + ' ' + response.doc.querySelector('#login_blocked_wrap div.content').textContent.trim()
        } else if (response.doc.querySelector('div.login_blocked_panel') != null) {
            text = response.doc.querySelector('div.login_blocked_panel').textContent.trim()
        } else {
            text = 'null'
        }
        endVote({errorAuthVK: text}, null, project)
        return false
    } else {
        
    }
    if (!host.includes(url)) {
        endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
        return false
    }
    if (bypassCodes) {
        for (const code of bypassCodes) {
            if (response.status == code) {
                return true
            }
        }
    }
    if (!response.ok) {
        endVote({message: chrome.i18n.getMessage('errorVote', String(response.status))}, null, project)
        return false
    }
    return true
}

//Слушатель на обновление вкладок, если вкладка полностью загрузилась, загружает туда скрипт который сам нажимает кнопку проголосовать
chrome.webNavigation.onCompleted.addListener(async function(details) {
    let project = openedProjects.get(details.tabId)
    if (project == null) return
    if (details.frameId == 0) {
        await new Promise(resolve => {
            chrome.tabs.executeScript(details.tabId, {file: 'scripts/' + project.rating.toLowerCase() +'.js'}, function() {
                if (chrome.runtime.lastError) {
                    console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                    if (chrome.runtime.lastError.message != 'The tab was closed.') {
                        if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                        project.error = chrome.runtime.lastError.message
                        changeProject(project)
                    }
                }
                resolve()
            })
        })
        await new Promise(resolve => {
            chrome.tabs.executeScript(details.tabId, {file: 'scripts/api.js'}, function() {
                resolve()
            })
        })
        chrome.tabs.sendMessage(details.tabId, {sendProject: true, project})
    } else if (details.frameId != 0 && (details.url.match(/hcaptcha.com\/captcha\/*/) || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/anchor*/) || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/bframe*/) || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/anchor*/) || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/bframe*/))) {
        chrome.tabs.executeScript(details.tabId, {file: 'scripts/captchaclicker.js', frameId: details.frameId}, function() {
            if (chrome.runtime.lastError) {
                console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                if (chrome.runtime.lastError.message != 'The frame was removed.') {
                    if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                    project.error = chrome.runtime.lastError.message
                    changeProject(project)
                }
            }
        })
    }
}, {urls: ['<all_urls>']})

chrome.webRequest.onCompleted.addListener(function(details) {
    let project = openedProjects.get(details.tabId)
    if (project == null) return
    if (details.type == 'main_frame' && (details.statusCode < 200 || details.statusCode > 299)) {
        const sender = {tab: {id: details.tabId}}
        endVote({errorVote: String(details.statusCode)}, sender, project)
    }
}, {urls: ['<all_urls>']})

chrome.webRequest.onErrorOccurred.addListener(function(details) {
    if (details.initiator == 'chrome-extension://' + chrome.runtime.id) {
        if (fetchProjects.has(details.requestId)) {
            let project = fetchProjects.get(details.requestId)
//          if (details.error.includes('net::ERR_ABORTED') || details.error.includes('net::ERR_CONNECTION_RESET') || details.error.includes('net::ERR_CONNECTION_CLOSED') || details.error.includes('net::ERR_NETWORK_CHANGED')) {
//              console.warn(getProjectPrefix(project, true) + details.error)
//              return
//          }
            endVote({errorVoteNetwork: [details.error, details.url]}, null, project)
        }
    } else if (details.type == 'main_frame') {
        if (openedProjects.has(details.tabId)) {
            let project = openedProjects.get(details.tabId)
            if (details.error.includes('net::ERR_ABORTED') || details.error.includes('net::ERR_CONNECTION_RESET') || details.error.includes('net::ERR_CONNECTION_CLOSED') || details.error.includes('net::ERR_NETWORK_CHANGED')) {
                console.warn(getProjectPrefix(project, true) + details.error)
                return
            }
            const sender = {tab: {id: details.tabId}}
            endVote({errorVoteNetwork: [details.error, details.url]}, sender, project)
        }
    }
}, {urls: ['<all_urls>']})

async function _fetch(url, options, project) {
    let listener
    const removeListener = ()=>{
        if (listener) {
            chrome.webRequest.onBeforeRequest.removeListener(listener)
            listener = null
        }
    }

    listener = (details)=>{
        //Да это костыль, а есть другой адекватный вариант достать requestId или хотя бы код ошибки net:ERR из fetch запроса?
        if (details.initiator == 'chrome-extension://' + chrome.runtime.id && details.url.includes(url)) {
            fetchProjects.set(details.requestId, project)
            removeListener()
        }
    }
    chrome.webRequest.onBeforeRequest.addListener(listener, {urls: ['<all_urls>']})

    if (!options) options = {}
    //Поддержка для браузера Uran (Chrome версии 59+)
    options.credentials = 'include'

    try {
        const response = await fetch(url, options)
        return response
    } catch(e) {
        throw e
    } finally {
        removeListener()
    }
}

//Слушатель сообщений и ошибок
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    //Если требует ручное прохождение капчи
    if ((request.captcha || request.authSteam || request.discordLogIn) && sender && openedProjects.has(sender.tab.id)) {
        let project = openedProjects.get(sender.tab.id)
        let message = request.captcha ? chrome.i18n.getMessage('requiresCaptcha') : chrome.i18n.getMessage(Object.keys(request)[0])
        console.warn(getProjectPrefix(project, true) + message)
        if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(project, false), message)
        project.error = message
        delete project.nextAttempt
        openedProjects.delete(sender.tab.id)
        openedProjects.set(sender.tab.id, request.project)
        await updateProject(project)
    } else if (request.changeProject) {
        openedProjects.delete(sender.tab.id)
        openedProjects.set(sender.tab.id, request.project)
        await updateProject(request.project)
    } else {
        endVote(request, sender, null)
    }
})

//Завершает голосование, если есть ошибка то обрабатывает её
async function endVote(request, sender, project) {
    if (sender && openedProjects.has(sender.tab.id)) {
        //Если сообщение доставлено из вкладки и если вкладка была открыта расширением
        project = openedProjects.get(sender.tab.id)
        if (closeTabs) {
            chrome.tabs.remove(sender.tab.id, function() {
                if (chrome.runtime.lastError) {
                    console.warn(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                    if (!settings.disabledNotifError && chrome.runtime.lastError.message != 'No tab with id.')
                        sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                }
            })
        }
        openedProjects.delete(sender.tab.id)
    } else if (!project) return

    for (let[key,value] of fetchProjects.entries()) {
        if (value.nick == project.nick && value.id == project.id && project.rating == value.rating) {
            fetchProjects.delete(key)
        }
    }

    if (settings.cooldown < 10000) {
        setTimeout(()=>{
            for (let value of queueProjects) {
                if (value.nick == project.nick && value.id == project.id && project.rating == value.rating) {
                    queueProjects.delete(value)
                }
            }
        }, 10000)
    } else {
        for (let value of queueProjects) {
            if (value.nick == project.nick && value.id == project.id && project.rating == value.rating) {
                queueProjects.delete(value)
            }
        }
    }
    delete project.nextAttempt

    //Если усё успешно
    let sendMessage = ''
    if (request.successfully || request.later) {
        let time = new Date()
        if (!project.rating == 'Custom' && (project.timeout || project.timeoutHour) && !(project.lastDayMonth && new Date(time.getYear(),time.getMonth() + 1,0).getDate() != new Date().getDate())) {
            if (project.timeoutHour) {
                if (!project.timeoutMinute) project.timeoutMinute = 0
                if (!project.timeoutSecond) project.timeoutSecond = 0
                if (time.getHours() > project.timeoutHour || (time.getHours() == project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
                    time.setDate(time.getDate() + 1)
                }
                time.setHours(project.timeoutHour, project.timeoutMinute, project.timeoutSecond, 0)
            } else {
                time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
            }
        } else if (request.later && Number.isInteger(request.later)) {
            time = new Date(request.later)
            if (project.rating == 'ServeurPrive' || project.rating == 'TopGames') {
                project.countVote = project.countVote + 1
                if (project.countVote >= project.maxCountVote) {
                    time = new Date()
                    time.setDate(time.getDate() + 1)
                    time.setHours(0, (project.priority ? 0 : 10), 0, 0)
                }
            }
        } else {
            //Рейтинги с таймаутом сбрасывающемся раз в день в определённый час
            let hour
            if (project.rating == 'TopCraft' || project.rating == 'McTOP' || project.rating == 'MinecraftRating' || project.rating == 'MonitoringMinecraft' || project.rating == 'IonMc' || project.rating == 'QTop') {
                //Топы на которых время сбрасывается в 00:00 по МСК
                hour = 21
            } else if (project.rating == 'MCRate') {
                hour = 22
            } else if (project.rating == 'MinecraftServerList' || project.rating == 'ServerList101') {
                hour = 23
            } else if (project.rating == 'PlanetMinecraft' || project.rating == 'ListForge' || project.rating == 'MinecraftList') {
                hour = 5
            } else if (project.rating == 'MinecraftServersOrg' || project.rating == 'MinecraftIndex' || project.rating == 'MinecraftBuzz' || project.rating == 'PixelmonServers') {
                hour = 0
            } else if (project.rating == 'TopMinecraftServers') {
                hour = 4
            } else if (project.rating == 'MMoTopRU') {
                hour = 20
            } else if (project.rating == 'BotsForDiscord') {
                hour = 12
            }
            if (hour != null) {
                if (time.getUTCHours() > hour || (time.getUTCHours() == hour && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
                    time.setUTCDate(time.getUTCDate() + 1)
                }
                time.setUTCHours(hour, (project.priority ? 0 : 10), 0, 0)
            //Рейтинги с таймаутом сбрасывающемся через определённый промежуток времени с момента последнего голосования
            } else if (project.rating == 'TopG' || project.rating == 'MinecraftServersBiz' || project.rating == 'TopGG' || project.rating == 'DiscordBotList' || project.rating == 'MCListsOrg') {
                time.setUTCHours(time.getUTCHours() + 12)
            } else if (project.rating == 'MinecraftIpList' || project.rating == 'HotMC' || project.rating == 'MinecraftServerNet' || project.rating == 'TMonitoring' || project.rating == 'MCServers' || project.rating == 'CraftList' || project.rating == 'CzechCraft' || project.rating == 'TopMCServersCom' || project.rating == 'CraftListNet') {
                time.setUTCDate(time.getUTCDate() + 1)
            } else if (project.rating == 'ServeurPrive' || project.rating == 'TopGames') {
                project.countVote = project.countVote + 1
                if (project.countVote >= project.maxCountVote) {
                    time.setDate(time.getDate() + 1)
                    time.setHours(0, (project.priority ? 0 : 10), 0, 0)
                    project.countVote = 0
                } else {
                    if (project.rating == 'ServeurPrive') {
                        time.setUTCHours(time.getUTCHours() + 1, time.getUTCMinutes() + 30)
                    } else {
                        time.setUTCHours(time.getUTCHours() + 2)
                    }
                }
            } else if (project.rating == 'ServerPact') {
                time.setUTCHours(time.getUTCHours() + 11)
                time.setUTCMinutes(time.getUTCMinutes() + 7)
            } else if (project.rating == 'Custom') {
                if (project.timeoutHour != null) {
                    if (!project.timeoutMinute) project.timeoutMinute = 0
                    if (!project.timeoutSecond) project.timeoutSecond = 0
                    if (time.getHours() > project.timeoutHour || (time.getHours() == project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
                        time.setDate(time.getDate() + 1)
                    }
                    time.setHours(project.timeoutHour, project.timeoutMinute, project.timeoutSecond, 0)
                } else {
                    time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
                }
            } else if (project.rating == 'MCServerList') {
                time.setUTCHours(time.getUTCHours() + 2)
            } else if (project.rating == 'CraftList') {
                time = new Date(request.successfully)
            } else {
                time.setUTCDate(time.getUTCDate() + 1)
            }
        }

        time = time.getTime()
        project.time = time

        if (project.randomize) {
            project.time = project.time + Math.floor(Math.random() * 43200000)
        }

        delete project.error

        if (request.successfully) {
            sendMessage = chrome.i18n.getMessage('successAutoVote')
            if (!settings.disabledNotifInfo) sendNotification(getProjectPrefix(project, false), sendMessage)

            project.stats.successVotes++
            project.stats.monthSuccessVotes++
            project.stats.lastSuccessVote = Date.now()

            generalStats.successVotes++
            generalStats.monthSuccessVotes++
            generalStats.lastSuccessVote = Date.now()
        } else {
            sendMessage = chrome.i18n.getMessage('alreadyVoted')
//          if (typeof request.later == 'string') sendMessage = sendMessage + ' ' + request.later
            if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(project, false), sendMessage)

            project.stats.laterVotes++

            generalStats.laterVotes++
        }
        console.log(getProjectPrefix(project, true) + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
        //Если ошибка
    } else {
        let message
        if (!request.message) {
            if (Object.values(request)[0] == true) {
                message = chrome.i18n.getMessage(Object.keys(request)[0])
            } else {
                message = chrome.i18n.getMessage(Object.keys(request)[0], Object.values(request)[0])
            }
        } else {
            message = request.message
        }
        if (message.length == 0) message = chrome.i18n.getMessage('emptyError')
        let retryCoolDown
        if (project.rating == 'TopCraft' || project.rating == 'McTOP' || project.rating == 'MCRate' || project.rating == 'MinecraftRating' || project.rating == 'MonitoringMinecraft' || project.rating == 'ServerPact' || project.rating == 'MinecraftIpList') {
            retryCoolDown = 300000
            sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', '5')
        } else {
            retryCoolDown = 900000
            sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', '15')
        }
        if (project.randomize) {
            retryCoolDown = retryCoolDown + Math.floor(Math.random() * 900000)
        }
        project.time = Date.now() + retryCoolDown
        project.error = message
        console.error(getProjectPrefix(project, true) + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
        if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), sendMessage)

        project.stats.errorVotes++

        generalStats.errorVotes++
    }
    
    await updateGeneralStats()
    await updateProject(project)
}

//Отправитель уведомлений
function sendNotification(title, message) {
    let notification = {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: title,
        message: message
    }
    chrome.notifications.create('', notification, function() {})
}

function getProjectPrefix(project, detailed) {
    if (detailed) {
        return '[' + project.rating + '] ' + (project.nick != null && project.nick != '' ? project.rating == 'Custom' ? project.nick : project.nick + ' – ' : '') + (project.game != null ? project.game + ' – ' : '') + (project.rating == 'Custom' ? '' : project.id) + (project.name != null ? ' – ' + project.name : '') + ' '
    } else {
        return '[' + project.rating + '] ' + (project.nick != null && project.nick != '' ? project.nick : project.game != null ? project.game : project.name) + (project.rating == 'Custom' ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id)
    }
}

//Проверяет правильное ли у вас время
async function checkTime() {
    try {
        let response = await fetch('https://api.cifrazia.com/')
        if (response.ok && !response.redirected) {
            // если HTTP-статус в диапазоне 200-299 и не было переадресаций
            // получаем тело ответа и сравниваем время
            let json = await response.json()
            let serverTimeUTC = Number(json.timestamp.toString().replace('.', '').substring(0, 13))
            let timeUTC = Date.now()
            let timeDifference = (timeUTC - serverTimeUTC)
            if (Math.abs(timeDifference) > 300000) {
                let text
                let time
                let unit
                if (timeDifference > 0) {
                    text = chrome.i18n.getMessage('clockHurry')
                } else {
                    text = chrome.i18n.getMessage('clockLagging')
                }
                if (timeDifference > 3600000 || timeDifference < -3600000) {
                    time = (Math.abs(timeDifference) / 1000 / 60 / 60).toFixed(1)
                    unit = chrome.i18n.getMessage('clockHourns')
                } else {
                    time = (Math.abs(timeDifference) / 1000 / 60).toFixed(1)
                    unit = chrome.i18n.getMessage('clockMinutes')
                }
                let text2 = chrome.i18n.getMessage('clockInaccurate', [text, time, unit])
                console.warn(text2)
                if (!settings.disabledNotifWarn)
                    sendNotification(chrome.i18n.getMessage('clockInaccurateLog', text), text2)
            }
        } else {
            console.error(chrome.i18n.getMessage('errorClock2', String(response.status)))
        }
    } catch (e) {
        console.error(chrome.i18n.getMessage('errorClock', e))
        return
    }
}

async function setCookie(url, name, value) {
    return new Promise(resolve=>{
        chrome.cookies.set({'url': url, 'name': name, 'value': value}, function(details) {
            resolve(details)
        })
    })
}

async function setCookieDetails(details) {
    return new Promise(resolve=>{
        chrome.cookies.set(details, function(det) {
            resolve(det)
        })
    })
}

async function getCookie(url, name) {
    return new Promise(resolve=>{
        chrome.cookies.get({'url': url, 'name': name}, function(cookie) {
            resolve(cookie)
        })
    })
}

async function removeCookie(url, name) {
    return new Promise(resolve=>{
        chrome.cookies.remove({'url': url, 'name': name}, function(details) {
            resolve(details)
        })
    })
}

async function wait(ms) {
    return new Promise(resolve=>{
        setTimeout(()=>{
            resolve()
        }, ms)
    })
}

async function updateGeneralStats() {
    await new Promise(resolve => {
        const request = db.transaction('other', 'readwrite').objectStore('other').put(generalStats, 'generalStats')
        request.onsuccess = resolve
    })
}

async function updateProject(project) {
    const projectID = await new Promise((resolve, reject) => {
        const index = db.transaction('projects').objectStore('projects').index('rating, id, nick')
        const request = index.getKey([project.rating, project.id, project.nick])
        request.onsuccess = event => resolve(event.target.result)
        request.onerror = reject
    })
    if (projectID != null) {
        await new Promise((resolve, reject) => {
            const request = db.transaction('projects', 'readwrite').objectStore('projects').put(project, projectID)
            request.onsuccess = resolve
            request.onerror = reject
        })
        chrome.runtime.sendMessage({updateProject: true, project, projectID})
        return true
    } else {
        console.warn('This project could not be found, it may have been deleted', JSON.stringify(project))
        return false
    }
}

function extractHostname(url) {
    let hostname
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf('//') > -1) {
        hostname = url.split('/')[2]
    } else {
        hostname = url.split('/')[0]
    }

    //find & remove port number
    hostname = hostname.split(':')[0]
    //find & remove '?'
    hostname = hostname.split('?')[0]

    return hostname
}

chrome.runtime.onInstalled.addListener(async function(details) {
    if (details.reason == 'install') {
        window.open('options.html?installed')
    }
})

function Version(s){
  this.arr = s.split('.').map(Number);
}
Version.prototype.compareTo = function(v){
  for (let i=0; ;i++) {
    if (i>=v.arr.length) return i>=this.arr.length ? 0 : 1;
    if (i>=this.arr.length) return -1;
    var diff = this.arr[i]-v.arr[i]
    if (diff) return diff>0 ? 1 : -1;
  }
}

const varToString = varObj=>Object.keys(varObj)[0]


/* Store the original log functions. */
console._log = console.log
console._info = console.info
console._warn = console.warn
console._error = console.error
console._debug = console.debug

/* Declare our console history variable. */
// console.history = []
if (!localStorage.consoleHistory)
    localStorage.consoleHistory = ''

/* Redirect all calls to the collector. */
console.log = function () { return console._intercept('log', arguments) }
console.info = function () { return console._intercept('info', arguments) }
console.warn = function () { return console._intercept('warn', arguments) }
console.error = function () { return console._intercept('error', arguments) }
console.debug = function () { return console._intercept('debug', arguments) }

/* Give the developer the ability to intercept the message before letting
   console-history access it. */
console._intercept = function (type, args) {
    // Your own code can go here, but the preferred method is to override this
    // function in your own script, and add the line below to the end or
    // begin of your own 'console._intercept' function.
    // REMEMBER: Use only underscore console commands inside _intercept!
    console._collect(type, args)
}

let logsdb
const logsopenRequest = indexedDB.open('logs', 1)
logsopenRequest.onupgradeneeded = function() {
    // срабатывает, если на клиенте нет базы данных
    // ...выполнить инициализацию...
    logsopenRequest.result.createObjectStore('logs', {autoIncrement: true})
    //Удаляем старые логи из localStorage
    if (localStorage.consoleHistory) localStorage.removeItem('consoleHistory')
}
logsopenRequest.onerror = function() {
    console._error(chrome.i18n.getMessage('errordb', ['logs', logsopenRequest.error]))
}
logsopenRequest.onsuccess = function() {
    logsdb = logsopenRequest.result
    logsdb.onerror = function(event) {
        const request = event.target // запрос, в котором произошла ошибка
        console._error(chrome.i18n.getMessage('errordb', ['logs', request.error]), )
    }

    console._collect = function (type, args) {
        let time = new Date().toLocaleString().replace(',', '')
        
        if (!type) type = 'log'
        
        if (!args || args.length === 0) return
        
        console['_' + type].apply(console, args)
    
        const logs = logsdb.transaction('logs', 'readwrite').objectStore('logs')
        
        let log = '[' + time + ' ' + type.toUpperCase() + ']:'
    
        for (let i in args) {
            let arg = args[i]
            if (typeof arg != 'string')
                arg = JSON.stringify(arg)
            log += ' ' + arg
        }
    
        const request = logs.add(log)
    }
    
    console.log(chrome.i18n.getMessage('start'))
}

/*
Открытый репозиторий:
https://gitlab.com/Serega007/auto-vote-minecraft-rating
*/
