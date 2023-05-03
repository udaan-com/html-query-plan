"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xml = require("./xml");
var lines_1 = require("./lines");
exports.drawLines = lines_1.drawLines;
var tooltip_1 = require("./tooltip");
var node_1 = require("./node");
exports.Node = node_1.Node;
var qpXslt = require("raw-loader!./qp.xslt");
function showPlan(container, planXml, options) {
    options = setDefaults(options, {
        jsTooltips: true
    });
    xml.setContentsUsingXslt(container, planXml, qpXslt);
    container["xml"] = new DOMParser().parseFromString(planXml, "text/xml");
    lines_1.drawLines(container);
    if (options.jsTooltips) {
        tooltip_1.initTooltip(container);
    }
}
exports.showPlan = showPlan;
function setDefaults(options, defaults) {
    var ret = {};
    for (var attr in defaults) {
        if (defaults.hasOwnProperty(attr)) {
            ret[attr] = defaults[attr];
        }
    }
    for (var attr in options) {
        if (options.hasOwnProperty(attr)) {
            ret[attr] = options[attr];
        }
    }
    return ret;
}
//# sourceMappingURL=index.js.map