# Auto Vote Rating - Chrome Extension - MultiVote version
This version allows you to vote for multiple nicknames from a single device using a proxy/vpn

List of sites that the extension supports: [TopCraft.ru](http://topcraft.ru/), [McTOP.su](https://mctop.su/), [MCRate.su](http://mcrate.su/), [MinecraftRating.ru](http://minecraftrating.ru/), [MonitoringMinecraft.ru](http://monitoringminecraft.ru/), [IonMc.top](https://ionmc.top/), [MinecraftServers.org](https://minecraftservers.org/), [Serveur-Prive.net](https://serveur-prive.net/minecraft), [PlanetMinecraft.com](https://www.planetminecraft.com/), [TopG.org](https://topg.org/Minecraft), [Minecraft-Mp.com](https://minecraft-mp.com/), [Minecraft-Server-List.com](http://minecraft-server-list.com/), [ServerPact.com](https://www.serverpact.com/), [MinecraftIpList.com](https://www.minecraftiplist.com/), [TopMinecraftServers.org](https://topminecraftservers.org/), [MinecraftServers.biz](http://minecraftservers.biz/), [HotMC.ru](https://hotmc.ru/), [Minecraft-Server.net](https://minecraft-server.net/), [Top-Games.net или Top-Serveurs.net](https://top-games.net/), [TMonitoring.com](https://tmonitoring.com/), [Top.GG](https://top.gg/), [DiscordBotList.com](https://discordbotlist.com/), [BotsForDiscord.com](https://botsfordiscord.com/), [MMoTop.RU](https://mmotop.ru/), [MC-Servers.com](https://mc-servers.com/), [MinecraftList.org](https://minecraftlist.org/), [Minecraft-Index.com](https://www.minecraft-index.com/), [ServerList101.com](https://serverlist101.com/), [MCServerList](https://mcserver-list.eu/), [CraftList](https://craftlist.org/), [CzechCraft](https://czech-craft.eu/) [PixelmonServers](https://pixelmonservers.com/), [QTop](http://q-top.ru/), [MinecraftBuzz](https://minecraft.buzz/) 
## Install the extension from zip archive
Here is a short guide how to install an unpacked extension on Google Chrome or Chromium-based browsers
1. Unzip the archive to any convenient location
2. Open the "Extensions" page `chrome://extensions/` in the browser and turn on the "Developer mode"
![](http://ipic.su/img/img7/fs/68747470733a2f2f692e696d6775722e636f6d2f786463686451612e706e67.1618619824.png)
3. Click on the "Load unpacked" button and select the directory where you unpacked the archive.

Используйте программу git что бы удобнее обновляться если будут выходить обновления данной ветки
  
## Инструкция по использования MultiVote:
Для начала зайдите в настройки расширения   
Убедитесь что слева снизу кнопка Вкл/Выкл у вас красная (голосование приостановлено), не рекомендую настраивать расширение при включённой Вкл/Выкл
Перейдите во вкладку MultiVote

### Аккаунты ВК:
Если вы собираетесь накручивать голоса на TopCraft, McTOP, MCRate, MinecraftRating, MonitoringMinecraft или QTop:   
Во вкладке ВКонтакте добавляйте аккаунты ВК и следуюте инструкциям расширения   
Если просит авторизоваться на рейтинге на котором вы собираетесь авто голосовать то разрешаете авторизацию   

### Прокси:
Если вы собираетесь накручивать голоса на TopCraft, McTOP или MinecraftRating - вам прокси не нужны, на остальных рейтингах он нужен
Во вкладке прокси импортируете любой из VPN'ов
Если хотите использовать свои прокси то импортуете по следующему шаблону: ip:port:scheme или ip:port:scheme:login:password (scheme это тип прокси https, socks и т.д.

### На каком проекте голосовать и с каким ником:
Во вкладке "Добавить" добавляете нужные вам проекты/ники где вы хотите накручивать голоса, напомню: убедитесь что у вас авто голосование приостановлено (слева снизу Вкл/Выкл должен быть красным)

### Всё!
Всё, можете включать слева снизу "Вкл/Выкл" и следить за процессом голосования   
Результат голосования вы можете смотреть во вкладке "Добавленные"   
Рекомендую следить за процессом голосования через консоль, консоль можно открыть следующим образом:   
Зайдите на `chrome://inspect/#extensions` (вбейте это в адресную строку браузера)   
Найдите там это расширение и нажмите синую Inspect под ним   
В открывшемся окне перейдите во вкладку "Console"   
Всё, следите за работой расширения

Если у вас возникнут какие-либо вопросы или проблемы: обращайтесь ко мне (Serega007) в Discord, мои контакты указаны в настройках расширения во вкладке "О расширении"

## Некоторые объяснения как работает расширение с MultiVote:   
Авторизация аккаунтов ВК происходит по куки, тоесть расширение тупо устанавливает куки нужного акка ВК и вы уже авторизованы в нужном аккаунте ВК   
При успешном добавлении аккаунта ВК расширение запоминает текущие куки авторизированного ВК, обращаю ваше внимание что эти куки хранятся в не зашифрованном виде и могут быть сворованы сторонней программой, не используйте аккаунты ВК с личной информацией   
Во время голосования расширение определяет оптимальный вариант с какого ВК/прокси делать голос, если есть возможность сделать несколько голосов с одного ВК/прокси то он это делает и одновременно, при успешном голосовании расширение запоминает в использованном вк/прокси какой голос он сделал (на каком рейтинге проголосовал и за какой проект/сервер) и не будет делать повторного голосования с этого вк/прокси до следующего сброса голоса. Если вы удалите этот использованный вк/прокси то это сохранение тоже удалиться и его больше не возможно будет восстановить (кроме случаем импорта/экспорта настроек)   
Опция "Игнорировать ошибку 'Вы уже голосовали' не меньше 15 раз" нужна в случае если вы используете общедоступные прокси и уже кто-то с этого прокси голосовал на данном рейтинге и проекте.   
Если вы используете общедоступные прокси то лучше всего MultiVote использовать в режиме эмуляции иначе в тихом режиме будет выдавать ошибку 403 из-за защиты ддос.
