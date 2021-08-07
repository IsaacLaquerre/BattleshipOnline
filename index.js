const express = require("express");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const utils = require("./utils.js");

var app = express();
var liveReloadServer = livereload.createServer();

liveReloadServer.watch(__dirname + "/public");

liveReloadServer.server.once("connection", () => {
    console.log("LiveServer connected");
});

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(connectLivereload());
app.set("views", __dirname + "/public/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

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
                " ",
                " ",
            ],
            [
                " ",
                " ",
                " ",
            ],
            [
                " ",
                " ",
                " ",
            ]
        ];
        this.x = undefined;
        this.o = undefined;
        this.currentPlayer = "x";

        this.reset = function() {
            this.board = [
                [
                    " ",
                    " ",
                    " ",
                ],
                [
                    " ",
                    " ",
                    " ",
                ],
                [
                    " ",
                    " ",
                    " ",
                ]
            ];
            this.currentPlayer = "x";

            return;
        }
    }
}

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public/views" });
    return;
});

app.get("/game/new", (req, res) => {

    if (req.query && req.query.gameID != undefined) {
        res.redirect("/game/" + req.query.gameID);
    }else if (req.query && req.query.presetID != undefined) {
        utils.getGame(req.query.presetID, games).game.reset();
        temp = utils.getGame(req.query.presetID, games).game.o;
        utils.getGame(req.query.presetID, games).game.o = utils.getGame(req.query.presetID, games).game.x;
        utils.getGame(req.query.presetID, games).game.x = utils.getGame(req.query.presetID, games).game.o;
        
        liveReloadServer.refresh("/");

        return res.redirect("/game/" + req.query.presetID);
    }else {
        var gameID = utils.generateToken(6);
        while (utils.checkGameExists(gameID, games)) {
            gameID = utils.generateToken(6);
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

        if (req.query && req.query.getCurrentPlayer != undefined) {
            return res.send({ currentPlayer: utils.getGame(req.params.id, games).game.currentPlayer });
        }

        if (utils.checkGameExists(req.params.id, games)) {
            if (utils.getGame(req.params.id, games).game.x === undefined) res.cookie("player", "x", { httpOnly: false });
            else if (utils.getGame(req.params.id, games).game.o === undefined && utils.getGame(req.params.id, games).game.x != undefined) res.cookie("player", "o", { httpOnly: false });
            return res.sendFile("index.html", { root: "public/views/game" });
        } else return res.sendFile("404.html", { root: "public/views" });
    } else {
        return res.sendFile("404.html", { root: "public/views" });
    }
});

app.post("/game/:id", (req, res) => {
    if (req.params && req.params != "") {
        if (req.query && req.query.setPlayers != undefined) {
            //if (req.body.x === utils.getGame(req.params.id, games).game.x || req.body.o === utils.getGame(req.params.id, games).game.o || req.body.x === utils.getGame(req.params.id, games).game.o || req.body.o === utils.getGame(req.params.id, games).game.x) return;
            if (req.body.x) utils.getGame(req.params.id, games).game.x = req.body.x;
            if (req.body.o) utils.getGame(req.params.id, games).game.o = req.body.o;
        }
        if (req.query && req.query.move != undefined) {
            if (req.body.ip != utils.getGame(req.params.id, games).game[utils.getGame(req.params.id, games).game.currentPlayer]) return;
            if (utils.getGame(req.params.id, games).game.board[req.body.x][req.body.y] != "X" && utils.getGame(req.params.id, games).game.board[req.body.x][req.body.y] != "O") {
                if (utils.getGame(req.params.id, games).game.currentPlayer === "x" && req.body.player === "x") {
                    utils.getGame(req.params.id, games).game.currentPlayer = "o";
                    utils.getGame(req.params.id, games).game.board[req.body.x][req.body.y] = "X";
                }else if (utils.getGame(req.params.id, games).game.currentPlayer === "o" && req.body.player === "o") {
                    utils.getGame(req.params.id, games).game.currentPlayer = "x";
                    utils.getGame(req.params.id, games).game.board[req.body.x][req.body.y] = "O";
                }
                liveReloadServer.refresh("/");
                return res.send({ board: utils.getGame(req.params.id, games).game.board });
            }
        }
    }
});

app.get("*", (req, res) => {
    res.sendFile("404.html", { root: "public/views" });
    return;
});