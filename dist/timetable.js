"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const table_1 = require("./table");
class Timetable {
    constructor(html) {
        this.$ = (0, cheerio_1.load)(html);
    }
    getListKeys() {
        return this.$("nav div.h")
            .toArray()
            .map((el) => this.$(el).text().trim());
    }
    getList() {
        const navChildren = this.$("nav div").children().toArray();
        navChildren.shift(); // remove first element (it's dobryplan logo)
        const values = {};
        let currentKey = "";
        navChildren.forEach((el, i) => {
            var _a, _b;
            const element = this.$(el);
            if (element.hasClass("h")) {
                currentKey = element.text().trim();
                values[currentKey] = [];
            }
            else if (element.hasClass("l") && currentKey) {
                const name = element.text().trim();
                const value = (_b = (_a = element.attr("href")) === null || _a === void 0 ? void 0 : _a.replace("#", "").trim()) !== null && _b !== void 0 ? _b : "";
                values[currentKey].push({ name, value });
            }
        });
        return values;
    }
    getTable(id) {
        const table = this.$(`main table#${id}`).first();
        const html = table.html();
        if (!html) {
            throw new Error("Table not found");
        }
        return new table_1.default(html);
    }
}
exports.default = Timetable;
