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
    getDays() {
        const rows = this.$("tr").toArray();
        const days = Array.from({ length: this.getDayNames().length }, () => []);
        rows.forEach((row, rowIndex) => {
            var _a;
            const isFullRow = parseInt((_a = this.$(row).find(".l.t.r").attr("rowspan")) !== null && _a !== void 0 ? _a : "") == 2;
            const isNextRowAvailable = this.$(rows[rowIndex + 1]).find(".l.t.r").length == 0;
            const secondRowDataIndexes = [];
            if (isFullRow) {
                const cells = this.$(row).children().toArray().slice(2); // skip first two cells (hour number and time)
                const lessonsInRow = [];
                cells.forEach((cell, cellIndex) => {
                    const $cell = this.$(cell);
                    const isLessonName = $cell.hasClass("l") && $cell.hasClass("t");
                    if (!isLessonName)
                        return;
                    if ($cell.attr("rowspan") == "1") {
                        secondRowDataIndexes.push(lessonsInRow.length);
                    }
                    const tableLesson = {
                        subject: $cell.text().trim(),
                        teacher: this.$(cells[cellIndex + 1])
                            .text()
                            .trim(),
                        room: this.$(cells[cellIndex + 2])
                            .text()
                            .trim(),
                        ...{
                            groupName: $cell.attr("rowspan") == "1" ? "Grupa 1" : undefined,
                        },
                    };
                    lessonsInRow.push(tableLesson);
                });
                lessonsInRow.map((lesson, index) => {
                    days[index].push([lesson]);
                });
            }
            if (isNextRowAvailable) {
                const nextRow = this.$(rows[rowIndex + 1]);
                const cells = nextRow.children().toArray();
                const lessonsInRow = [];
                cells.forEach((cell, cellIndex) => {
                    const $cell = this.$(cell);
                    const isLessonName = $cell.hasClass("l");
                    if (!isLessonName)
                        return;
                    const tableLesson = {
                        subject: $cell.text().trim(),
                        teacher: this.$(cells[cellIndex + 1])
                            .text()
                            .trim(),
                        room: this.$(cells[cellIndex + 2])
                            .text()
                            .trim(),
                        ...{
                            groupName: $cell.attr("rowspan") == "1" ? "Grupa 2" : undefined,
                        },
                    };
                    lessonsInRow.push(tableLesson);
                });
                lessonsInRow.map((lesson, index) => {
                    const dayIndex = secondRowDataIndexes[index];
                    if (!days[dayIndex])
                        days[dayIndex] = [];
                    const lessonNumber = parseInt(this.$(row).find(".l.t.r").text().trim());
                    if (days[dayIndex][lessonNumber - 1] === undefined) {
                        days[dayIndex][lessonNumber - 1] = [];
                    }
                    days[dayIndex][lessonNumber - 1].push(lesson);
                });
            }
        });
        return days;
    }
}
exports.default = Table;
