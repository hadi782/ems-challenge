import { Form, useLoaderData, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import "./TimesheetsPage.css";
function formatDateTimeLocal(dateStr: string): string {
  if (!dateStr) return "";
  const dt = new Date(dateStr);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  const hours = String(dt.getHours()).padStart(2, "0");
  const minutes = String(dt.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export async function loader({ params }: { params: any }) {
  const db = await getDB();
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id = ?", params.timesheetId);
  if (!timesheet) {
    throw new Response("Not Found", { status: 404 });
  }
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { timesheet, employees };
}

export async function action({ request, params }: { request: Request; params: any }) {
  const formData = await request.formData();
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const employee_id = formData.get("employee_id") as string;
  const summary = formData.get("summary") as string;

  if (new Date(start_time) >= new Date(end_time)) {
    return { error: "Start time must be before end time." };
  }

  const db = await getDB();
  await db.run(
    "UPDATE timesheets SET start_time = ?, end_time = ?, employee_id = ?, summary = ? WHERE id = ?",
    start_time,
    end_time,
    employee_id,
    summary,
    params.timesheetId
  );
  return redirect("/timesheets");
}

export default function TimesheetPage() {
  const { timesheet, employees } = useLoaderData() as { timesheet: any; employees: any[] };

  const formattedStartTime = formatDateTimeLocal(timesheet.start_time);
  const formattedEndTime = formatDateTimeLocal(timesheet.end_time);

  return (
    <div className="timesheet-form-container">
      <h2>Edit Timesheet #{timesheet.id}</h2>
      <Form method="post" className="timesheet-form">
        <div className="form-group">
          <label htmlFor="start_time">Start Time:</label>
          <input
            id="start_time"
            name="start_time"
            type="datetime-local"
            defaultValue={formattedStartTime}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="end_time">End Time:</label>
          <input
            id="end_time"
            name="end_time"
            type="datetime-local"
            defaultValue={formattedEndTime}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="employee_id">Employee:</label>
          <select
            id="employee_id"
            name="employee_id"
            defaultValue={timesheet.employee_id}
            required
            className="form-input"
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="summary">Summary:</label>
          <textarea
            id="summary"
            name="summary"
            defaultValue={timesheet.summary || ""}
            className="form-textarea"
          ></textarea>
        </div>
        <button type="submit" className="submit-button">Update Timesheet</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/timesheets">Timesheets</a></li>
        <li><a href={`/employees/${timesheet.employee_id}`}>Timesheet's Employee</a></li>
      </ul>
    </div>
  );
}
