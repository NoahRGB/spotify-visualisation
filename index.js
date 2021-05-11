const express = require("express");
const encode = require("nodejs-base64-encode");
const request = require("request");
const path = require("path");
const app = express();
const fetch = require("node-fetch");
const { response } = require("express");
app.use(express.static(path.join(__dirname, "./public")));

var session = require('express-session');
app.use(session({secret: 'mySecret', resave: false, saveUninitialized: false}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  var trackNames = [];
  var trackImages = [];
  if (req.session.tracks) {
    for (var track of req.session.tracks) {
      trackNames.push(track.name);
      trackImages.push(track.image);
    }
  }
  res.render("index", {
    trackNames,
    trackImages
  });
});

app.get("/login", async (req, res) => {
  res.redirect("https://accounts.spotify.com/authorize?client_id=5bf6acdb9212466d951e92726177b259&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-top-read");
});

app.get("/callback", (req, res) => {

  request.post({
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: req.query.code,
      redirect_uri: "http://localhost:3000/callback",
      grant_type: "authorization_code",
      client_id: "5bf6acdb9212466d951e92726177b259",
      client_secret: "eb34eb889d10430184575c9f23e7bfb5"
    },
    json: true
  }, function(error, response, body) {

    var userData = {
      tracks: []
    }
    const access_token = body.access_token;
    request.get({
      headers: {
        "Authorization": "Bearer "+access_token
      },
      url: "https://api.spotify.com/v1/me/top/tracks?limit=10",
      json: true
    }, function(error2, response2, body2) {
      for (var i = 0; i < body2.items.length; i++) {
        userData.tracks.push({
          name: body2.items[i].name,
          image: body2.items[i].album.images[0].url
        });
      }
      // console.log(userData);
      req.session.tracks = userData.tracks;
      res.redirect("/");
    });
  });
});

app.listen(3000, () => {
  console.log("Example app listening at http://localhost:3000")
});

// Retrieving basic account info
// #############################################################
// request.get({
//   url: "https://api.spotify.com/v1/me",
//   headers: {
//     "Authorization": "Bearer "+access_token
//   }
// }, function(error2, response2, body2) {
//   console.log(response2);
//   console.log(access_token)
// });

// Retrieving top artists
// #############################################################
// request.get({
//   headers: {
//     "Authorization": "Bearer "+access_token
//   },
//   url: "https://api.spotify.com/v1/me/top/artists?limit=4"
// }, function(error2, response2, body2) {
//   console.log(body2);
//   console.log(access_token)
// });

// Pausing the current song
// #############################################################
// request.put({
//   headers: {
//     "Authorization": "Bearer "+access_token
//   },
//   url: "https://api.spotify.com/v1/me/player/pause"
// }, function(error2, response2, body2) {
//   console.log(body2);
//   console.log(access_token)
// });