const utils = require("./utils");
const generate = require("./generate");
const Discord = require("discord.js");
const make = require("./make");
const getset = require("./getset");
/**
 * jQuery object
 * @external jQuery
 * @see {@link http://api.jquery.com/jQuery/}
 */

let at = {
    place: "mm"
};

function LOGIN(client) {
    jQuery("#login").removeClass("hidden");
    jQuery('.login_wrapper').removeClass("hidden");
    jQuery('#login .spinnerCubes').addClass("hidden")
    jQuery('.loginButton').click(function () {
        let proposedtoken = jQuery('.input.token').text();
        jQuery('.login_wrapper').addClass("hidden");
        jQuery('#login .spinnerCubes').removeClass("hidden");

        client.login(proposedtoken)
            .then(function () {
                console.log("Logged in");
                jQuery("#login").addClass("hidden");
                getset.token(proposedtoken);
                generate.servers(client.guilds, $("#servers").find("ul"))
            })
            .catch(function (reason) {
                console.log("reason:", reason);
                let lt = jQuery("#loginText");
                lt.addClass("error");
                lt.html("Couldn't log in with the proposed token, double-check your copy & pasting");
                LOGIN(client)
            });
    })

}

function main_menu() {
    at.place = "mm";
    jQuery("#servers").removeClass("hidden");
    jQuery("#server").addClass("hidden");
    jQuery("#roles").html("");
    jQuery("#channels").html("");
    jQuery("#members").html('<div class="spinnerCubes"><div class="cube1"></div><div class="cube2"></div></div>');
    jQuery('#roleMembers').html('<div class="spinnerCubes"><div class="cube1"></div><div class="cube2"></div></div>');
    jQuery("#role").addClass("hidden");
}

/**
 * @param {jQuery.Event} event
 * @param client
 * @param {?Discord.Guild} g
 */
function server_switch(event, client, g = null) {
    at.place = "server";
    let id;
    if (!g) {
        id = utils.getMatchUpwards(event.target, /id-\d+/i);
        if (!id)
            throw new Error("Cannot find ID", event);
        id = id[0].replace('id-', '');
        g = client.guilds.get(id);
    }
    console.log(id, g);
    jQuery("#servers").addClass("hidden");
    jQuery("#role").addClass("hidden");
    let s = jQuery("#server");
    s.removeClass("hidden");
    jQuery("#scroller_content").removeClass("hidden");
    if (g.iconURL)
        s.find("#serverIcon")[0].outerHTML = (`<img id="serverIcon" src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=256">`);
    else
        s.find("#serverIcon")[0].outerHTML = (`<a id="serverIcon">${utils.make_Ini(g.name)}</a>`);
    s.find(".name").html(g.name);

    generate.roles(g.roles, s.find("#roles"));
    generate.channels(g.channels, s.find("#channels"));
    g.generate = () => generate.members(g.members, s.find("#members"));

    return g
}

function role_switch(event, currentserver) {
    at.place = "role";
    let id = utils.getMatchUpwards(event.target, /id-\d+/i);
    if (!id)
        throw new Error("Cannot find ID", event);
    id = id[0].replace('id-', '');
    let r = currentserver.roles.get(id);
    console.log(id, r);
    jQuery("#scroller_content").addClass("hidden");
    let R = jQuery("#role");
    let d = R.find("div.title");
    R.removeClass("hidden");
    d.find(".name").html(r.name);

    if (r.color) {
        d.css("background-color", r.hexColor);
        d.css("color", utils.idealTextColor(r.hexColor))
    } else {
        d.css("background-color", "#ddd");
        d.css("color", "initial")
    }
    let aqi = d.find("span.quick-icons");
    aqi.length > 0 ? aqi[0].outerHTML = generate.quickPerms(r) : d.append(generate.quickPerms(r));

    let atEveryonePerms = new Discord
        .Permissions(
            currentserver
            .roles
            .get(currentserver.id)
            .permissions
        )
        .serialize(false);
    let PO = new Discord
        .Permissions(r.permissions)
        .serialize(false);
    let PT = "";
    for (let prop in PO) {
        if (atEveryonePerms[prop] !== PO[prop])
            PT += `<span class="property">${prop}</span> <span class="value">${PO[prop] ? "<i class='true'>true</i>" : PO.ADMINISTRATOR ? "<i class='quantum'>overruled</i>" : "<i class='false'>false</i>"}</span><br>`
        else
            PT += `<span class="property">${prop}</span> <span class="value">${PO[prop] ? "<i class='meh'>true</i>" : PO.ADMINISTRATOR ? "<i class='quantum'>overruled</i>" : "<i class='meh'>false</i>"}</span><br>`
    }

    R.find('.data').html(PT);

    generate.members(r.members, jQuery("#roleMembers"), true);
    R.find("#howmanyhaveroles").html(r.members.size ? r.members.size : "None");

    return r
}

let popupOpen = {
    state: false
};

function PO(event, id, currentServer, off = false) {
    function P(event, id, currentServer) {
        popupOpen.state = true;
        console.log("PO_open", event, id);
        let roles = [],
            username = '',
            nick = "",
            discriminator = '',
            userID = id,
            avatarID = '',
            rolecode = "",
            bot = false,
            note;

        let server = currentServer;

        let user = server.members.get(userID);
        if (!user) {
            throw new Error("CANT CREATE POPUP", event, info, node);
        } else {
            nick = user.nickname ? `<div class="nickname">${user.nickname}</div>` : "";
            bot = user.user.bot;
            username = user.user.username;
            discriminator = user.user.discriminator;
            avatarID = user.user.avatar;
            note = user.user.note
        }

        if (server)
            for (let r of user.roles) {
                r = r[1] ? r[1] : r;
                if (r.name != "@everyone")
                    roles.push({
                        name: r.name,
                        hex: r.color ? r.hexColor : null,
                        pos: r.position,
                    })
            }

        if (roles) {
            roles.sort((a, b) => b.pos - a.pos)
        }

        for (let r of roles) {
            rolecode += make.profile_role(r.name, r.hex)
        }

        let x = event.clientX + 20,
            y = event.clientY - 100;
        if (y < 50) y = 50;
        let oc = ``;
        let SC = "";

        if (server) SC = `<div class="section roles"><div class="label"><span class="icon icon-roles"></span>${roles.length > 0 ? "R" : "No r"}oles</div><ul class="member-roles">${rolecode}</ul></div>`;

        let P = $(`
<div class="popout popout-right no-arrow" style="visibility: hidden; left: ${x + "px"};">
<div class="user-popout">
<header class="header">
<div class="avatar-wrapper">
<div class="avatar-hint">Inspect</div>
<div class="avatar-popout stop-animation" style="background-image: url(${avatarID ? 'https://cdn.discordapp.com/avatars/' + userID + '/' + avatarID + '.png?size=256' : user.user.defaultAvatarURL});" onclick="${oc}">
<div class="status status-${user.presence.status}"></div>
</div>
</div>
<div class="username-wrapper ${nick ? "has-nickname" : ""}">${nick}<div class="discord-tag"><span class="username">${username}</span><span class="discriminator">#${discriminator}</span>${bot ? `<span class="bot-tag bot-tag-invert">BOT</span>` : ""}</div>
${user.presence.game ? '<div class="activity">Playing <strong>' + user.presence.game.name + '</strong></div>' : ""}
</div></header><div class="body">${SC}<div class="section notes"><div class="label"><span class="icon icon-notes"></span>Note</div><div class="note"><div class="text">${note ? note : "<span style='color: #b9bec6'>No notes</span>"}</div></div></div></div></div></div>`);
        $("#tooltips").html(P[0].outerHTML);
        P = $("#tooltips .popout");

        let pageheight = $(window).height();
        let diff = (pageheight) - (y + P.height());
        if (diff < 0) y += diff;

        P.css('top', `${y + "px"}`);
        P.css('visibility', 'visible')
    }

    function PO_off() {
        popupOpen.state = false;
        console.log("PO_off");
        $("#tooltips").html("")
    }

    if (!popupOpen.state && !off)
        P(event, id, currentServer);
    else
        PO_off()
}

module.exports = {
    server_switch,
    role_switch,
    main_menu,
    PO,
    LOGIN,
    popupOpen,
    at
};