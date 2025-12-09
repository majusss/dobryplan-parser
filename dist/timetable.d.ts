import { CheerioAPI } from "cheerio";
import { List } from "./types";
import Table from "./table";
export default class Timetable {
    $: CheerioAPI;
    constructor(html: string);
    getListKeys(): string[];
    getList(): List;
    getTable(id: string): Table;
}
