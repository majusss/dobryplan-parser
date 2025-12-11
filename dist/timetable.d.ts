import { CheerioAPI } from "cheerio";
import { List, TableId } from "./types";
import Table from "./table";
export default class Timetable {
    $: CheerioAPI;
    constructor(html: string);
    getListKeys(): string[];
    private getKey;
    getList(): List;
    getTable(id: TableId): Table;
    getVersionInfo(): string;
}
