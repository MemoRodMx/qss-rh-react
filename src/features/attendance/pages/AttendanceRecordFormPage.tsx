import { useParams } from "react-router-dom";
import { AttendanceFormShell } from "../components/AttendanceFormShell";

export function AttendanceRecordFormPage() {
  const { id } = useParams<{ id: string }>();

  if (id) {
    return <AttendanceFormShell mode="edit" recordId={id} />;
  }

  return <AttendanceFormShell mode="create" />;
}
