const apiEndpoint = window.location.href.split("/")[0] + "//" + window.location.href.split("/")[2];

function getPlayers() {
    fetch("https://api.ipify.org/?format=json").then(body => body.json().then(res => {
        console.log("got ip");
        var ip = res.ip;
        fetch(apiEndpoint + "/game/" + window.location.href.split("/").pop() + "?getPlayers").then(body => body.json().then(res => {
            console.log("got players");
            console.log(res.data.x, res.data.o);
            if (res.data.x === undefined) {
                fetch(apiEndpoint + "/game/" + window.location.href.split("/").pop() + "?setPlayers", {
                    method: "POST",
                    body: JSON.stringify({ x: ip }),
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
                console.log(res.data.x, "set player x");
            }
            if (res.data.o === undefined && res.data.x != undefined) {
                fetch(apiEndpoint + "/game/" + window.location.href.split("/").pop() + "?setPlayers", {
                    method: "POST",
                    body: JSON.stringify({ o: ip }),
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
                console.log(res.data.o, "set player o");
            } // else window.history.back();
        }));
    }));
}

function drawBoard() {
    fetch(apiEndpoint + "/game/" + window.location.href.split("/").pop() + "?getBoard").then(body => body.json().then(res => {
        for (x in res.data.game.board) {
            var row = document.createElement("DIV");
            row.classList.add("row");
            for (y in res.data.game.board[x]) {
                var cell = document.createElement("DIV");
                cell.classList.add("cell");
                if (res.data.game.board[x][y] == "O") cell.innerHTML = "O";
                else if (res.data.game.board[x][y] == "X") cell.innerHTML = "X";
                else cell.innerHTML = "⠀";
                row.appendChild(cell);
            }
            document.getElementById("board").appendChild(row);
        }
    }));
}

function mark(cell) {
    if (cell.innerHTML != "X" && cell.innerHTML != "O") cell.innerHTML = player;
}