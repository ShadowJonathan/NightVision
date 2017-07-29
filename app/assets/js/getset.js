const fs = require('fs');
const tokenfilepath = "./storage/t.djs";

function token(newtoken = null) {
    if (!newtoken) {
        if (!fs.existsSync(tokenfilepath))
            return null;
        else
            return fs.readFileSync(tokenfilepath, 'utf8')
    } else {
        createFile(tokenfilepath);
        fs.writeFileSync(tokenfilepath, newtoken, 'utf8');
    }
}

function createFile(path) {
    try {
        fs.mkdirSync(path.split(/[\/\\]/g).slice(0, -1).join('/'));
        fs.closeSync(fs.openSync(path, "w"))
    } catch (err) {

    }
}

module.exports = {token};