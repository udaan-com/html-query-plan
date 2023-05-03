"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var node_1 = require("./node");
var TOOLTIP_TIMEOUT = 500;
// ID of the timeout used to delay showing the tooltip on mouseover.
var timeoutId = null;
// The currently visible tooltip, if one is shown; Otherwise, null.
var currentTooltip = null;
// X & Y coordinates of the mouse cursor
var cursorX = 0;
var cursorY = 0;
function initTooltip(container) {
    disableCssTooltips(container);
    trackMousePosition();
    var nodes = container.querySelectorAll(".qp-node");
    for (var i = 0; i < nodes.length; i++) {
        addTooltip(nodes[i], function (e) { return e.querySelector(".qp-tt").cloneNode(true); });
    }
    var lines = container.getElementsByTagName("polyline");
    var _loop_1 = function (i) {
        var line = new node_1.Line(lines[i]);
        addTooltip(line.element, function (e) {
            return buildLineTooltip(line);
        });
    };
    for (var i = 0; i < lines.length; i++) {
        _loop_1(i);
    }
}
exports.initTooltip = initTooltip;
function addTooltip(node, createTooltip) {
    node.addEventListener("mouseover", function () { return onMouseover(node, createTooltip); });
    node.addEventListener("mouseout", function (event) { return onMouseout(node, event); });
}
function disableCssTooltips(container) {
    var root = container.querySelector(".qp-root");
    root.className += " qp-noCssTooltip";
}
function trackMousePosition() {
    document.onmousemove = function (e) {
        cursorX = e.pageX;
        cursorY = e.pageY;
    };
}
function onMouseover(node, createTooltip) {
    if (timeoutId != null)
        return;
    timeoutId = window.setTimeout(function () {
        var tooltip = createTooltip(node);
        if (tooltip != null)
            showTooltip(node, tooltip);
    }, TOOLTIP_TIMEOUT);
}
function onMouseout(node, event) {
    // http://stackoverflow.com/questions/4697758/prevent-onmouseout-when-hovering-child-element-of-the-parent-absolute-div-withou
    var e = event.toElement || event.relatedTarget;
    // If the element currently under the mouse is still the node, don't hide the tooltip
    if (e == node || e == currentTooltip)
        return;
    // If the mouse hovers over child elements (e.g. the text in the tooltip or the text / icons in the node) then a mouseoout
    // event is raised even though the mouse is still contained inside the node / tooltip. Search ancestors and don't hide the
    // tooltip if this is the case
    if (utils_1.findAncestorP(e, function (x) { return x == node; }))
        return;
    if (utils_1.findAncestorP(e, function (x) { return x == currentTooltip; }))
        return;
    window.clearTimeout(timeoutId);
    timeoutId = null;
    hideTooltip();
}
function showTooltip(node, tooltip) {
    hideTooltip();
    var positionY = cursorY;
    // Nudge the tooptip up if its going to appear below the bottom of the page
    var documentHeight = getDocumentHeight();
    var gapAtBottom = documentHeight - (positionY + tooltip.offsetHeight);
    if (gapAtBottom < 10) {
        positionY = documentHeight - (tooltip.offsetHeight + 10);
    }
    // Stop the tooltip appearing above the top of the page
    if (positionY < 10) {
        positionY = 10;
    }
    currentTooltip = tooltip;
    document.body.appendChild(currentTooltip);
    currentTooltip.style.left = cursorX + "px";
    currentTooltip.style.top = positionY + "px";
    currentTooltip.addEventListener("mouseout", function (event) {
        onMouseout(node, event);
    });
}
function getDocumentHeight() {
    // http://stackoverflow.com/a/1147768/113141
    var body = document.body, html = document.documentElement;
    return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
}
function hideTooltip() {
    if (currentTooltip != null) {
        document.body.removeChild(currentTooltip);
        currentTooltip = null;
    }
}
/**
 * Builds the tooltip HTML for a Line.
 * @param line Line to build the tooltip for.
 */
function buildLineTooltip(line) {
    if (line.relOp == null)
        return null;
    var parser = new DOMParser();
    var actualNumberOfRows = line.relOp.actualRows != null ?
        "<tr>\n            <th>Actual Number of Rows</th>\n            <td>" + line.relOp.actualRows + "</td>\n        </tr>" : '';
    var numberOfRowsRead = line.relOp.actualRowsRead != null ?
        "<tr>\n            <th>Number of Rows Read</th>\n            <td>" + line.relOp.actualRowsRead + "</td>\n        </tr>" : '';
    var document = parser.parseFromString("\n        <div class=\"qp-tt\"><table><tbody>\n        " + actualNumberOfRows + "\n        " + numberOfRowsRead + "\n        <tr>\n            <th>Estimated Number of Rows</th>\n            <td>" + line.relOp.estimatedRows + "</td>\n        </tr>\n        <tr>\n            <th>Estimated Row Size</th>\n            <td>" + convertSize(line.relOp.estimatedRowSize) + "</td>\n        </tr>\n        <tr>\n            <th>Estimated Data Size</th>\n            <td>" + convertSize(line.relOp.estimatedDataSize) + "</td>\n        </tr>\n        </tbody></tabke></div>\n    ", "text/html");
    return document.getElementsByClassName("qp-tt")[0];
}
exports.buildLineTooltip = buildLineTooltip;
/**
 * Convets sizes to human readable strings.
 * @param b Size in bytes.
 */
function convertSize(b) {
    if (b >= 10000) {
        var kb = b / 1024;
        if (kb >= 10000) {
            var mb = kb / 1024;
            return Math.round(mb) + " MB";
        }
        return Math.round(kb) + " KB";
    }
    return b + " B";
}
exports.convertSize = convertSize;
//# sourceMappingURL=tooltip.js.map