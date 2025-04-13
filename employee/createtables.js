const Database = require('better-sqlite3');
const db = new Database('employee.db');

// Drop existing tables if they exist
db.prepare('DROP TABLE IF EXISTS EmployeeSalary').run();
db.prepare('DROP TABLE IF EXISTS Employee').run();

// Create Employee table
db.prepare(`
CREATE TABLE Employee (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT,
  SSN TEXT UNIQUE,
  DOB TEXT,
  Address TEXT,
  City TEXT,
  State TEXT,
  Zip TEXT,
  Phone TEXT,
  JoinDate TEXT,
  ExitDate TEXT
);`).run();

// Create EmployeeSalary table
db.prepare(`
CREATE TABLE EmployeeSalary (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  EmployeeID INTEGER,
  FromDate TEXT,
  ToDate TEXT,
  Title TEXT,
  Salary INTEGER,
  FOREIGN KEY(EmployeeID) REFERENCES Employee(ID)
);`).run();

console.log("✅ Tables created successfully in employee.db");
