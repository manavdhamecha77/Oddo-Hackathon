# CSV Bulk User Upload Guide

## Overview
Admins can now upload a CSV file to create multiple users at once. Each user will automatically receive their credentials via email.

## CSV Format

Your CSV file must contain exactly 3 columns:
- `name` - The user's full name
- `email` - The user's email address
- `role` - The user's role (project_manager, team_member, or sales_finance)

### Example CSV:
```csv
name,email,role
John Doe,john.doe@example.com,project_manager
Jane Smith,jane.smith@example.com,team_member
Bob Johnson,bob.johnson@example.com,sales_finance
```

### Valid Roles:
- `project_manager` (or "project manager")
- `team_member` (or "team member")
- `sales_finance` (or "sales finance")

## How It Works

1. **Upload CSV**: Click the "Upload Users CSV" button in the admin panel
2. **Automatic Processing**: 
   - Each user is created with a randomly generated secure password
   - Users are assigned the role specified in the CSV
   - Credentials are automatically emailed to each user
3. **Results**: View a summary showing successful and failed user creations

## What Users Receive

Each successfully created user receives an email containing:
- Company ID
- Their email address
- Temporary password
- Their role
- Login link

## Notes

- Duplicate emails will be skipped with an error message
- Invalid roles will be skipped with an error message
- Empty lines in the CSV are ignored
- All users are created in the admin's company
- The CSV file must have headers in the first row
- Role names are case-insensitive and can use underscores or spaces

## Sample File

A sample CSV file (`sample-users.csv`) is included in the project root for reference.
