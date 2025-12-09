import { CheerioAPI } from "cheerio";
import { TableHour } from "./types";
export default class Table {
    $: CheerioAPI;
    constructor(table: string);
    getTitle(): string;
    getDayNames(): string[];
    getHours(): Record<number, TableHour>;
}
