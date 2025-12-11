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
    getKey(key) {
        switch (key.toLowerCase()) {
            case "oddziały":
                return "classes";
            case "nauczyciele":
                return "teachers";
            case "sale":
                return "rooms";
            default:
                throw new Error(`Unknown list key: ${key}`);
        }
    }
    getList() {
        const navChildren = this.$("nav div").children().toArray();
        navChildren.shift(); // remove first element (it's dobryplan logo)
        const values = { classes: [], teachers: [], rooms: [] };
        let currentKey = null;
        navChildren.forEach((el, i) => {
            var _a, _b;
            const element = this.$(el);
            if (element.hasClass("h")) {
                currentKey = this.getKey(element.text().trim());
            }
            else if (element.hasClass("l") && currentKey) {
                const name = element.text().trim();
                const value = (_b = (_a = element.attr("href")) === null || _a === void 0 ? void 0 : _a.replace("#", "").trim()) !== null && _b !== void 0 ? _b : "";
                values[currentKey].push({
                    name,
                    id: { value, type: currentKey },
                });
            }
        });
        return values;
    }
    getTable(id) {
        const table = this.$(`main table#${id.value}`).first();
        const html = table.html();
        if (!html) {
            throw new Error("Table not found");
        }
        return new table_1.default(html, id.type);
    }
    getVersionInfo() {
        console.log("Footer text:", this.$("footer").text());
        return this.$("footer").text().replace("Plan obowiązuje od: ", "").trim();
    }
}
exports.default = Timetable;
