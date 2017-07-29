const jQuery = require('jquery');
const utils = require('./utils');
const resolve = require('./resolve');
const events = require("events");
let IER = new events.EventEmitter();
IER.setMaxListeners(100);

/**
 * jQuery object
 * @external jQuery
 * @see {@link http://api.jquery.com/jQuery/}
 */
/**
 *
 * @param s
 * @param {jQuery} div
 */
function servers(s, div) {
    for (let g of s.array().sort((a, b) => a.position - b.position)) {
        /**
         * @type {jQuery} S
         */
        let S = jQuery(`<li class='listServer id-${g.id}'>`);
        S.html(`${g.icon ?
            `<img class="listIcon" src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=256">`
            :
            `<a class="listIcon">${utils.make_Ini(g.name)}</a>`}${g.name}
<div class="amount">
    <div class="roles_amount">${g.roles.size}<div class="icon icon-roles"></div></div>
    <div class="channels_amount">${g.channels.size}<div class="icon icon-channels"></div></div>
    <div class="people_amount">${g.memberCount}<div class="icon icon-people"></div></div>
</div>`);
        div.append(S)
    }
}

/**
 * @param role
 * @return {string}
 */
function quickPerms(role) {
    let quickP = resolve.roleQuickPermissions(role.permissions !== undefined ? role.permissions : role);
    if (quickP.length === 0)
        return "";
    /**
     * @type {jQuery}
     */
    let qp = jQuery('<span class="quick-icons">');
    for (let p of quickP) {
        /**
         * @type {jQuery}
         */
        let i = jQuery('<div class="quick-icon">');
        let type = p.split(" ")[0];
        i.toggleClass("light", p.split(" ").length > 1 ? p.split(" ")[1] === "l" : false);
        switch (type) {
            case "A":
                i.addClass("ADMIN");
                break;
            case "M_C":
                i.addClass("MANAGE_CHANNELS");
                break;
            case "M_G":
                i.addClass("MANAGE_GUILD");
                break;
            case "M_M":
                i.addClass("MANAGE_MESSAGES");
                break;
            case "M_R":
                i.addClass("MANAGE_ROLES");
                break;
            case "B_M":
                i.addClass("BAN_MEMBERS");
                break;
            case "K_M":
                i.addClass("KICK_MEMBERS");
                break;
        }
        qp.append(i)
    }
    return qp[0].outerHTML
}

/**
 * @param R
 * @param {jQuery} ul
 */
function roles(R, ul) {
    ul.html("");
    for (let r of R.array().sort((a, b) => b.position - a.position)) {
        /**
         * @type {jQuery}
         */
        let lR = jQuery(`<li class="listRole id-${r.id}">`);
        let sbw = false;
        if (r.color) {
            lR.css("background-color", r.hexColor);
            sbw = utils.idealTextColor(r.hexColor) === "#ffffff"
        }
        let ILS = `<style>
.id-${r.id}.listRole:hover {
    background-color: ${r.color ? utils.LightenDarkenColor(r.hexColor, -50) : "#ddd"} !important;
    color: ${r.color ? utils.idealTextColor(utils.LightenDarkenColor(r.hexColor, -50)) : "black"} !important;
}
</style>`;
        lR.html(`<span class="name" ${sbw ? "style=\"color:#ffffff;\"" : ""}>${r.name}</span>${ILS}${quickPerms(r)}</span>`);

        IER.once("GGM", () => {
                let amount = r.members.size;
                lR.prepend(amount ? "<span class='RoleAmount'>" + amount + '</span>' : "")
            }
        );

        ul.append(lR)
    }
}
/**
 * @param {Discord.Collection<String, Discord.Channel>} chs
 * @param {jQuery} ul
 */
function channels(chs, ul) {
    ul.html("");
    for (let c of chs.array().filter(c => c.type === "text").sort((a, b) => a.position - b.position)) {
        /**
         * @type {jQuery}
         */
        let lC = jQuery(`<li class="listChannel id-${c.id}">`);
        let canread = false;
        try {
            let p = c.permissionsFor(c.guild.me);
            canread = p.has("READ_MESSAGES")
        } catch (__) {

        }
        lC.toggleClass("cantread", !canread);
        lC.html(`<span class="name">#${c.name}</span>`);

        ul.append(lC)
    }
}

/**
 * @param {Discord.Collection<String, Discord.GuildMember>} mms
 * @param {jQuery} ul
 * @param {?Boolean} simple
 */
function members(mms, ul, simple = false) {
    let fm = mms.array()[0];
    ul.html('<div class="spinnerCubes"><div class="cube1"></div><div class="cube2"></div></div>');
    let g;
    if (fm)
        g = mms.array()[0].guild;
    else {
        console.warn("Empty member list, unable to generate members or get guild");
        ul.html("");
        return;
    }

    let mems = mms;

    function make(mms, ul) {
        IER.emit("GGM");
        ul.html("");

        /**
         * @type {Map<String, Array>}
         */
        let hr2mems = new Map();

        if (!simple) {

            for (let m of mms.array()) {
                let hr = m.hoistRole;
                if (!hr)
                    addto(m, g.id);
                else
                    addto(m, hr.id)
            }

            for (let hr of hr2mems.keys()) {
                let r = g.roles.get(hr);
                if (!r)
                    throw new Error("ERR NO ROLE FOUND WHERE EXPECTED");
                let a = hr2mems.get(hr);
                a.role = r;
                a.pos = r.position;
            }

            let A = hr2mems
                .array()
                .sort((a, b) => b.pos - a.pos);

            for (let group of A) {
                addDivider(group.role.name, group.role.id, group.role.color, group.role.hexColor);
                for (let m of group.sort((a, b) => utils.sortAlphabetical(a.displayName, b.displayName)))
                    addmem(m)
            }

            console.log(A);
        } else {
            for (let m of mms.array().sort((a, b) => utils.sortAlphabetical(a.displayName, b.displayName))) {
                addmem(m)
            }
        }


        function addto(m, id) {
            if (!hr2mems.get(id))
                hr2mems.set(id, []);
            hr2mems.get(id).push(m)
        }

        /**
         * @param {String} name
         * @param {String} id
         * @param {Number} color
         * @param {String} hexColor
         */
        function addDivider(name, id, color, hexColor) {
            /**
             * @type {jQuery}
             */
            let lMD = jQuery(`<li class="listMemberDivider id-${id}">`);
            let sbw = false;

            if (color) {
                lMD.css("background-color", hexColor);
                sbw = utils.idealTextColor(hexColor) === "#ffffff"
            }
            let ILS = `<style>
.id-${id}.listMemberDivider:hover {
    background-color: ${color ? utils.LightenDarkenColor(hexColor, -50) : "#ddd"} !important;
    color: ${color ? utils.idealTextColor(utils.LightenDarkenColor(hexColor, -50)) : "black"} !important;
}
</style>`;

            lMD.html(`<span class="name" ${sbw ? "style=\"color:#ffffff;\"" : ""}>${name}</span>${ILS}`);

            ul.append(lMD)
        }

        function addmem(m) {
            /**
             * @type {jQuery}
             */
            let lM = jQuery(`<li class="listMember id-${m.id}">`);
            let sbw = false;

            if (m.displayColor) {
                lM.css("background-color", m.displayHexColor);
                sbw = utils.idealTextColor(m.displayHexColor) === "#ffffff"
            }
            let ILS = `<style>
.id-${m.id}.listMember:hover {
    background-color: ${m.displayColor ? utils.LightenDarkenColor(m.displayHexColor, -50) : "#ddd"} !important;
    color: ${m.displayColor ? utils.idealTextColor(utils.LightenDarkenColor(m.displayHexColor, -50)) : "black"} !important;
}
</style>`;
            lM.html(`<span class="name" ${sbw ? "style=\"color:#ffffff;\"" : ""}>${m.displayName}</span>${ILS}${quickPerms(m.permissions.bitfield)}<div class="memberStatus status-${m.presence.status}"></div>`);

            ul.append(lM)
        }
    }

    if (mms.size !== g.memberCount) {
        return new Promise((res) => {
            g.fetchMembers().then(() => {
                    make(mems, ul);
                    res()
                }
            )
        })
    } else if (g.memberCount > 400) {
        return new Promise((res) => {
            setTimeout(() => {
                make(mems, ul);
                res();
            }, 1000)
        })
    } else {
        make(mems, ul)
    }
}

module.exports = {servers, roles, channels, members, quickPerms};