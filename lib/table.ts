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

  //   private parseLessons(nodes: Cheerio<AnyNode>): TableLesson[] {

  //   }

  //   public getDays(): TableLesson[][][] {
  //     const rows = this.$("tr").toArray();
  //     const days: TableLesson[][][] = Array.from(
  //       { length: this.getDayNames().length },
  //       () => []
  //     );

  //     rows.forEach((row) => {
  //       const isFullRow =
  //         parseInt(this.$(row).find(".l.t.r").attr("rowspan") ?? "") == 2;
  //       if (!isFullRow) return;
  //       const cells = this.$(row).children().toArray().slice(2); // skip first two cells (hour number and time)
  //       cells.forEach((cell, dayIndex) => {
  //         console.log(`<td>${this.$(cell).html()}</td>`);
  //         // days[dayIndex].push(lessons);
  //       });
  //     });
  //     return days;
  //   }
}
