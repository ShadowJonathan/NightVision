const utils = require('./utils');
const Discord = require('discord.js');

/**
 *
 * @param {Number} permission
 * @return {String[]}
 */
function roleQuickPermissions(permission) {
    let P = new Discord.Permissions(permission);
    let perms = P.serialize(false);
    let res = [];
    let admin = perms.ADMINISTRATOR;
    admin ? res.push("A") : null;
    perms.MANAGE_CHANNELS ? res.push("M_C") : admin ? res.push("M_C l") : null;
    perms.MANAGE_GUILD ? res.push("M_G") : admin ? res.push("M_G l") : null;
    perms.MANAGE_MESSAGES ? res.push("M_M") : admin ? res.push("M_M l") : null;
    perms.MANAGE_ROLES ? res.push("M_R") : admin ? res.push("M_R l") : null;
    perms.BAN_MEMBERS ? res.push("B_M") : admin ? res.push("B_M l"): null;
    perms.KICK_MEMBERS ? res.push("K_M") : admin ? res.push("K_M l") : null;
    return res
}

module.exports = {roleQuickPermissions};