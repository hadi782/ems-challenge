import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import "./Employee.css";
const minimumWage = 200;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const date_of_birth = formData.get("date_of_birth");
  const job_title = formData.get("job_title");
  const department = formData.get("department");
  const salary = formData.get("salary");
  const start_date = formData.get("start_date");
  const end_date = formData.get("end_date");

  if (!salary || isNaN(Number(salary)) || Number(salary) < minimumWage) {
    return { error: "Please provide a valid salary (minimum wage is 200$)." };
  }

  if (!full_name || !email || !phone || !job_title || !salary || !start_date || !end_date || !date_of_birth) {
    return { error: "Please fill in all required fields." };
  }

  const currentDate = new Date();
  const birthDate = new Date(date_of_birth.toString());
  const age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = currentDate.getMonth() - birthDate.getMonth();

  if (age < 18 || (age === 18 && monthDifference < 0)) {
    return { error: "Employee must be at least 18 years old." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.toString())) {
    return { error: "Please provide a valid email address." };
  }

  const phoneRegex = /^\d+$/;
  if (!phone || !phoneRegex.test(phone.toString())) {
    return { error: "Please provide a valid phone number." };
  }

  if (!salary || isNaN(Number(salary)) || Number(salary) <= 0) {
    return { error: "Please provide a valid salary." };
  }

  if (start_date && end_date) {
    const startDateObj = new Date(start_date.toString());
    const endDateObj = new Date(end_date.toString());

    if (startDateObj > endDateObj) {
      return { error: "Start date cannot be later than end date." };
    }
  }

  try {
    const db = await getDB();
    await db.run(
      `INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone,
        date_of_birth,
        job_title,
        department,
        salary,
        start_date,
        end_date,
      ]
    );
  } catch (error) {
    console.error("Error inserting into database:", error);
    return { error: "There was an error saving the employee to the database." };
  }

  return redirect("/employees");
};

export default function NewEmployeePage() {
  return (
    <div>
      <h1>Create New Employee</h1>
      <Form method="post">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input type="text" name="phone" id="phone" required />
        </div>
        <div>
          <label htmlFor="date_of_birth">Date of Birth</label>
          <input type="date" name="date_of_birth" id="date_of_birth" required />
        </div>
        <div>
          <label htmlFor="job_title">Job Title</label>
          <input type="text" name="job_title" id="job_title" required />
        </div>
        <div>
          <label htmlFor="department">Department</label>
          <input type="text" name="department" id="department" required />
        </div>
        <div>
          <label htmlFor="salary">Salary</label>
          <input type="number" name="salary" id="salary" required />
        </div>
        <div>
          <label htmlFor="start_date">Start Date</label>
          <input type="date" name="start_date" id="start_date" required />
        </div>
        <div>
          <label htmlFor="end_date">End Date</label>
          <input type="date" name="end_date" id="end_date" required />
        </div>
        <button type="submit">Create Employee</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/timesheets">Timesheets</a></li>
      </ul>
    </div>
  );
}

