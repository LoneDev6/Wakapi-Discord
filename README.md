# Wakapi-Discord
<img src="https://shields.io/endpoint?url=https://wakapi.stlf.me/api/compat/shields/v1/meerbiene/interval:any/project:Wakapi-Discord&color=blue&label=Coding%20Time">

[Wakapi](https://github.com/muety/wakapi) integration in the [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp) client. Enables you to track the time you spend answering support tickets.

Time spent in support tickets will be logged under the language _"Tickets"_.

## Installation

- Copy plugin the plugins folder of BetterDiscord.
- Customize the plugin based on your needs (if needed)
- Open Discord and view any of the opened tickets.

## Configuration

### Wakapi Settings

![](https://i.imgur.com/gJ7EGC7.png)

Fill in you Wakapi API Key and Url in these fields. If you supply no API Key, the plugin won't start.

The sample rate is the amount of seconds that pass between each heartbeat that is sent to Wakapi.
### Discord Settings
![](https://i.imgur.com/zOGqUe9.png)

1. Place the ID of the channels category you want to track (the tickets category for example). You can add multiple categories separated by a comma.
2. (OPTIONAL) If you want to map the time spent in a tracked category to a project, put the id in this text area followed by `=>` and the projectname. You can add multiple categories separated by a comma.


## Development

- Clone the repository
    ```console
    git clone https://github.com/LoneDev6/Wakapi-Discord.git
    ```

- Initialize your dev environment
    ```console
    npm run dev:init
    ``` 

- Make all of your changes inside of ./plugins/Wakapi

- To build the plugin, run 
    ```console
    npm run dev:build
    ```

### Branches
- `main` => Code thats running in production. Don't touch!
- `develop` => Dev branch. Use this to make pull requests against.
