import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '70565233',//it is a random number and I'm not sure who it belongs to, so please don't use it
    date_of_birth: '1998-05-15',
    job_title: 'Software Engineer',
    department: 'Engineering',
    salary: 3000,
    start_date: '2025-05-10',
    end_date: '2026-03-20', 
  },
  {
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '56195144',//please don't use
    date_of_birth: '2000-11-23',
    job_title: 'Product Manager',
    department: 'Product',
    salary: 5910,
    start_date: '2025-03-11',
    end_date: '2028-01-11', 
  },
  {
    full_name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '01511503',//please don't use it
    date_of_birth: '2006-08-30',
    job_title: 'HR',
    department: 'HR',
    salary: 5591,
    start_date: '2023-02-16',
    end_date: '2026-02-16', 
  },
];
const timesheets = [
  {
    employee_id: 1,
    start_time: "2025-02-10 08:00",  
    end_time: "2025-02-10 17:00",    
    summary: "Worked on project A and attended team meetings.",
  },
  {
    employee_id: 2,
    start_time: "2025-02-11 12:00",  
    end_time: "2025-02-11 17:00",    
    summary: "Completed report analysis and client communications.",
  },
  {
    employee_id: 3,
    start_time: "2025-02-12 07:00",  
    end_time: "2025-02-12 16:00",    
    summary: "Developed new feature for internal dashboard.",
  },
];


const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0]).map(() => '?').join(', ');

  const insertStmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);

  data.forEach(row => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData('employees', employees);
  insertData('timesheets', timesheets);
});

db.close(err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database seeded successfully.');
  }
});

