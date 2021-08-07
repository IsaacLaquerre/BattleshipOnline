const apiEndpoint = window.location.href.split("/")[0] + "//" + window.location.href.split("/")[2];
const roomID = window.location.href.split("/").pop();

var currentGame = true;
var board = [];

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "null";
}

function getPlayers() {
    fetch("https://api.ipify.org/?format=json").then(body => body.json().then(res => {
        var ip = res.ip;
        fetch(apiEndpoint + "/game/" + roomID + "?getPlayers").then(body => body.json().then(res => {
            if (res.data.x === undefined) {
                fetch(apiEndpoint + "/game/" + roomID + "?setPlayers", {
                    method: "POST",
                    body: JSON.stringify({ x: ip }),
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }else if (res.data.o === undefined && res.data.x != undefined) {
                fetch(apiEndpoint + "/game/" + roomID + "?setPlayers", {
                    method: "POST",
                    body: JSON.stringify({ o: ip }),
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
        }));
    }));

    document.getElementById("player").innerHTML = "You play: " + getCookie("player").toUpperCase();
}

function drawBoard() {
    if (currentGame) {
        fetch(apiEndpoint + "/game/" + roomID + "?getBoard").then(body => body.json().then(res => {
            for (x in res.data.game.board) {
                var row = document.createElement("DIV");
                row.classList.add("row");
                for (y in res.data.game.board[x]) {
                    var cell = document.createElement("DIV");
                    cell.classList.add("cell");
                    cell.id = x + ";" + y;
                    cell.setAttribute("onclick", "mark(this);");
                    if (res.data.game.board[x][y] == "O") cell.innerHTML = "O";
                    else if (res.data.game.board[x][y] == "X") cell.innerHTML = "X";
                    else cell.innerHTML = "⠀";
                    row.appendChild(cell);
                }
                document.getElementById("board").appendChild(row);
            }
        })).then(() => {
            board = [];

            for (x in document.getElementById("board").children) {
                if (document.getElementById("board").children != undefined && document.getElementById("board").children[x] != undefined && !isNaN(x)) {
                    board[x] = [];
                    for (y in document.getElementById("board").children[x].children) {
                        if (document.getElementById("board").children[x].children != undefined && document.getElementById("board").children[x].children[y] != undefined && !isNaN(y)) {
                            if (document.getElementById("board").children[x].children[y].innerHTML != "X" && document.getElementById("board").children[x].children[y].innerHTML != "O") board[x][y] = "empty";
                            else board[x][y] = document.getElementById("board").children[x].children[y].innerHTML;
                        }
                    }
                }
            }
        }).then(() => {
            checkBoard();
        });
    }
}

function mark(cell) {
    if (currentGame) {
        fetch(apiEndpoint + "/game/" + roomID + "?getCurrentPlayer").then(body => body.json().then(res => {
            if (cell.innerHTML != "X" && cell.innerHTML != "O") {
                if (res.currentPlayer === getCookie("player")) {
                    console.log(cell.id.split(";")[0], cell.id.split(";")[1], getCookie("player"), res.currentPlayer);
                    fetch("https://api.ipify.org/?format=json").then(body => body.json().then(res => {
                        fetch(apiEndpoint + "/game/" + roomID + "?move", {
                            method: "POST",
                            body: JSON.stringify({ ip: res.ip, player: getCookie("player"), x: cell.id.split(";")[0], y: cell.id.split(";")[1] }),
                            headers: {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*"
                            }
                        }).then(() => {
                            gameBoard = document.getElementById("board");
                            while (gameBoard.firstChild) {
                                gameBoard.removeChild(gameBoard.lastChild);
                            }
                        }).then(() => drawBoard());
                    }));
                }
            }
        }));
    }
}

function checkBoard() {
    currentPlayer = getCookie("player");

    //Check horizontals
    for (x in board) {
        if (!board[x].join("").includes("empty")) {
            if (board[x][0] === board[x][1] && board[x][1] === board[x][2]) {
                gameOver(board[x][0].toUpperCase());
    
                return currentGame = false;
            }
        }
    }

    //Check verticals
    for (x in board) {
        for (y in board[x]) {
            if (board[0][y] != "empty" && board[1][y] != "empty" && board[2][y] != "empty") {
                if (board[0][y] === board[1][y] && board[1][y] === board[2][y]) {
                    gameOver(board[0][y].toUpperCase());
    
                    return currentGame = false;
                }
            }
        }
    }

    //Check diagonals
    if (board[0][0] != "empty" && board[1][1] != "empty" && board[2][2] != "empty" && board[0][2] != "empty" && board[1][1] != "empty" && board[2][0] != "empty") {
        if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            gameOver(board[0][0].toUpperCase());
    
            return currentGame = false;
        } else if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            gameOver(board[0][2].toUpperCase());
    
            return currentGame = false;
        }
    }

    //Check for ties
    var tied = true;
    for (x in board) {
        for (y in board[x]) {
            if (board[x][y] != "X" && board[x][y] != "O") tied = false;
        }
    }
    if (tied) {
        gameOver("tie");
        
        return currentGame = false;
    }
}

function gameOver(player) {
    anchor = document.getElementById("player");
    wonDiv = document.createElement("DIV");
    if (player != "tie") wonDiv.innerHTML = "\"" + player + "\" won the game!";
    else wonDiv.innerHTML = "Tie!";
    spacer = document.createElement("DIV");
    spacer.style.height = "20px";
    playAgainButton = document.createElement("DIV");
    playAgainButton.classList.add("center");
    playAgainButton.id = "playAgain";
    playAgainButton.innerHTML = "Play again";
    playAgainButton.setAttribute("onclick", "window.location.href = '" + apiEndpoint + "/game/new?presetID=" + roomID + "'");
    wonDiv.appendChild(spacer);
    wonDiv.appendChild(playAgainButton);
    anchor.parentNode.appendChild(wonDiv);
}