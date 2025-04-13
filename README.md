# Employee Management System

A command-line based Employee Management System built with Node.js and SQLite3. This system allows you to manage employee records, including their personal information, job titles, and salaries.

## Features

- Add new employees with detailed information
- Update existing employee records
- Delete employee records
- List all employees with their current positions and salaries
- Search employees by name or job title
- View salary ranges for different job titles

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/niranjan230/11111.git
cd employee
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
node createtables.js
```

## Usage

The system can be operated through the command line using various commands:

### List Employees
- List all employees:
```bash
node manageemployee.js -list
```

- Search employees by title or name:
```bash
node manageemployee.js -list "developer"
```

### View Job Titles
- View all job titles with salary ranges:
```bash
node manageemployee.js -titles
```

### Add New Employee
```bash
node manageemployee.js -add
```
Follow the prompts to enter employee details.

### Update Employee
```bash
node manageemployee.js -update [employee_id]
```
Follow the prompts to update employee information.

### Delete Employee
```bash
node manageemployee.js -delete [employee_id]
```

### View Full Database
```bash
node manageemployee.js
```

## Database Schema

The system uses two main tables:

1. `Employee` - Stores basic employee information:
   - ID (Primary Key)
   - Name
   - SSN
   - DOB
   - Address
   - City
   - State
   - Zip
   - Phone
   - JoinDate
   - ExitDate

2. `EmployeeSalary` - Stores salary history:
   - EmployeeID (Foreign Key)
   - FromDate
   - ToDate
   - Title
   - Salary

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License. 