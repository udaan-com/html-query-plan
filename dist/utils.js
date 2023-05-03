"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Finds the first ancestor that has the given class name.
 * @param element Element to search.
 * @param className Class name to search for.
 */
function findAncestor(element, className) {
    return findAncestorP(element, function (e) { return hasClass(e, className); });
}
exports.findAncestor = findAncestor;
/**
 * Finds the first ancestor that matches the given predicate.
 * @param element Element to search.
 * @param predicate Predicate for the ancestor to find.
 */
function findAncestorP(element, predicate) {
    if (element === null) {
        return null;
    }
    while ((element = element.parentElement) && element && !predicate(element))
        ;
    return element;
}
exports.findAncestorP = findAncestorP;
function hasClass(element, cls) {
    return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
}
exports.hasClass = hasClass;
//# sourceMappingURL=utils.js.map