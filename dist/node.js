"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function find(nodes, type) {
    var returnValue = [];
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeName === type) {
            returnValue.push(nodes[i]);
        }
    }
    return returnValue;
}
function getNodeXml(queryPlanXml, statementId, nodeId) {
    var statement = queryPlanXml.querySelector("[StatementId=\"" + statementId + "\"]");
    if (!nodeId)
        return statement;
    var elements = statement.getElementsByTagName("RelOp");
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.attributes["NodeId"] && element.attributes["NodeId"].value == nodeId) {
            return element;
        }
    }
    return null;
}
/**
 * Wraps a RelOp element in the query plan schema.
 */
var RelOp = /** @class */ (function () {
    function RelOp(element) {
        this.element = element;
        if (!this.element)
            throw new Error("element cannot be null");
        if (this.element.tagName != "RelOp")
            throw new Error("element must be a RelOp element");
    }
    Object.defineProperty(RelOp.prototype, "estimatedRows", {
        /**
         * Gets the estimated number of nodes returned by the operation.
         */
        get: function () {
            return parseFloat(this.element.attributes["EstimateRows"].value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelOp.prototype, "estimatedRowSize", {
        /**
         * Gets the estimated row size in bytes.
         */
        get: function () {
            return parseInt(this.element.attributes["AvgRowSize"].value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelOp.prototype, "estimatedDataSize", {
        /**
         * Gets the estimated total size of the data.
         */
        get: function () {
            return Math.round(this.estimatedRowSize * this.estimatedRows);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelOp.prototype, "runtimeCountersPerThread", {
        /**
         * Gets an array of the RunTimeCountersPerThread elements for the RelOp, or returns an empty array if the
         * RunTimeInformation is not present.
         */
        get: function () {
            var runtimeInformation = find(this.element.childNodes, "RunTimeInformation");
            if (runtimeInformation.length == 0) {
                return [];
            }
            return find(runtimeInformation[0].childNodes, "RunTimeCountersPerThread");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelOp.prototype, "actualRows", {
        /**
         * Gets the actual number of rows returned by the operation.
         */
        get: function () {
            return this.runtimeCountersPerThread.length == 0 ? null
                : this.runtimeCountersPerThread.reduce(function (a, b) { return a + parseFloat(b.attributes["ActualRows"].value); }, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelOp.prototype, "actualRowsRead", {
        /**
         * Gets the actual number of rows read.
         */
        get: function () {
            return this.runtimeCountersPerThread.length == 0 || !this.runtimeCountersPerThread[0].attributes["ActualRowsRead"] ? null
                : this.runtimeCountersPerThread.reduce(function (a, b) { return a + parseFloat(b.attributes["ActualRowsRead"].value); }, 0);
        },
        enumerable: true,
        configurable: true
    });
    return RelOp;
}());
exports.RelOp = RelOp;
/**
 * Wraps the HTML element represending a node in a query plan.
 */
var Node = /** @class */ (function () {
    function Node(element) {
        this.element = element;
        if (!this.element)
            throw new Error("element cannot be null");
        if (this.element.className != "qp-node")
            throw new Error("element must have class qp-node");
    }
    Object.defineProperty(Node.prototype, "children", {
        /**
         * Gets an array of child nodes.
         */
        get: function () {
            return [].slice.call(utils_1.findAncestor(this.element, "qp-tr").children[1].children)
                .map(function (c) { return new Node(c.children[0].children[0].children[0]); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "nodeId", {
        /**
         * Gets the NodeID for the wrapped query plan node, or returns null if the node doesn't have a node ID (e.g.
         * if its a top-level statement).
         */
        get: function () {
            var nodeId = this.element.attributes["data-node-id"];
            return nodeId && nodeId.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "statementId", {
        /**
         * Gets the statement ID of the node.
         */
        get: function () {
            var statement = utils_1.findAncestorP(this.element, function (e) { return e.hasAttribute("data-statement-id"); });
            return statement.attributes["data-statement-id"].value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "queryPlanXml", {
        /**
         * Gets the xml for the whole query plan.
         */
        get: function () {
            var root = utils_1.findAncestor(this.element, "qp-root");
            return root == null ? null : root.parentElement["xml"];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "nodeXml", {
        /**
         * Gets the xml element corresponding to this node from the query plan xml.
         */
        get: function () {
            if (this.queryPlanXml == null)
                return null;
            return getNodeXml(this.queryPlanXml, this.statementId, this.nodeId);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "relOp", {
        /**
         * Gets a wrapped RelOp instance for this nodes RelOp query plan XML.
         */
        get: function () {
            var nodeXml = this.nodeXml;
            return nodeXml && nodeXml.tagName == "RelOp" ? new RelOp(this.nodeXml) : null;
        },
        enumerable: true,
        configurable: true
    });
    return Node;
}());
exports.Node = Node;
/**
 * Wraps a polyline element representing a line in a query plan.
 */
var Line = /** @class */ (function () {
    function Line(element) {
        this.element = element;
        if (!this.element)
            throw new Error("element cannot be null");
        if (this.element.nodeName != "polyline")
            throw new Error("element must be a polyline");
    }
    Object.defineProperty(Line.prototype, "nodeId", {
        /**
         * Gets the NodeID for the node corresponding to this line, or returns null if the node doesn't have a node ID (e.g.
         * if its a top-level statement).
         */
        get: function () {
            var nodeId = this.element.attributes["data-node-id"];
            return nodeId && nodeId.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "statementId", {
        /**
         * Gets the Statement ID for the node corresponding to this line.
         */
        get: function () {
            return this.element.attributes["data-statement-id"].value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "queryPlanXml", {
        /**
         * Gets the xml for the whole query plan.
         */
        get: function () {
            return utils_1.findAncestor(this.element, "qp-root").parentElement["xml"];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "nodeXml", {
        /**
         * Gets the xml element corresponding to this node from the query plan xml.
         */
        get: function () {
            return getNodeXml(this.queryPlanXml, this.statementId, this.nodeId);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "relOp", {
        /**
         * Gets a wrapped RelOp instance for this nodes RelOp query plan XML.
         */
        get: function () {
            var nodeXml = this.nodeXml;
            return nodeXml && nodeXml.tagName == "RelOp" ? new RelOp(this.nodeXml) : null;
        },
        enumerable: true,
        configurable: true
    });
    return Line;
}());
exports.Line = Line;
//# sourceMappingURL=node.js.map