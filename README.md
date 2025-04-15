IIJS Contact Directory

This is a web application for managing contacts with organization filtering and export capabilities.

URL: iijs-directory.app

Tech Stack
Frontend:

React + TypeScript
Vite
TailwindCSS + ShadcnUI
SWR for data fetching

Backend:

Flask
PostgreSQL
SQLAlchemy

Features

Contact management (add, view, edit, delete)
Organization and organization type management
Search and filtering capabilities
Export to Excel

Deployment
The application is configured for deployment with GitHub Actions:

Frontend deploys to AWS S3,
Backend deploys to EC2

See the workflow files in .github/workflows/ for details.
