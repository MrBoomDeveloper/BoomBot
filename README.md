# BoomBot - A handy telegram bot
![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/MrBoomDeveloper/BoomBot)
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/w/MrBoomDeveloper/BoomBot)
![GitHub repo size](https://img.shields.io/github/repo-size/MrBoomDeveloper/BoomBot)

I'we built this bot because other alternatives didn't had has functionality that i wanted so i combined it all here!

## Features

- Subscribe to RSS feeds
	- Filter by tags
	- Customize a look of messages
	- Select a time when to send new posts
	- Use in any channel, chat or in direct messages
- Find a new job
	- Subscribe to new offers on supported services
	- Filter by jobs, that you want
	- Blacklist offers by words that you don't want to see
- Receive daily weather
- Play a mafia game
	- Custom roles

## Deployment
Before deploying you'll need to fill a `.env` file at the root of project with such fields:

```js
IS_DEBUG="IS DEPLOYED LOCALLY"

TELEGRAM_BOT_USERNAME="TELEGRAM BOT USERNAME"
TELEGRAM_BOT_TOKEN="TELEGRAM BOT TOKEN"

TIDB_HOST="DATABASE HOST"
TIDB_PORT="DATABASE PORT"
TIDB_USER="DATABASE USER"
TIDB_PASSWORD="DATABASE PASSWORD"
TIDB_DATABASE="DATABASE NAME"

// Optional values
ADMIN_PANEL_PASSWORD="A PASSWORD TO ACCESS: HOST/admin"
OWNER="YOUR TELEGRAM USER ID"
HOST="URL OF DEPLOYMENT"
```

Before first start run the following command:

```bash
npm install
```

Now you can just run the following command:

```bash
npm run main
```

## Contribution
Everyone can fork this project and change things that they want!