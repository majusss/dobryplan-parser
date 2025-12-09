import { CheerioAPI, load } from "cheerio";
import { List } from "./types";
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

  public getList(): List {
    const navChildren = this.$("nav div").children().toArray();
    navChildren.shift(); // remove first element (it's dobryplan logo)

    const values: List = {};
    let currentKey = "";
    navChildren.forEach((el, i) => {
      const element = this.$(el);
      if (element.hasClass("h")) {
        currentKey = element.text().trim();
        values[currentKey] = [];
      } else if (element.hasClass("l") && currentKey) {
        const name = element.text().trim();
        const value = element.attr("href")?.replace("#", "").trim() ?? "";
        values[currentKey].push({ name, value });
      }
    });
    return values;
  }

  public getTable(id: string) {
    const table = this.$(`main table#${id}`).first();
    const html = table.html();
    if (!html) {
      throw new Error("Table not found");
    }
    return new Table(html);
  }
}
