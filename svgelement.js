"use strict";
/**
 * a little wrapper for creating SVG elements and getting/setting their attributes
 * and observing their events.
 * inspired by d3.js (http://d3js.org)
 */
class Elem {
    /**
     * @param svg is the parent SVG object that will host the new element
     * @param tag could be "rect", "line", "ellipse", etc.
     */
    constructor(svg, tag) {
        this.elem = document.createElementNS(svg.namespaceURI, tag);
        svg.appendChild(this.elem);
    }
    attr(name, value) {
        if (typeof value === 'undefined') {
            return this.elem.getAttribute(name);
        }
        this.elem.setAttribute(name, value.toString());
        return this;
    }
    /**
     * @returns an Observable for the specified event on this element
     */
    observe(event) {
        return Observable.fromEvent(this.elem, event);
    }
}
//# sourceMappingURL=svgelement.js.map