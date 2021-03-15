const http = require("http");
const fs = require('fs');

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    switch (req.url) {
        case "/countries":
            fs.readFile('./cronjobs/countries.json', function read(err, data) {
                if (err) {
                    throw err;
                }
                const content = data;
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(content);
            });
            break
        case "/currencies":
            fs.readFile('./cronjobs/currencies.json', function read(err, data) {
                if (err) {
                    throw err;
                }
                const content = data;
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(content);
            });
            break
        }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});