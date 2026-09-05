import type { AttendanceRecord } from "./types";

export function downloadAttendanceCSV(
  records: AttendanceRecord[],
  filename: string,
) {
  if (records.length === 0) return;

  const headers = ["Student Name", "Roll Number", "Enrollment", "Subject", "Date", "Lecture", "Status"];
  const rows = records.map((r) => [
    `${r.student?.firstName ?? ""} ${r.student?.lastName ?? ""}`.trim(),
    String(r.student?.rollNumber ?? ""),
    r.student?.enrollmentNumber ?? "",
    r.subject?.name ?? "",
    r.attendanceDate,
    String(r.lectureNumber),
    r.status,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export function downloadAttendanceMatrixCSV(
  records: AttendanceRecord[],
  subjectName: string,
  fromDate: string,
  toDate: string,
) {
  if (records.length === 0) return;

  const sortedDates = [...new Set(records.map((r) => r.attendanceDate))].sort();

  const studentMap = new Map<number, { name: string; roll: string; enrollment: string; dates: Map<string, string> }>();

  records.forEach((r) => {
    const sid = r.student?.id;
    if (!sid) return;
    const entry = studentMap.get(sid) ?? {
      name: `${r.student?.firstName ?? ""} ${r.student?.lastName ?? ""}`.trim(),
      roll: String(r.student?.rollNumber ?? ""),
      enrollment: r.student?.enrollmentNumber ?? "",
      dates: new Map(),
    };
    const dateKey = r.attendanceDate;
    const existing = entry.dates.get(dateKey);
    const status = r.status === "PRESENT" ? "P" : "A";
    if (!existing) {
      entry.dates.set(dateKey, status);
    } else if (existing !== "P" && status === "P") {
      entry.dates.set(dateKey, "P");
    }
    studentMap.set(sid, entry);
  });

  const students = Array.from(studentMap.values()).sort((a, b) => {
    const ra = parseInt(a.roll) || 0;
    const rb = parseInt(b.roll) || 0;
    return ra - rb;
  });

  const dateHeaders = sortedDates.map((d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  });

  const headerRow = ["#", "Student Name", "Roll No", "Enrollment No", ...dateHeaders, "Present", "Total", "Percentage"];

  const dataRows = students.map((s, idx) => {
    const dateCells = sortedDates.map((d) => s.dates.get(d) ?? "-");
    const presentCount = dateCells.filter((c) => c === "P").length;
    const totalCount = dateCells.filter((c) => c === "P" || c === "A").length;
    const pct = totalCount > 0 ? `${((presentCount / totalCount) * 100).toFixed(1)}%` : "0%";
    return [String(idx + 1), s.name, s.roll, s.enrollment, ...dateCells, String(presentCount), String(totalCount), pct];
  });

  const csvContent = [headerRow, ...dataRows]
    .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const meta = `Subject: ${subjectName}\nPeriod: ${fromDate} to ${toDate}\nTotal Students: ${students.length}\nTotal Days: ${sortedDates.length}\n\n`;
  const finalCsv = meta + csvContent;

  const blob = new Blob([finalCsv], { type: "text/csv;charset=utf-8;" });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `attendance-${subjectName.replace(/\s+/g, "_")}-${fromDate}-to-${toDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
