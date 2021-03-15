//Realistically this doesn't need to be run often, how often are new currencies made?  I don't think very often... but this could be run once a week just too check if the API supports any new currencies.

var unirest = require("unirest");
const fs = require('fs');

var req = unirest("GET", "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/reference/v1.0/currencies");

req.headers({
	"x-rapidapi-key": "be51b3ee29msh2de7863ad80bbd4p1db551jsn5644a02a9de1",
	"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
	"useQueryString": true
});


req.end(function (res) {
	if (res.error) throw new Error(res.error);
	fs.writeFile('currencies.json', JSON.stringify(res.body), (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
	console.log(res.body);
});