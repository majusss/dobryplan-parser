import { Cheerio, CheerioAPI, load } from "cheerio";
import { TableHour, TableLesson } from "./types";
import { AnyNode } from "domhandler";

export default class Table {
  public $: CheerioAPI;

  public constructor(table: string) {
    this.$ = load(`<table>${table}</table>`);
  }

  public getTitle(): string {
    return this.$("caption").text().trim();
  }

  public getDayNames(): string[] {
    return this.$("thead td.l.t")
      .toArray()
      .map((element) => this.$(element).text().trim());
  }

  public getHours(): Record<number, TableHour> {
    const rows = this.$("tr");
    const hours: Record<number, TableHour> = {};
    rows.each((_, row): void => {
      const isFullRow = +(this.$(row).find(".l.t.r").attr("rowspan") ?? 0) == 2;
      if (!isFullRow) return;
      const number = parseInt(this.$(row).find(".l.t.r").text().trim());
      const timesText = this.$(row).children().eq(1).text().trim();
      const [timeFrom, timeTo] = timesText
        .split("–")
        .map((e): string => e.trim());
      hours[number] = {
        number,
        timeFrom,
        timeTo,
      };
    });
    return hours;
  }

  public getDays(): TableLesson[][][] {
    const rows = this.$("tr").toArray();
    const days: TableLesson[][][] = Array.from(
      { length: this.getDayNames().length },
      () => []
    );

    rows.forEach((row, rowIndex) => {
      const isFullRow =
        parseInt(this.$(row).find(".l.t.r").attr("rowspan") ?? "") == 2;
      const isNextRowAvailable =
        this.$(rows[rowIndex + 1]).find(".l.t.r").length == 0;
      const secondRowDataIndexes: number[] = [];
      if (isFullRow) {
        const cells = this.$(row).children().toArray().slice(2); // skip first two cells (hour number and time)

        const lessonsInRow: TableLesson[] = [];

        cells.forEach((cell, cellIndex) => {
          const $cell = this.$(cell);
          const isLessonName = $cell.hasClass("l") && $cell.hasClass("t");
          if (!isLessonName) return;

          if ($cell.attr("rowspan") == "1") {
            secondRowDataIndexes.push(lessonsInRow.length);
          }

          const tableLesson: TableLesson = {
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

        const lessonsInRow: TableLesson[] = [];

        cells.forEach((cell, cellIndex) => {
          const $cell = this.$(cell);
          const isLessonName = $cell.hasClass("l");
          if (!isLessonName) return;

          const tableLesson: TableLesson = {
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
          if (!days[dayIndex]) days[dayIndex] = [];
          const lessonNumber = parseInt(
            this.$(row).find(".l.t.r").text().trim()
          );
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
