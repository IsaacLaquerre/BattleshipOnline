const express = require("express");
const utils = require("./utils.js");

var app = express();

const PORT = 8080;

app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(
    PORT,
    () => console.log("App live and listening on port " + PORT)
);

var games = [];

class Game {
    constructor(gameID) {
        this.id = gameID;
        this.board = [
            [
                " ",
                "O",
                " ",
            ],
            [
                " ",
                " ",
                "X",
            ],
            [
                " ",
                " ",
                "O",
            ],
        ];
        this.x = undefined;
        this.o = undefined;
    }
}

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public/views" });
    return;
});

app.get("/game/new", (req, res) => {

    if (req.query && req.query.gameID != undefined) {
        res.redirect("/game/" + req.query.gameID);
    } else {
        var gameID = utils.generateToken(12);
        while (utils.checkGameExists(gameID, games)) {
            gameID = utils.generateToken(12);
        }
        var game = new Game(gameID);
        games.push({ id: gameID, game: game });

        return res.redirect("/game/new?gameID=" + gameID);
    }
});

app.get("/game/:id", (req, res) => {
    if (req.params && req.params != "") {
        if (req.query && req.query.getBoard != undefined) {
            return res.send({ data: utils.getGame(req.params.id, games) });
        }

        if (req.query && req.query.getPlayers != undefined) {
            console.log(utils.getGame(req.params.id, games));
            return res.send({ data: { x: utils.getGame(req.params.id, games).game.x, o: utils.getGame(req.params.id, games).game.o } });
        }

        if (utils.checkGameExists(req.params.id, games)) {
            if (utils.getGame(req.params.id, games).x == undefined) res.cookie("player", "x", { httpOnly: false });
            else if (utils.getGame(req.params.id, games).o == undefined) res.cookie("player", "o", { httpOnly: false });
            else return res.sendFile("fullGame.html", { root: "public/views/game" });
            return res.sendFile("index.html", { root: "public/views/game" });
        } else return res.sendFile("404.html", { root: "public/views" });
    } else {
        return res.sendFile("404.html", { root: "public/views" });
    }
});

app.post("/game/:id", (req, res) => {
    if (req.params && req.params != "") {
        if (req.query && req.query.setPlayers != undefined) {
            if (req.body.x) utils.getGame(req.params.id, games).game.x = req.body.x;
            if (req.body.o) utils.getGame(req.params.id, games).game.o = req.body.o;
            console.log(utils.getGame(req.params.id, games));
        }
    }
});

app.get("*", (req, res) => {
    res.sendFile("404.html", { root: "public/views" });
    return;
});