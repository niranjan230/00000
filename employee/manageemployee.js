const Database = require('better-sqlite3');
const readline = require('readline');
const db = new Database('employee.db'); // Update to match the correct path of your database file

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : null;

// Helper: Get current salary of employee
function getCurrentSalary(employeeID) {
  const salary = db.prepare(`
    SELECT Title, Salary FROM EmployeeSalary
    WHERE EmployeeID = ? AND ToDate IS NULL
  `).get(employeeID);
  return salary || { Title: 'N/A', Salary: 'N/A' };
}

// Command: node ManageEmployee.js -list
if (command === '-list' && !args[1]) {
  const employees = db.prepare('SELECT * FROM Employee').all();

  for (const emp of employees) {
    const salary = getCurrentSalary(emp.ID);
    console.log(`${emp.Name} | ${salary.Title} | ₹${salary.Salary}`);
  }
}

// Command: node ManageEmployee.js -list "developer" or name
else if (command === '-list' && args[1]) {
  const term = args[1].toLowerCase();

  // First search by title
  const employeesByTitle = db.prepare(`
    SELECT e.*, s.Title, s.Salary FROM Employee e
    JOIN EmployeeSalary s ON e.ID = s.EmployeeID
    WHERE s.ToDate IS NULL AND LOWER(s.Title) LIKE ?
  `).all(`%${term}%`);

  if (employeesByTitle.length > 0) {
    for (const emp of employeesByTitle) {
      console.log(`${emp.Name} | ${emp.Title} | ₹${emp.Salary}`);
    }
  } else {
    // Search by name
    const employeesByName = db.prepare(`
      SELECT * FROM Employee WHERE LOWER(Name) LIKE ?
    `).all(`%${term}%`);

    for (const emp of employeesByName) {
      const salary = getCurrentSalary(emp.ID);
      console.log(`${emp.Name} | ${salary.Title} | ₹${salary.Salary}`);
    }
  }
}

// Command: node ManageEmployee.js -titles
else if (command === '-titles') {
  const titles = db.prepare(`
    SELECT Title, MIN(Salary) AS MinSalary, MAX(Salary) AS MaxSalary
    FROM EmployeeSalary
    GROUP BY Title
  `).all();

  for (const t of titles) {
    console.log(`${t.Title} | Min: ₹${t.MinSalary} | Max: ₹${t.MaxSalary}`);
  }
}

// Command: node ManageEmployee.js -add
else if (command === '-add') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const questions = [
    'Name: ',
    'SSN: ',
    'DOB (YYYY-MM-DD): ',
    'Address: ',
    'City: ',
    'State: ',
    'Zip: ',
    'Phone: ',
    'Join Date (YYYY-MM-DD): ',
    'Title: ',
    'Salary: '
  ];

  const answers = [];

  function askQuestion(index) {
    if (index === questions.length) {
      rl.close();

      const [name, ssn, dob, addr, city, state, zip, phone, joinDate, title, salary] = answers;

      const emp = db.prepare(`
        INSERT INTO Employee (Name, SSN, DOB, Address, City, State, Zip, Phone, JoinDate, ExitDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
      `).run(name, ssn, dob, addr, city, state, zip, phone, joinDate);

      db.prepare(`
        INSERT INTO EmployeeSalary (EmployeeID, FromDate, ToDate, Title, Salary)
        VALUES (?, ?, NULL, ?, ?)
      `).run(emp.lastInsertRowid, joinDate, title, parseInt(salary));

      console.log(`✅ Employee "${name}" added with title "${title}" and salary ₹${salary}`);
      return;
    }

    rl.question(questions[index], (ans) => {
      answers.push(ans);
      askQuestion(index + 1);
    });
  }

  askQuestion(0);
}

// Command: node ManageEmployee.js -update
else if (command === '-update' && args[1]) {
  const empId = args[1];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Fetch the employee to update
  const emp = db.prepare('SELECT * FROM Employee WHERE ID = ?').get(empId);

  if (!emp) {
    console.log(`❌ Employee with ID ${empId} not found.`);
    rl.close();
    return;
  }

  console.log(`Updating details for employee ${emp.Name} (ID: ${emp.ID})`);

  const questions = [
    `New Name (current: ${emp.Name}): `,
    `New SSN (current: ${emp.SSN}): `,
    `New Address (current: ${emp.Address}): `,
    `New Phone (current: ${emp.Phone}): `,
    `New Title (current: ${emp.Title}): `,
    `New Salary (current: ₹${getCurrentSalary(emp.ID).Salary}): `
  ];

  const answers = [];

  function askQuestion(index) {
    if (index === questions.length) {
      rl.close();

      const [name, ssn, address, phone, title, salary] = answers;

      db.prepare(`
        UPDATE Employee 
        SET Name = ?, SSN = ?, Address = ?, Phone = ? 
        WHERE ID = ?
      `).run(name || emp.Name, ssn || emp.SSN, address || emp.Address, phone || emp.Phone, empId);

      db.prepare(`
        UPDATE EmployeeSalary 
        SET Title = ?, Salary = ? 
        WHERE EmployeeID = ? AND ToDate IS NULL
      `).run(title || emp.Title, salary || getCurrentSalary(emp.ID).Salary, empId);

      console.log(`✅ Employee ${emp.Name} updated successfully.`);

      // Log the updated employee details
      const updatedEmployee = db.prepare('SELECT * FROM Employee WHERE ID = ?').get(empId);
      console.log("Updated employee:", updatedEmployee);
      return;
    }

    rl.question(questions[index], (ans) => {
      answers.push(ans);
      askQuestion(index + 1);
    });
  }

  askQuestion(0);
}

// Command: node ManageEmployee.js -delete
else if (command === '-delete' && args[1]) {
  const empId = args[1];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Fetch the employee to delete
  const emp = db.prepare('SELECT * FROM Employee WHERE ID = ?').get(empId);

  if (!emp) {
    console.log(`❌ Employee with ID ${empId} not found.`);
    rl.close();
    return;
  }

  console.log(`Are you sure you want to delete employee ${emp.Name} (ID: ${emp.ID})? (y/n)`);
  rl.question('Confirm: ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      db.prepare('DELETE FROM EmployeeSalary WHERE EmployeeID = ?').run(empId);
      db.prepare('DELETE FROM Employee WHERE ID = ?').run(empId);
      console.log(`✅ Employee ${emp.Name} deleted.`);
    } else {
      console.log('❌ Employee not deleted.');
    }
    rl.close();
  });
}

// Command: node ManageEmployee.js
// Show full employee DB info
else if (!command) {
  const employees = db.prepare(`
    SELECT e.ID, e.Name, e.SSN, e.DOB, e.Address, e.City, e.State, e.Zip, e.Phone, e.JoinDate, e.ExitDate,
           s.Title, s.Salary
    FROM Employee e
    LEFT JOIN EmployeeSalary s ON e.ID = s.EmployeeID AND s.ToDate IS NULL
  `).all();

  for (const emp of employees) {
    console.log(`
ID: ${emp.ID}
Name: ${emp.Name}
SSN: ${emp.SSN}
DOB: ${emp.DOB}
Address: ${emp.Address}, ${emp.City}, ${emp.State}, ${emp.Zip}
Phone: ${emp.Phone}
Join Date: ${emp.JoinDate}
Exit Date: ${emp.ExitDate || 'Still Working'}
Title: ${emp.Title || 'N/A'}
Salary: ₹${emp.Salary || 'N/A'}
------------------------------`);
  }
}

// Invalid command
else {
  console.log(` Invalid command. `);
}
