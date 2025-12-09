"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
class Table {
    constructor(table) {
        this.$ = (0, cheerio_1.load)(`<table>${table}</table>`);
    }
    getTitle() {
        return this.$("caption").text().trim();
    }
    getDayNames() {
        return this.$("thead td.l.t")
            .toArray()
            .map((element) => this.$(element).text().trim());
    }
    getHours() {
        const rows = this.$("tr");
        const hours = {};
        rows.each((_, row) => {
            var _a;
            const isFullRow = +((_a = this.$(row).find(".l.t.r").attr("rowspan")) !== null && _a !== void 0 ? _a : 0) == 2;
            if (!isFullRow)
                return;
            const number = parseInt(this.$(row).find(".l.t.r").text().trim());
            const timesText = this.$(row).children().eq(1).text().trim();
            const [timeFrom, timeTo] = timesText
                .split("–")
                .map((e) => e.trim());
            hours[number] = {
                number,
                timeFrom,
                timeTo,
            };
        });
        return hours;
    }
}
exports.default = Table;
