import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import "./Employees.css";
export async function loader({ params }: { params: { employeeId: string } }) {
  const db = await getDB();
  const employee = await db.get(
    "SELECT * FROM employees WHERE id = ?",
    [params.employeeId]
  );

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }

  return { employee };
}

export async function action({ request, params }: { request: Request, params: { employeeId: string } }) {
  const formData = new URLSearchParams(await request.text());
  const full_name = formData.get("full_name")!;
  const email = formData.get("email")!;
  const phone = formData.get("phone")!;
  const date_of_birth = formData.get("date_of_birth")!;
  const job_title = formData.get("job_title")!;
  const department = formData.get("department")!;
  const salary = formData.get("salary")!;
  const start_date = formData.get("start_date")!;
  const end_date = formData.get("end_date")!;

  const db = await getDB();
  await db.run(
    `UPDATE employees 
     SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ? 
     WHERE id = ?`,
    [full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, params.employeeId]
  );

  return redirect(`/employees`);
}

export default function EmployeePage() {
  const { employee } = useLoaderData();

  return (
    <div>
      <h1>Employee Details</h1>
      <Form method="post">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" defaultValue={employee.full_name} required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" defaultValue={employee.email} required />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input type="text" name="phone" id="phone" defaultValue={employee.phone} required />
        </div>
        <div>
          <label htmlFor="date_of_birth">Date of Birth</label>
          <input type="date" name="date_of_birth" id="date_of_birth" defaultValue={employee.date_of_birth} required />
        </div>
        <div>
          <label htmlFor="job_title">Job Title</label>
          <input type="text" name="job_title" id="job_title" defaultValue={employee.job_title} required />
        </div>
        <div>
          <label htmlFor="department">Department</label>
          <input type="text" name="department" id="department" defaultValue={employee.department} required />
        </div>
        <div>
          <label htmlFor="salary">Salary</label>
          <input type="number" name="salary" id="salary" defaultValue={employee.salary} required />
        </div>
        <div>
          <label htmlFor="start_date">Start Date</label>
          <input type="date" name="start_date" id="start_date" defaultValue={employee.start_date} required />
        </div>
        <div>
          <label htmlFor="end_date">End Date</label>
          <input type="date" name="end_date" id="end_date" defaultValue={employee.end_date} required />
        </div>
        <button type="submit">Update Employee</button>
      </Form>

      <div>
        <hr />
        <ul>
          <li><a href="/employees">Employees</a></li>
          <li><a href={`/timesheets/${employee.id}`}>Employee Timesheet</a></li>
        </ul>
      </div>
    </div>
  );
}
