# Wakapi-Discord
[Wakapi](https://github.com/muety/wakapi) integration in the [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp) client. Enables you to track the time you spend answering support tickets.

Time spent in support tickets will be logged under the language _"Tickets"_.

## Installation

- Copy plugin the plugins folder of BetterDiscord.
- Open up the js file and change the URL to match your server address and port and add your API Key to the end of the `getRequestURL()` string.
- Customize the plugin based on your needs (if needed)
- Open Discord and view any of the opened tickets.

## Development

- Clone the repository
```console
git clone
```

- Initialize your dev environment
```console
npm run dev:init
``` 

- Do all your changes inside of ./plugins/Wakapi

- To build the plugin, run 
```console
npm run dev:build
```