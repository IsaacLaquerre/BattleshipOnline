module.exports = {

    generateToken(length) {
        var result = "";
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    },

    checkGameExists(id, games) {
        for (i in games) {
            if (id == games[i].id) return true;
        }

        return false;
    },

    getGame(id, games) {
        if (this.checkGameExists(id, games)) {
            for (i in games) {
                if (id == games[i].id) return games[i];
            }

            return false;
        } else {
            return false;
        }
    }

};