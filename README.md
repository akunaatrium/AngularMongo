# Prerequisites

First make sure you have nodejs installed correctly, preferably via nvm, have the latest version of npm and can install global packages without sudo.

# Installation of backend

Go to /backend and issue:
```
npm install
```
Create a default.json file into /config which configures the mongodb database to use and port to listen connections.
The content must be the following (replace the values as needed):
```
{
    "mongoConnectionString": "mongodb://<username>:<password>@<domain>:<port>/<database-name>",
    "port": 3000,
    "logLevel": "info"
}
```

Run backend with `npm start`. If you want autoreloading of files during development, execute `npm run dev` instead.

## Testing backend

Before tests can be run, test database should exist and a separate config file should be created with the mongoConnectionString pointing to the test database.
The name of the config file must be test.json.

Then execute the command `npm test` to run tests.

# Installation of frontend

```
npm install
npm install -g bower
bower install
npm install -g grunt-cli
```
Run frontend with the command `grunt serve` and the browser should start up showing the correct page.
