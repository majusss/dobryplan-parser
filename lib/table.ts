import { Cheerio, CheerioAPI, load } from "cheerio";
import { TableHour, TableId, TableLesson, TableType } from "./types";
import { AnyNode } from "domhandler";

export default class Table {
  public $: CheerioAPI;
  private type: TableType;

  public constructor(table: string, type: TableType) {
    this.$ = load(`<table>${table}</table>`);
    this.type = type;
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
      const $row = this.$(row);
      const hourCell = $row.find(".l.t.r");

      if (hourCell.length === 0) return;

      const lessonNumber = parseInt(hourCell.text().trim()) - 1;
      const hasSecondRow = parseInt(hourCell.attr("rowspan") ?? "1") === 2;
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

  private getSmallCellData(cells: Cheerio<AnyNode>[]): {
    teacher?: string;
    teacherId?: TableId;
    room?: string;
    roomId?: TableId;
  } {
    // Read at most two following non-lesson cells
    const nextCells: Cheerio<AnyNode>[] = [];
    for (const cell of cells) {
      const $cell = this.$(cell);
      if (
        ($cell.hasClass("l") && $cell.hasClass("t")) ||
        $cell.find("div.g").length > 0
      )
        break;
      nextCells.push(cell);
    }

    const getTextAndId = (
      cell: Cheerio<AnyNode> | undefined,
      type: TableType
    ): [string | undefined, TableId | undefined] => {
      if (!cell) return [undefined, undefined];
      const $cell = this.$(cell);
      const text = $cell.text().trim() || undefined;
      const href = $cell.find("a").attr("href");
      if (!href) return [text, undefined];
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

  private parseRow(
    cells: any[],
    groupIndex: number
  ): { lessons: TableLesson[]; splitDayIndexes: number[] } {
    const lessons: TableLesson[] = [];
    const splitDayIndexes: number[] = [];

    cells.forEach((cell, cellIndex) => {
      const $cell = this.$(cell);

      const isLesson =
        groupIndex == 0
          ? $cell.hasClass("l") && $cell.hasClass("t")
          : $cell.hasClass("l");

      if (!isLesson) return;

      const isSplit = $cell.attr("rowspan") === "1";

      if (isSplit) {
        splitDayIndexes.push(lessons.length);
      }

      const branches = $cell.find("div.g").first().text();
      const cellText = $cell.text().trim();
      const subject = branches.length
        ? cellText.replace(branches, "").trim()
        : cellText;

      const small = this.getSmallCellData(cells.slice(cellIndex + 1));

      const lesson: TableLesson = {
        subject: subject,
        teacher: small.teacher,
        teacherId: small.teacherId,
        room: small.room,
        roomId: small.roomId,
        groupName: isSplit ? `Grupa ${groupIndex + 1}` : undefined,
        className: branches.length ? branches.trim() : undefined,
      };

      // console.log("Do wiersz adodano lekcje nr", lessons.length + 1, lesson);

      lessons.push(lesson);
    });

    return { lessons, splitDayIndexes };
  }
}
