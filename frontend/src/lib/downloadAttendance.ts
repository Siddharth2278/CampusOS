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
