# AttendEase — Attendance Management System

A beginner-friendly attendance management web app built with **HTML, CSS, and vanilla JavaScript**. It is designed as a first portfolio project and runs directly in a browser—no installation, database, or API key needed.

## Features

- Add and remove students from a class roster
- Prevent duplicate roll numbers
- Mark students as Present, Absent, Late, or Not marked
- Select a date and keep a separate attendance record for each date
- Dashboard cards for student count, present, absent, and attendance rate
- Search students by name or roll number
- Filter the table by attendance status
- Mark everyone present with one click
- Export the selected day's attendance to a CSV file
- Automatically save data in browser local storage
- Responsive layout for desktop and mobile

## Run locally

1. Download or clone this repository.
2. Open `index.html` in your browser.
3. Add students in the **Student roster** section.
4. Select the date and mark attendance.
5. Click **Save attendance** or use **Export CSV** to download a report.

No build tools or package installation are required.

## Publish with GitHub Pages

1. Create a public GitHub repository named `attendance-management-system`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages** in your repository.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then click **Save**.
6. Wait for GitHub Pages to publish the site. The Pages section will show your website URL.

## Project structure

```text
attendance-management-system/
├── index.html   # Page structure
├── style.css    # Layout, colors, responsive styling
├── script.js    # Student records, attendance, filtering, CSV export
└── README.md    # Project documentation
```

## How the app works

- **HTML** creates the dashboard, form, student table, and controls.
- **CSS** styles the interface and adapts it for smaller screens.
- **JavaScript** handles student management, attendance statuses, search/filtering, and CSV generation.
- **localStorage** saves the data in the current browser on the current device.

## Important limitations

This is a **front-end learning project**, not a multi-user production system. Records stay in the browser that created them. They are not automatically shared between teachers, devices, or browsers. Clearing browser data can remove saved records, so export CSV backups. A production version would need authentication, a server, and a shared database.

## Suggested future improvements

- Login for teachers and administrators
- Backend API and shared database
- Monthly attendance reports and charts
- Minimum attendance percentage alerts
- Import students from CSV
- Separate classes and subjects

## License

This project is available under the MIT License. Add a `LICENSE` file if you choose to distribute it under that license.
