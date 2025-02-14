import { useState } from "react";
import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";
import "./Employees.css";
export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");

  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("full_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredEmployees = employees
  .filter((employee: any) => {
    return (
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.job_title && employee.job_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  })
  .sort((a: any, b: any) => {
    const aField = String(a[sortField] || "").toLowerCase();
    const bField = String(b[sortField] || "").toLowerCase();

    if (aField < bField) return sortOrder === "asc" ? -1 : 1;
    if (aField > bField) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });


  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h1>Employee List</h1>

      <div>
        <input
          type="text"
          placeholder="Search by name or job title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <button onClick={() => handleSort("full_name")}>
          Sort by Name ({sortOrder === "asc" ? "Ascending" : "Descending"})
        </button>
        <button onClick={() => handleSort("salary")}>
          Sort by Salary ({sortOrder === "asc" ? "Ascending" : "Descending"})
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Job Title</th>
            <th>Salary</th>
            <th>Start Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map((employee: any) => (
            <tr key={employee.id}>
              <td>
                <a href={`/employees/${employee.id}`}>{employee.full_name}</a>
              </td>
              <td>{employee.job_title ? employee.job_title : "Not Provided"}</td>
              <td>{employee.salary ? employee.salary : "Not Provided"}</td>
              <td>{employee.start_date ? employee.start_date : "Not Provided"}</td>
              <td>
                <a href={`/employees/${employee.id}`}>View/Edit</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage * itemsPerPage >= filteredEmployees.length}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>

      <div>
        <hr />
        <ul>
          <li><a href="/employees/new">New Employee</a></li>
          <li><a href="/timesheets/">Timesheets</a></li>
        </ul>
      </div>
    </div>
  );
}