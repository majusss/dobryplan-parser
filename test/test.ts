import { Timetable } from "../lib";

(async () => {
  const res = await fetch(
    "https://zstio-elektronika.pl/nowy-plan/Dobryplan.html"
  );
  const html = await res.text();
  const t = new Timetable(html);
  const list = t.getList();
  console.log(t);
  const table = t.getTable(list["Oddziały"][2].value);
  console.log(table.getTitle());
  console.log(table.getDayNames());
  console.log(table.getHours());
  console.log(table.getDays());
})();
