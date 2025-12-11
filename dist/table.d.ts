import { CheerioAPI } from "cheerio";
import { TableHour, TableLesson, TableType } from "./types";
export default class Table {
    $: CheerioAPI;
    private type;
    constructor(table: string, type: TableType);
    getTitle(): string;
    getDayNames(): string[];
    getHours(): Record<number, TableHour>;
    getDays(): TableLesson[][][];
    private getSmallCellData;
    private parseRow;
}
