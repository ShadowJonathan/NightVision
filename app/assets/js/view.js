const Discord = require("discord.js")
const client = new Discord.Client();
const stringify = require('json-stringify-safe');
const generate = require('./assets/js/generate');
const handle = require('./assets/js/handle');
const utils = require('./assets/js/utils');
const getset = require('./assets/js/getset');
window.$ = window.jQuery = require('jquery');
var servers, currentserver, currentrole, roles, T;

var remote = require('electron').remote,
    args = remote.getGlobal('sharedObject').argv.slice(2);

$(function () {
    servers = $("#servers").find("ul");
    servers.click(event => {
        console.log(event);
        currentserver = handle.server_switch(event, client)
    });

    roles = $("#roles");
    roles.click(event => {
        console.log(event);
        currentrole = handle.role_switch(event, currentserver)
    });

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            console.log(e);
            if (handle.popupOpen.state)
                return handle.PO(null, null, null, true);

            switch (handle.at.place) {
                case "server":
                    handle.main_menu();
                    break;
                case "role":
                    handle.server_switch(e, client, currentserver)
            }

            handle.PO(null, null, null, true)
        }
    });

    $(document).on('click', function (event) {
        let id = utils.getMatchUpwards(event.target, /id-(\d+)/i);
        let off = true;
        if (id) {
            if (id.input.includes("listMember"))
                off = false;
            id = id[1];
        }
        if (!off && handle.popupOpen.state)
            handle.PO(null, null, null, true);
        handle.PO(event, id, currentserver, off)
    });
});

Discord.Role.prototype.toJSON = function () {
    let hc = "";
    try {
        hc = this.hexColor
    } catch (err) {}
    return {
        calculatedPosition: this.calculatedPosition,
        color: this.color,
        createdAt: this.createdAt,
        createdTimestamp: this.createdTimestamp,
        editable: this.editable,
        hexColor: hc,
        hoist: this.hoist,
        id: this.id,
        managed: this.managed,
        mentionable: this.mentionable,
        name: this.name,
        permissions: this.permissions,
        position: this.position
    }
};

Map.prototype.toJSON = function () {
    let obj = {};
    for (let [key, value] of this)
        obj[key] = value
    return obj
};

Map.prototype.simpleArray = function () {
    return JSON.parse(JSON.stringify(this.array()))
};

/**
 * @return {Array|*}
 */
Map.prototype.array = function () {
    if (!this._array || this._array.length !== this.size)
        this._array = Array.from(this.values());
    return this._array;
};

$(() => {
    if (!!args.length) {
        T = args[0]
    } else {
        T = getset.token();
    }

    if (!T)
        handle.LOGIN(client);
    else
        client.login(T)
        .then(function () {
            console.log("Logged in");
            if (!servers)
                $(() => generate.servers(client.guilds, $("#servers").find("ul")));
            else
                generate.servers(client.guilds, servers)
        });
})
let i = 0;

function reloadcss() {
    i += 1;
    $('link')[0].href = `assets/css/view.min.css?q=${i}`
}

function getRoleUpdatesFor(id, server, until) {
    return new Promise((r) => {
        var last = null;
        var all = [];

        function f() {
            client.guilds.get(server).fetchAuditLogs({
                type: Discord.GuildAuditLogs.Actions.MEMBER_ROLE_UPDATE,
                before: last
            }).then(function (value) {
                console.log("Grabbed audit logs before", last);
                let a = value.entries.array();
                a.sort((a, b) => b.createdAt - a.createdAt);
                for (let e of a) {
                    last = e;
                    all.push(e)
                }

                if (last.createdAt.getDate() === until.getDate()) {
                    f()
                } else {
                    all.sort((a, b) => b.createdAt - a.createdAt);
                    all = all.filter((v) => v.target.id == id)
                    r(all)
                }
            })
        }

        f()
    })
}