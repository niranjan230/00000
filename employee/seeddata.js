const { faker } = require('@faker-js/faker');
const Database = require('better-sqlite3');
const db = new Database('./employee.db');

// Create the tables if they don't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS Employee (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT,
    SSN TEXT,
    DOB TEXT,
    Address TEXT,
    City TEXT,
    State TEXT,
    Zip TEXT,
    Phone TEXT,
    JoinDate TEXT,
    ExitDate TEXT
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS EmployeeSalary (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    EmployeeID INTEGER,
    FromDate TEXT,
    ToDate TEXT,
    Title TEXT,
    Salary INTEGER,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(ID)
  );
`).run();

// Seed with 100 employees
for (let i = 0; i < 100; i++) {
  const name = faker.person.fullName();
  const ssn = `${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(4)}`;  // Simulate SSN
  const dob = faker.date.birthdate();
  const address = faker.address.streetAddress();
  const city = faker.address.city();
  const state = faker.address.state();
  const zip = faker.address.zipCode();
  const phone = faker.phone.number();
  
  const joinDate = faker.date.past(10);
  const exitDate = faker.date.future(5); // Optional exit date

  const insertEmployee = db.prepare(`
    INSERT INTO Employee (Name, SSN, DOB, Address, City, State, Zip, Phone, JoinDate, ExitDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = insertEmployee.run(
    name, ssn, dob.toISOString().split('T')[0], address, city, state, zip, phone, joinDate.toISOString().split('T')[0], exitDate.toISOString().split('T')[0]
  );

  const employeeID = info.lastInsertRowid;

  const title = faker.name.jobTitle();
  const salary = Math.floor(Math.random() * (100000 - 30000 + 1)) + 30000;  // Random salary between ₹30,000 and ₹100,000
  const fromDate = faker.date.past(2);
  
  // Insert initial salary record for the employee
  const insertSalary = db.prepare(`
    INSERT INTO EmployeeSalary (EmployeeID, FromDate, Title, Salary)
    VALUES (?, ?, ?, ?)
  `);
  insertSalary.run(employeeID, fromDate.toISOString().split('T')[0], title, salary);

  // Optionally, simulate salary change (e.g., after a promotion)
  const title2 = faker.name.jobTitle();
  const salary2 = salary + Math.floor(Math.random() * 20000);  // Increase by up to ₹20,000 for promotion
  const fromDate2 = faker.date.past(1);  // New promotion date
  const toDate2 = faker.date.future(2); // New salary ends in 2 years

  const insertSalary2 = db.prepare(`
    INSERT INTO EmployeeSalary (EmployeeID, FromDate, ToDate, Title, Salary)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSalary2.run(employeeID, fromDate2.toISOString().split('T')[0], toDate2.toISOString().split('T')[0], title2, salary2);
}

console.log('✅ 100 Employees and Salaries added to the database.');
