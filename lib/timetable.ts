import { CheerioAPI, load } from "cheerio";
import { List, TableId, TableType } from "./types";
import Table from "./table";

export default class Timetable {
  public $: CheerioAPI;

  public constructor(html: string) {
    this.$ = load(html);
  }

  public getListKeys(): string[] {
    return this.$("nav div.h")
      .toArray()
      .map((el) => this.$(el).text().trim());
  }

  private getKey(key: string): TableType {
    switch (key.toLowerCase()) {
      case "oddziały":
        return "classes";
      case "nauczyciele":
        return "teachers";
      case "sale":
        return "rooms";
      default:
        throw new Error(`Unknown list key: ${key}`);
    }
  }

  public getList(): List {
    const navChildren = this.$("nav div").children().toArray();
    navChildren.shift(); // remove first element (it's dobryplan logo)

    const values: List = { classes: [], teachers: [], rooms: [] };
    let currentKey: TableType | null = null;
    navChildren.forEach((el, i) => {
      const element = this.$(el);
      if (element.hasClass("h")) {
        currentKey = this.getKey(element.text().trim());
      } else if (element.hasClass("l") && currentKey) {
        const name = element.text().trim();
        const value = element.attr("href")?.replace("#", "").trim() ?? "";
        values[currentKey].push({
          name,
          id: { value, type: currentKey },
        });
      }
    });
    return values;
  }

  public getTable(id: TableId): Table {
    const table = this.$(`main table#${id.value}`).first();
    const html = table.html();
    if (!html) {
      throw new Error("Table not found");
    }
    return new Table(html, id.type);
  }
}
