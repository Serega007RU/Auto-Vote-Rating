//Список рейтингов
// noinspection JSUnusedGlobalSymbols
const allProjects = {
    TopCraft: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/' + project.id + '/'
            case 'pageURL':
                return 'https://topcraft.ru/servers/' + project.id + '/'
            case 'jsPath':
                return 'table.project-info-table a'
            case 'exampleURL':
                return ['https://topcraft.ru/servers/', '10496', '/']
            case 'URL':
                return 'TopCraft.ru'
        }
    },
    McTOP: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://mctop.su/accounts/vk/login/?process=login&next=/servers/' + project.id + '/'
            case 'pageURL':
                return 'https://mctop.su/servers/' + project.id + '/'
            case 'jsPath':
                return 'table.project-info-table a'
            case 'exampleURL':
                return ['https://mctop.su/servers/', '5231', '/']
            case 'URL':
                return 'McTOP.su'
        }
    },
    MCRate: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=' + project.id + '&response_type=code'
            case 'pageURL':
                return 'http://mcrate.su/project/' + project.id
            case 'jsPath':
                return '#button-circle > a'
            case 'exampleURL':
                return ['http://mcrate.su/rate/', '4396', '']
            case 'URL':
                return 'MCRate.su'
            case 'oneProject':
                return 1
        }
    },
    MinecraftRating: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=https://minecraftrating.ru/projects/' + project.id + '/&state=' + project.nick + '&response_type=code&v=5.45'
            case 'pageURL':
                return 'https://minecraftrating.ru/projects/' + project.id + '/'
            case 'jsPath':
                return 'table[class="table server-table"] > tbody > tr:nth-child(2) > td:nth-child(2) > a'
            case 'exampleURL':
                return ['https://minecraftrating.ru/projects/', 'cubixworld', '/']
            case 'URL':
                return 'MinecraftRating.ru'
        }
    },
    MonitoringMinecraft: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://monitoringminecraft.ru/top/' + project.id + '/vote'
            case 'pageURL':
                return 'https://monitoringminecraft.ru/top/' + project.id + '/'
            case 'jsPath':
                return 'table.info a'
            case 'exampleURL':
                return ['https://monitoringminecraft.ru/top/', 'gg', '/vote']
            case 'URL':
                return 'MonitoringMinecraft.ru'
        }
    },
    IonMc: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://ionmc.top/projects/' + project.id + '/vote'
            case 'jsPath':
                return 'div > ul > li:nth-child(2) > a'
            case 'exampleURL':
                return ['https://ionmc.top/projects/', '80', '/vote']
            case 'URL':
                return 'IonMc.top'
        }
    },
    MinecraftServersOrg: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftservers.org/vote/' + project.id
            case 'pageURL':
                return 'https://minecraftservers.org/server/' + project.id
            case 'jsPath':
                return '#left h1'
            case 'exampleURL':
                return ['https://minecraftservers.org/vote/', '25531', '']
            case 'URL':
                return 'MinecraftServers.org'
            case 'oneProject':
                return 1
        }
    },
    ServeurPrive: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                if (project.lang === 'en') {
                    return 'https://serveur-prive.net/' + project.lang + '/' + project.game + '/' + project.id + '/vote'
                } else {
                    return 'https://serveur-prive.net/' + project.game + '/' + project.id + '/vote'
                }
            case 'jsPath':
                return '#t h2'
            case 'exampleURL':
                return ['https://serveur-prive.net/minecraft/', 'gommehd-net-4932', '/vote']
            case 'URL':
                return 'Serveur-Prive.net'
        }
    },
    PlanetMinecraft: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.planetminecraft.com/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://www.planetminecraft.com/server/' + project.id + '/'
            case 'jsPath':
                return '#resource-title-text'
            case 'exampleURL':
                return ['https://www.planetminecraft.com/server/', 'legends-evolved', '/vote/']
            case 'URL':
                return 'PlanetMinecraft.com'
        }
    },
    TopG: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://topg.org/' + project.game + '/server-' + project.id
            case 'pageURL':
                return 'https://topg.org/' + project.game + '/server-' + project.id
            case 'jsPath':
                return 'div.sheader'
            case 'exampleURL':
                return ['https://topg.org/minecraft-servers/server-', '405637', '']
            case 'URL':
                return 'TopG.org'
        }
    },
    ListForge: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://' + project.game + '/server/' + project.id + '/vote/' + (project.addition != null ? project.addition : '')
            case 'pageURL':
                return 'https://' + project.game + '/server/' + project.id + '/vote/'
            case 'jsPath':
                return 'head > title'
            case 'exampleURL':
                return ['https://minecraft-mp.com/server/', '81821', '/vote/']
            case 'URL':
                return 'ListForge.net'
        }
    },
    MinecraftServerList: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-server-list.com/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://minecraft-server-list.com/server/' + project.id + '/'
            case 'jsPath':
                return 'div.serverdatadiv a[rel="nofollow noopener noreferrer"]'
            case 'exampleURL':
                return ['https://minecraft-server-list.com/server/', '292028', '/vote/']
            case 'URL':
                return 'Minecraft-Server-List.com'
        }
    },
    ServerPact: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.serverpact.com/vote-' + project.id
            case 'pageURL':
                return 'https://www.serverpact.com/vote-' + project.id
            case 'jsPath':
                return 'div.panel table a'
            case 'exampleURL':
                return ['https://www.serverpact.com/vote-', '26492123', '']
            case 'URL':
                return 'ServerPact.com'
            case 'oneProject':
                return 1
        }
    },
    MinecraftIpList: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id
            case 'pageURL':
                return 'https://minecraftiplist.com/server/-' + project.id
            case 'jsPath':
                return '#addr > span:nth-child(3)'
            case 'exampleURL':
                return ['https://minecraftiplist.com/index.php?action=vote&listingID=', '2576', '']
            case 'URL':
                return 'MinecraftIpList.com'
            case 'oneProject':
                return 5
        }
    },
    TopMinecraftServers: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://topminecraftservers.org/vote/' + project.id
            case 'pageURL':
                return 'https://topminecraftservers.org/server/' + project.id
            case 'jsPath':
                return 'h1[property="name"]'
            case 'exampleURL':
                return ['https://topminecraftservers.org/vote/', '9126', '']
            case 'URL':
                return 'TopMinecraftServers.org'
        }
    },
    MinecraftServersBiz: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://minecraftservers.biz/' + project.id + '/'
            case 'jsPath':
                return 'div.panel table tr:nth-child(4)'
            case 'exampleURL':
                return ['https://minecraftservers.biz/', 'servers/145999', '/']
            case 'URL':
                return 'MinecraftServers.biz'
        }
    },
    HotMC: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://hotmc.ru/vote-' + project.id
            case 'pageURL':
                return 'https://hotmc.ru/minecraft-server-' + project.id
            case 'jsPath':
                return 'div[class="text-server"] > h1'
            case 'exampleURL':
                return ['https://hotmc.ru/vote-', '199493', '']
            case 'URL':
                return 'HotMC.ru'
            case 'oneProject':
                return 1
        }
    },
    MinecraftServerNet: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-server.net/vote/' + project.id + '/'
            case 'pageURL':
                return 'https://minecraft-server.net/details/' + project.id + '/'
            case 'jsPath':
                return 'div.card-header > h1'
            case 'exampleURL':
                return ['https://minecraft-server.net/vote/', 'TitanicFreak', '/']
            case 'URL':
                return 'Minecraft-Server.net'
        }
    },
    TopGames: (type, project) => {
        switch (type) {
            case 'voteURL':
                if (project.lang === 'fr') {
                    return 'https://top-serveurs.net/' + project.game + '/vote/' + project.id
                } else if (project.lang === 'en') {
                    return 'https://top-games.net/' + project.game + '/vote/' + project.id
                } else {
                    return 'https://' + project.lang + '.top-games.net/' + project.game + '/vote/' + project.id
                }
            case 'pageURL':
                if (project.lang === 'fr') {
                    return 'https://top-serveurs.net/' + project.game + '/' + project.id
                } else if (project.lang === 'en') {
                    return 'https://top-games.net/' + project.game + '/' + project.id
                } else {
                    return 'https://' + project.lang + '.top-games.net/' + project.game + '/' + project.id
                }
            case 'jsPath':
                return 'div.top-description h1'
            case 'exampleURL':
                return ['https://top-serveurs.net/minecraft/', 'icesword-pvpfaction-depuis-2014-crack-on', '']
            case 'URL':
                return 'Top-Games.net'
        }
    },
    TMonitoring: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://tmonitoring.com/server/' + project.id + '/'
            case 'jsPath':
                return 'div[class="info clearfix"] > div.pull-left > h1'
            case 'exampleURL':
                return ['https://tmonitoring.com/server/', 'qoobworldru', '']
            case 'URL':
                return 'TMonitoring.com'
        }
    },
    TopGG: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://top.gg/' + project.game + '/' + project.id + '/vote' + project.addition
            case 'pageURL':
                return 'https://top.gg/' + project.game + '/' + project.id + '/vote'
            case 'jsPath':
                return '#entity-title'
            case 'exampleURL':
                return ['https://top.gg/bot/', '270904126974590976', '/vote']
            case 'URL':
                return 'Top.gg'
        }
    },
    DiscordBotList: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://discordbotlist.com/bots/' + project.id + '/upvote'
            case 'pageURL':
                return 'https://discordbotlist.com/bots/' + project.id
            case 'jsPath':
                return 'h1[class="bot-name"]'
            case 'exampleURL':
                return ['https://discordbotlist.com/bots/', 'dank-memer', '/upvote']
            case 'URL':
                return 'DiscordBotList.com'
        }
    },
    Discords: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://discords.com/' + project.game + '/' + project.id + (project.game === 'servers' ? '/upvote' : '/vote')
            case 'pageURL':
                return 'https://discords.com/' + project.game + '/' + project.id + (project.game === 'servers' ? '/upvote' : '/vote')
            case 'jsPath':
                return project.game === 'servers' ? '.card-body h1' : '#votecontainer .subtitle b'
            case 'exampleURL':
                return ['https://discords.com/bots/bot/', '469610550159212554', '/vote']
            case 'URL':
                return 'Discords.com'
        }
    },
    MMoTopRU: (type, project) => {
        switch (type) {
            case 'voteURL':
                if (project.lang === 'ru') {
                    return 'https://' + project.game + '.mmotop.ru/servers/' + project.id + '/votes/new'
                } else {
                    return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id + '/votes/new'
                }
            case 'pageURL':
                if (project.lang === 'ru') {
                    return 'https://' + project.game + '.mmotop.ru/servers/' + project.id
                } else {
                    return 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id
                }
            case 'jsPath':
                return '#site-link'
            case 'exampleURL':
                return ['https://pw.mmotop.ru/servers/', '25895', '/votes/new']
            case 'URL':
                return 'MMoTop.ru'
            case 'oneProject':
                return 1
        }
    },
    MCServers: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://mc-servers.com/mcvote/' + project.id + '/'
            case 'pageURL':
                return 'https://mc-servers.com/details/' + project.id + '/'
            case 'jsPath':
                return 'a[href="/details/' + project.id + '"]'
            case 'exampleURL':
                return ['https://mc-servers.com/mcvote/', '1890', '/']
            case 'URL':
                return 'MC-Servers.com'
        }
    },
    MinecraftList: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftlist.org/vote/' + project.id
            case 'pageURL':
                return 'https://minecraftlist.org/server/' + project.id
            case 'jsPath':
                return '#main-content h1'
            case 'exampleURL':
                return ['https://minecraftlist.org/vote/', '11227', '']
            case 'URL':
                return 'MinecraftList.org'
        }
    },
    MinecraftIndex: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.minecraft-index.com/' + project.id + '/vote'
            case 'pageURL':
                return 'https://www.minecraft-index.com/' + project.id
            case 'jsPath':
                return 'h3.stitle'
            case 'exampleURL':
                return ['https://www.minecraft-index.com/', '33621-extremecraft-net', '/vote']
            case 'URL':
                return 'Minecraft-Index.com'
        }
    },
    ServerList101: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://serverlist101.com/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://serverlist101.com/server/' + project.id + '/'
            case 'jsPath':
                return 'li > h1'
            case 'exampleURL':
                return ['https://serverlist101.com/server/', '1547', '/vote/']
            case 'URL':
                return 'ServerList101.com'
        }
    },
    MCServerList: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://mcserver-list.eu/hlasovat?id=' + project.id
            case 'pageURL':
                return 'https://api.mcserver-list.eu/server/?id=' + project.id
            case 'jsPath':
                return ''
            case 'exampleURL':
                return ['https://mcserver-list.eu/hlasovat/?id=', '307', '']
            case 'URL':
                return 'MCServer-List.eu'
        }
    },
    CraftList: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://craftlist.org/' + project.id
            case 'jsPath':
                return 'main h1'
            case 'exampleURL':
                return ['https://craftlist.org/', 'basicland', '']
            case 'URL':
                return 'CraftList.org'
        }
    },
    CzechCraft: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://czech-craft.eu/server/' + project.id + '/vote/'
            case 'pageURL':
                return 'https://czech-craft.eu/server/' + project.id + '/'
            case 'jsPath':
                return 'a.server-name'
            case 'exampleURL':
                return ['https://czech-craft.eu/server/', 'trenend', '/vote/']
            case 'URL':
                return 'Czech-Craft.eu'
        }
    },
    PixelmonServers: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://pixelmonservers.com/server/' + project.id + '/vote'
            case 'jsPath':
                return '#title'
            case 'exampleURL':
                return ['https://pixelmonservers.com/server/', '8IO9idMv', '/vote']
            case 'URL':
                return 'PixelmonServers.com'
        }
    },
    QTop: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'http://q-top.ru/vote' + project.id
            case 'jsPath':
                return 'a[href="profile' + project.id + '"]'
            case 'exampleURL':
                return ['http://q-top.ru/vote', '1549', '']
            case 'URL':
                return 'Q-Top.ru'
        }
    },
    MinecraftBuzz: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft.buzz/server/' + project.id + '&tab=vote'
            case 'pageURL':
                return 'https://minecraft.buzz/server/' + project.id
            case 'jsPath':
                return '[href="server/' + project.id + '"]'
            case 'exampleURL':
                return ['https://minecraft.buzz/server/', '306', '&tab=vote']
            case 'URL':
                return 'Minecraft.Buzz'
        }
    },
    MinecraftServery: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://minecraftservery.eu/server/' + project.id
            case 'jsPath':
                return 'div.container div.box h1.title'
            case 'exampleURL':
                return ['https://minecraftservery.eu/server/', '105', '']
            case 'URL':
                return 'MinecraftServery.eu'
        }
    },
    RPGParadize: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.rpg-paradize.com/?page=vote&vote=' + project.id
            case 'jsPath':
                return 'div.div-box > h1'
            case 'exampleURL':
                return ['https://www.rpg-paradize.com/?page=vote&vote=', '113763', '']
            case 'URL':
                return 'RPG-Paradize.com'
        }
    },
    MinecraftServerListNet: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.minecraft-serverlist.net/vote/' + project.id
            case 'jsPath':
                return 'a.server-name'
            case 'exampleURL':
                return ['https://www.minecraft-serverlist.net/vote/', '51076', '']
            case 'URL':
                return 'Minecraft-ServerList.net'
        }
    },
    MinecraftServerEu: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-server.eu/vote/index/' + project.id
            case 'pageURL':
                return 'https://minecraft-server.eu/server/index/' + project.id
            case 'jsPath':
                return 'div.serverName'
            case 'exampleURL':
                return ['https://minecraft-server.eu/vote/index/', '1A73C', '']
            case 'URL':
                return 'Minecraft-Server.eu'
        }
    },
    MinecraftKrant: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.minecraftkrant.nl/serverlijst/' + project.id
            case 'jsPath':
                return 'div.inner-title'
            case 'exampleURL':
                return ['https://www.minecraftkrant.nl/serverlijst/', 'torchcraft', '']
            case 'URL':
                return 'MinecraftKrant.nl'
        }
    },
    TrackyServer: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.trackyserver.com/server/' + project.id
            case 'jsPath':
                return 'div.panel h1'
            case 'exampleURL':
                return ['https://www.trackyserver.com/server/', 'anubismc-486999', '']
            case 'URL':
                return 'TrackyServer.com'
        }
    },
    MCListsOrg: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://mc-lists.org/' + project.id + '/vote'
            case 'jsPath':
                return 'div.header > div.ui.container'
            case 'exampleURL':
                return ['https://mc-lists.org/', 'server-luxurycraft.1818', '/vote']
            case 'URL':
                return 'MC-Lists.org'
        }
    },
    TopMCServersCom: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://topmcservers.com/server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://topmcservers.com/server/' + project.id
            case 'jsPath':
                return '#serverPage > h1.header'
            case 'exampleURL':
                return ['https://topmcservers.com/server/', '17', '/vote']
            case 'URL':
                return 'TopMCServers.com'
        }
    },
    BestServersCom: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://bestservers.com/server/' + project.id + '/vote'
            case 'jsPath':
                return 'a[href="/server/' + project.id + '"]'
            case 'exampleURL':
                return ['https://bestservers.com/server/', '1135', '/vote']
            case 'URL':
                return 'BestServers.com'
        }
    },
    CraftListNet: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://craft-list.net/minecraft-server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://craft-list.net/minecraft-server/' + project.id
            case 'jsPath':
                return 'div.serverpage-navigation-headername.header'
            case 'exampleURL':
                return ['https://craft-list.net/minecraft-server/', 'Advancius-Network', '/vote']
            case 'URL':
                return 'Craft-List.net'
        }
    },
    MinecraftServersListOrg: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://www.minecraft-servers-list.org/index.php?a=in&u=' + project.id
            case 'pageURL':
                return 'https://www.minecraft-servers-list.org/details/' + project.id + '/'
            case 'jsPath':
                return 'div.card-header > h1'
            case 'exampleURL':
                return ['https://www.minecraft-servers-list.org/index.php?a=in&u=', 'chromity', '']
            case 'URL':
                return 'Minecraft-Servers-List.org'
        }
    },
    ServerListe: (type, project) => {
        switch (type) {
            case 'voteURL':
            case 'pageURL':
                return 'https://www.serverliste.net/vote/' + project.id
            case 'jsPath':
                return '#bar > h3'
            case 'exampleURL':
                return ['https://www.serverliste.net/vote/', '775', '']
            case 'URL':
                return 'ServerListe.net'
        }
    },
    gTop100: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1&pingUsername=' + project.nick
            case 'pageURL':
                return 'https://gtop100.com/topsites/' + project.game + '/sitedetails/' + project.id + '?vote=1'
            case 'jsPath':
                return '[itemprop="name"]'
            case 'exampleURL':
                return ['https://gtop100.com/topsites/MapleStory/sitedetails/', 'Ristonia--v224--98344', '?vote=1&pingUsername=kingcloudian']
            case 'URL':
                return 'gTop100.com'
        }
    },
    WARGM: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://wargm.ru/server/' + project.id + '/votes'
            case 'pageURL':
                return 'https://wargm.ru/server/' + project.id
            case 'jsPath':
                return '#header h1'
            case 'exampleURL':
                return ['https://wargm.ru/server/', '23394', '/votes']
            case 'URL':
                return 'WARGM.ru'
        }
    },
    MineStatus: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minestatus.net/server/vote/' + project.id
            case 'pageURL':
                return 'https://minestatus.net/server/' + project.id
            case 'jsPath':
                return 'h1.section-title'
            case 'exampleURL':
                return ['https://minestatus.net/server/vote/', 'mine.sylphmc.com', '']
            case 'URL':
                return 'MineStatus.net'
        }
    },
    MisterLauncher: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=https://misterlauncher.org/projects/' + project.id + '/&state=' + project.nick + '&response_type=code'
            case 'pageURL':
                return 'https://misterlauncher.org/projects/' + project.id + '/'
            case 'jsPath':
                return 'table[class="table server-table"] > tbody > tr:nth-child(2) > td:nth-child(2) > a'
            case 'exampleURL':
                return ['https://misterlauncher.org/projects/', 'omegamc', '/']
            case 'URL':
                return 'MisterLauncher.org'
        }
    },
    MinecraftServersDe: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraft-servers.de/server/' + project.id + '/vote'
            case 'pageURL':
                return 'https://minecraft-servers.de/server/' + project.id
            case 'jsPath':
                return 'div.container h1'
            case 'exampleURL':
                return ['https://minecraft-servers.de/server/', 'twerion', '/vote']
            case 'URL':
                return 'Minecraft-Servers.de'
        }
    },
    DiscordBoats: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://discord.boats/bot/' + project.id + '/vote'
            case 'pageURL':
                return 'https://discord.boats/bot/' + project.id
            case 'jsPath':
                return 'div.container h3 > span'
            case 'exampleURL':
                return ['https://discord.boats/bot/', '557628352828014614', '/vote']
            case 'URL':
                return 'Discord.Boats'
        }
    },
    ServerListGames: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://serverlist.games/vote/' + project.id
            case 'pageURL':
                return 'https://serverlist.games/server/' + project.id
            case 'jsPath':
                return 'div.card-title-server h5'
            case 'exampleURL':
                return ['https://serverlist.games/vote/', '2052', '']
            case 'URL':
                return 'ServerList.Games'
        }
    },
    BestMinecraftServers: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://serverlist.games/vote/' + project.id
            case 'pageURL':
                return 'https://best-minecraft-servers.co/' + project.id + '/vote'
            case 'jsPath':
                return 'table.info th'
            case 'exampleURL':
                return ['https://best-minecraft-servers.co/', 'server-hypixel-network.30', '/vote']
            case 'URL':
                return 'Best-Minecraft-Servers.co'
        }
    },
    MinecraftServers100: (type, project) => {
        switch (type) {
            case 'voteURL':
                return 'https://minecraftservers100.com/vote/' + project.id
            case 'pageURL':
                return 'https://minecraftservers100.com/vote/' + project.id
            case 'jsPath':
                return 'div.page-header'
            case 'exampleURL':
                return ['https://minecraftservers100.com/vote/', '2340', '']
            case 'URL':
                return 'MinecraftServers100.com'
        }
    },
    Custom: (type, project) => {
        switch (type) {
            case 'pageURL':
                return project.responseURL
            case 'exampleURL':
                return ['', '', '']
            case 'URL':
                return 'Custom'
        }
    }
}