let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let dns = require("dns");
let shortened = {0: "https://freecodecamp.org"};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/api/timestamp/:dateString?", (req, res) => {
  let dateString = req.params.dateString;
  let date = dateString ? new Date(dateString) : new Date();
  let unix = date.getTime();
  let utc = date.toUTCString();
  if (unix) res.json({
    unix: unix,
    utc: utc
  })
  else res.json({error: utc});
})

app.get("/api/header", (req, res) => {
  let ip = req.get('x-forwarded-for') || req.connection.remoteAddress;
  let lang = req.get("accept-language");
  let sys = req.get("user-agent");
  res.json({
    ipaddress: ip,
    language: lang,
    software: sys
  });
})

app.post("/api/shorturl/new", (req, res) => {
  let longUrl = req.body.longUrl;
  let key = Math.max(...Object.keys(shortened)) + 1;
  shortened[key] = longUrl;
  let resobj = {
    original_url: longUrl,
    short_url: key
  }
  dns.lookup(longUrl, (err, address) => {
    if (err) resobj = {error: "invalid URL"};
  })
  res.json(resobj);
})

app.get("/api/shorturl/:short", (req, res) => {
  let key = Number(req.params.short);
  if (key) {
    if (shortened[key]) res.redirect(shortened[key])
    else res.json({error: "No short url found for given input"});
  } else {
    res.json({error: "shorturl must be a number"});
  }
})

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening...");
})
