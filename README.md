# Installation of backend

```
npm install
npm install -g nodemon
```
Create a config.json file into /config which configures the mongodb database to use and port to listen connections.
The content must be the following (replace the values as needed):
```
{
    "mongoConnectionString": "mongodb://<username>:<password>@<domain>:<port>/<database-name>",
    "port": 3000
}
```

Run backend with `nodemon app.js`

# Installation of frontend

```
npm install
npm install -g bower
bower install
npm install -g grunt-cli
```
Run frontend with the command `grunt serve` and the browser should start up showing the correct page.
