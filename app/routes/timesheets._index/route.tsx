import { useLoaderData } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css"; 
import "./TimesheetsPage.css";

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id 
     FROM timesheets 
     JOIN employees ON timesheets.employee_id = employees.id`
  );
  return { timesheetsAndEmployees };
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData() as { timesheetsAndEmployees: any[] };
  const [view, setView] = useState("table");
  const [searchTerm, setSearchTerm] = useState(""); 

  const formatDateTimeForCalendar = (time: string) => {
    if (!time) return "";
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day} ${hours}:${minutes}`; 
  };

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: timesheetsAndEmployees.map((timesheet: any) => ({
      id: String(timesheet.id),
      title: `Timesheet: ${timesheet.full_name}`,
      start: formatDateTimeForCalendar(timesheet.start_time),
      end: formatDateTimeForCalendar(timesheet.end_time), 
    })),
    plugins: [eventsService],
  });

  const filteredTimesheets = timesheetsAndEmployees.filter((timesheet: any) =>
    timesheet.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="timesheets-container">
      <div className="view-toggle">
        <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>
          Table View
        </button>
        <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>
          Calendar View
        </button>
      </div>
      {view === "table" ? (
        <div className="table-view">
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <table className="timesheet-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((timesheet: any) => (
                <tr key={timesheet.id}>
                  <td><a href={`/timesheets/${timesheet.id}`} className="edit-link">
                      
                    {timesheet.full_name}</a></td>
                  <td>{formatDateTimeForCalendar(timesheet.start_time)}</td> 
                  <td>{formatDateTimeForCalendar(timesheet.end_time)}</td> 
                  <td>
                    <a href={`/timesheets/${timesheet.id}`} className="edit-link">
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sx-react-calendar-wrapper">
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      )}

      <hr />
      <ul className="navigation-links">
        <li>
          <a href="/timesheets/new">New Timesheet</a>
        </li>
        <li>
          <a href="/employees">Employees</a>
        </li>
      </ul>
    </div>
  );
}
