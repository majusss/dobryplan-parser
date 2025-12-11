"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
class Table {
    constructor(table, type) {
        this.$ = (0, cheerio_1.load)(`<table>${table}</table>`);
        this.type = type;
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
            const $row = this.$(row);
            const hourCell = $row.find(".l.t.r");
            if (hourCell.length === 0)
                return;
            const number = parseInt(hourCell.text().trim());
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
            const $row = this.$(row);
            const hourCell = $row.find(".l.t.r");
            if (hourCell.length === 0)
                return;
            const lessonNumber = parseInt(hourCell.text().trim()) - 1;
            const hasSecondRow = parseInt((_a = hourCell.attr("rowspan")) !== null && _a !== void 0 ? _a : "1") === 2;
            const cells = $row.children().toArray().slice(2);
            const { lessons, splitDayIndexes } = this.parseRow(cells, 0);
            lessons.forEach((lesson, dayIndex) => {
                if (!days[dayIndex][lessonNumber]) {
                    days[dayIndex][lessonNumber] = [];
                }
                days[dayIndex][lessonNumber].push(lesson);
            });
            if (hasSecondRow && rows[rowIndex + 1]) {
                const $nextRow = this.$(rows[rowIndex + 1]);
                if ($nextRow.find(".l.t.r").length === 0) {
                    const nextCells = $nextRow.children().toArray();
                    const { lessons: secondLessons } = this.parseRow(nextCells, 1);
                    secondLessons.forEach((lesson, index) => {
                        const dayIndex = splitDayIndexes[index];
                        days[dayIndex][lessonNumber].push(lesson);
                    });
                }
            }
        });
        return days;
    }
    getSmallCellData(cells) {
        // Read at most two following non-lesson cells
        const nextCells = [];
        for (const cell of cells) {
            const $cell = this.$(cell);
            if (($cell.hasClass("l") && $cell.hasClass("t")) ||
                $cell.find("div.g").length > 0)
                break;
            nextCells.push(cell);
        }
        const getTextAndId = (cell, type) => {
            if (!cell)
                return [undefined, undefined];
            const $cell = this.$(cell);
            const text = $cell.text().trim() || undefined;
            const href = $cell.find("a").attr("href");
            if (!href)
                return [text, undefined];
            const id = { value: href.slice(1), type };
            return [text, id];
        };
        if (this.type === "teachers") {
            // in teachers tables: next cell is room
            const [room, roomId] = getTextAndId(nextCells[0], "rooms");
            return { room, roomId };
        }
        if (this.type === "rooms") {
            // in rooms tables: next cell is teacher
            const [teacher, teacherId] = getTextAndId(nextCells[0], "teachers");
            return { teacher, teacherId };
        }
        // in classes tables: first next is teacher, second next is room
        const [teacher, teacherId] = getTextAndId(nextCells[0], "teachers");
        const [room, roomId] = getTextAndId(nextCells[1], "rooms");
        return { teacher, teacherId, room, roomId };
    }
    parseRow(cells, groupIndex) {
        const lessons = [];
        const splitDayIndexes = [];
        cells.forEach((cell, cellIndex) => {
            const $cell = this.$(cell);
            const isLesson = groupIndex == 0
                ? $cell.hasClass("l") && $cell.hasClass("t")
                : $cell.hasClass("l");
            if (!isLesson)
                return;
            const isSplit = $cell.attr("rowspan") === "1";
            if (isSplit) {
                splitDayIndexes.push(lessons.length);
            }
            const branches = $cell.find("div.g").first().text();
            const cellText = $cell.text().trim();
            const subject = branches.length
                ? cellText.replace(branches, "").trim()
                : cellText;
            const smallCell = this.getSmallCellData(cells.slice(cellIndex + 1));
            const lesson = {
                subject: subject,
                teacher: smallCell.teacher,
                teacherId: smallCell.teacherId,
                room: smallCell.room,
                roomId: smallCell.roomId,
                groupName: this.type === "classes"
                    ? isSplit
                        ? `Grupa ${groupIndex + 1}`
                        : undefined
                    : undefined,
                className: branches.length ? branches.trim() : undefined,
            };
            lessons.push(lesson);
        });
        return { lessons, splitDayIndexes };
    }
}
exports.default = Table;
