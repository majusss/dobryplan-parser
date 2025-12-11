import { Timetable } from "../lib";
import Table from "../lib/table";

// AI SHIT TABLE (ale fajnie wyglada)
function displayTable(table: Table) {
  console.log("Plan lekcji:", table.getTitle());

  const days = table.getDays();
  const dayNames = table.getDayNames();
  const hours = table.getHours();

  const maxLesson = Math.max(
    ...days.flatMap((day) => day.map((_, index) => index))
  );

  const timetableRows: Record<string, any>[] = [];

  for (let lessonIndex = 0; lessonIndex <= maxLesson; lessonIndex++) {
    const row: Record<string, any> = {
      Nr: lessonIndex + 1,
      Godzina: hours[lessonIndex + 1]
        ? `${hours[lessonIndex + 1].timeFrom}-${hours[lessonIndex + 1].timeTo}`
        : "",
    };

    days.forEach((day, dayIndex) => {
      const lessons = day[lessonIndex] || [];
      const dayName = dayNames[dayIndex] || `Dzień ${dayIndex + 1}`;

      if (lessons.length === 0) {
        row[dayName] = "";
      } else {
        const formattedLessons = lessons
          .map((lesson) => {
            const parts = [lesson.subject || ""];
            if (lesson.room) parts.push(`s.${lesson.room}`);
            if (lesson.teacher) parts.push(lesson.teacher);
            if (lesson.className) parts.push(`(${lesson.className})`);
            if (lesson.groupName) parts.push(`[${lesson.groupName}]`);
            return parts.join(" ");
          })
          .join("\n");

        row[dayName] = formattedLessons;
      }
    });

    timetableRows.push(row);
  }

  console.table(timetableRows);
}

(async () => {
  const res = await fetch(
    "https://zstio-elektronika.pl/nowy-plan/Dobryplan.html"
  );
  const html = await res.text();
  const t = new Timetable(html);
  const list = t.getList();
  const TP4 = list.classes.find((c) => c.name === "4TP");
  const Ba = list.teachers.find((t) => t.name === "Ba");
  const B24 = list.rooms.find((r) => r.name === "B24");
  console.log("Plany lekcji na date:", t.getVersionInfo());
  if (TP4) displayTable(t.getTable(TP4.id));
  if (Ba) displayTable(t.getTable(Ba.id));
  if (B24) displayTable(t.getTable(B24.id));
})();
