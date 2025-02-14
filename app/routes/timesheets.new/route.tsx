import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import "./TimesheetsPage.css";

export async function loader() {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { employees };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id"); 
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const summary = formData.get("summary"); 
  if (new Date(start_time) >= new Date(end_time)) {
    return { error: "Start time must be before end time." };
  }

  const db = await getDB();
  await db.run(
    'INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)',
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets");
}

export default function NewTimesheetPage() {
  const { employees } = useLoaderData(); 
  const error = useLoaderData()?.error; 

  return (
    <div className="timesheet-form-container">
      <h2>Create New Timesheet</h2>

      {error && <div className="error-message">{error}</div>}

      <Form method="post" className="timesheet-form">
        <div className="form-group">
          <label htmlFor="employee_id">Employee</label>
          <select
            name="employee_id"
            id="employee_id"
            required
            className="form-input"
          >
            <option value="">Select Employee</option>
            {employees.map((employee: { id: string; full_name: string }) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="start_time">Start Time</label>
          <input
            type="datetime-local"
            name="start_time"
            id="start_time"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_time">End Time</label>
          <input
            type="datetime-local"
            name="end_time"
            id="end_time"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea
            name="summary"
            id="summary"
            placeholder="Summary for the timesheet..."
            required
            className="form-textarea"
          ></textarea>
        </div>

        <button className="submit-button" type="submit">Create Timesheet</button>
      </Form>

      <hr />
      <ul>
        <li><a href="/timesheets">Timesheets</a></li>
        <li><a href="/employees">Employees</a></li>
      </ul>
    </div>
  );
}
