import { Timetable } from "../lib";

(async () => {
  const res = await fetch(
    "https://zstio-elektronika.pl/nowy-plan/Dobryplan.html"
  );
  const html = await res.text();
  const t = new Timetable(html);
  const list = t.getList();
  console.log(t);
  const table = t.getTable(list.rooms[2].id);
  console.log(table.getTitle());
  console.log(table.getDayNames());
  console.log(table.getHours());
  const days = table.getDays();
  const dayNames = table.getDayNames();
  const hours = table.getHours();

  // AI SHIT (ale fajnie wyglada) TABLE
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
})();
