const utils = require("./utils");

function profile_role(name, hex) {
    let E = $(`<component class="member-role"><span class="name">${name}</span></component>`);
    if (hex) {
        E.css({
            "color": RGB(hex),
            "background-color": RGBA(hex, 0.0980392),
            "border": `1px solid ${RGBA(hex, 0.498039)}`
        })
    }
    return E[0].outerHTML
}


/**
 * @return {string}
 */
function RGB(hexrgb) {
    let rgb = (hexrgb.r && hexrgb.g && hexrgb.b) !== undefined ? hexrgb : utils.hexToRgb(hexrgb);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

/**
 * @return {string}
 */
function RGBA(hexrgb, a) {
    let rgb = (hexrgb.r && hexrgb.g && hexrgb.b) !== undefined ? hexrgb : utils.hexToRgb(hexrgb);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
}

module.exports = {profile_role,RGB,RGBA};