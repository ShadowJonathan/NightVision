/**
 *
 * @param {Element|Node} node
 * @param {RegExp} reg
 * @return {?Array|{index:number, input:string}}
 */
function getMatchUpwards(node, reg) {
    if (reg.test(node.className)) {
        return reg.exec(node.className)
    } else if (node.parentElement) {
        return getMatchUpwards(node.parentElement, reg)
    } else return null
}

function sortAlphabetical(a, b) {
    let A = a.toLowerCase();
    let B = b.toLowerCase();
    if (A < B) {
        return -1;
    } else if (A > B) {
        return 1;
    } else {
        return 0;
    }
}

function make_Ini(name) {
    let R = /(?:([#.\-])[#.\-]*)|(?:(\w)\w*)/ig;
    let I = "", match = R.exec(name);
    while (match !== null) {
        I += match[1] || match[2];
        match = R.exec(name)
    }
    return I
}

function idealTextColor(bgColor) {

    let components = hexToRgb(bgColor);

    let o = Math.round(
        (
            (components.r * 299) +
            (components.g * 587) +
            (components.b * 114)
        ) / 1000
    );

    return (o > 125) ? "#000000" : "#ffffff";
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function LightenDarkenColor(col, amt) {

    let rgb = hexToRgb(col);

    rgb.r = (rgb.r + amt) >= 0 ? (rgb.r + amt) <= 255 ? rgb.r + amt : 255 : 0;
    rgb.g = (rgb.g + amt) >= 0 ? (rgb.g + amt) <= 255 ? rgb.g + amt : 255 : 0;
    rgb.b = (rgb.b + amt) >= 0 ? (rgb.b + amt) <= 255 ? rgb.b + amt : 255 : 0;

    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

module.exports = {getMatchUpwards, make_Ini, idealTextColor, LightenDarkenColor, rgbToHex, hexToRgb, sortAlphabetical};