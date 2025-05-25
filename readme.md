# QA Tester Pre-Interview Technical Assessment Documentation

## Project Overview

For this assessment, I selected a GitHub project involving a comprehensive web application with frontend and backend components. The application features user authentication and task management, using a MongoDB database. It appropriately demonstrates the complexity for assessing QA skills.

## Setup Instructions

### Prerequisites

- Node.js
- MongoDB
- Jest and Cypress installed globally

### Backend Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/younesjarhbou/MERN-Testing
   cd MERN-Testing/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**: Create a `.env` file in the `backend` directory with the following content:
   ```
   MONGO_URI=mongodb+srv://username:Password@cluster0.******************
   GMAIL_USERNAME=username
   GMAIL_PASSWORD=paassword
   PORT=8000
   JWT_SECRET=thisisasecretkey
   ```

4. **Run the Backend Server**:
   ```bash
   npm start
   ```

5. **Running Automated Tests (Backend)**:
   ```bash
   npm test
   ```

### Frontend Setup

1. **Navigate to Frontend Directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables for Testing**: Create a `.env.test` file with the following content:
   ```
   MONGO_URI=mongodb+srv://younesdev97:glvdX1KKJm3ahgzz@cluster0.4phcyzr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

4. **Start the Frontend Application**:
   ```bash
   npm start
   ```

5. **Running End-to-End Tests (Frontend)**:
   - Ensure the backend is running.
   - Run Cypress tests:
     ```bash
     npx cypress open
     ```
   - Select the desired test from the Cypress interface.

## Test Plan

### 1. Test Scope and Objectives

- **Objective:** Validate the application's functionality, ensuring seamless user experience during registration, login, and task management.
- **Scope:** Key functional areas: user authentication, task operations (create, retrieve, update, delete).

### 2. Test Approach

- **Manual Testing:** Validate UI elements, workflows, error messages.
- **Automated Testing:** Use Jest for backend testing and Cypress for end-to-end frontend testing.

### 3. Test Environment Requirements

- Node.js installed on the system.
- MongoDB instance running or MongoDB Atlas configured.
- Necessary environment variables set in `.env` files for both backend and frontend.

### 4. Test Cases for Critical User Flows

#### User Registration

- **Positive Case:** Successful registration with valid credentials.
- **Negative Case:** Error when registering with an existing email or weak password.

#### User Login

- **Positive Case:** Successful login with valid credentials.
- **Negative Case:** Error for invalid credentials or empty fields.

#### Task Management

- **Add Task:** Verify task addition for authenticated users.
- **View Tasks:** Retrieve tasks specific to logged-in users.
- **Delete Task:** Confirm task deletion and ensure it no longer appears in the list.
- **Complete Task:** Mark as complete and verify status persistence.

### 5. Risk Assessment and Prioritization of Tests

- **High Priority:** Authentication flows (registration/login) are critical entry points.
- **Medium Priority:** Task CRUD operations are essential post-login.
- **Low Priority:** UX validations and non-critical error messaging.

### 6. Defect Reporting Procedure

- Use descriptive and consistent titles.
- Detail reproduction steps clearly.
- Assign severity levels: Critical, Major, Minor based on impact.
- Document using Azure DevOps, Jira, or similar platforms.

## Bug Documentation

### Bug Reports

#### Bug Title: Registration Fails with Existing Email

- **Severity:** Major
- **Steps to Reproduce:** Attempt registration with an already used email.
- **Expected Behavior:** Display the error message "User already exists".
- **Actual Outcome:** No error message displayed.
- **Suggested Fix:** Implement a backend check for existing emails prior to creating new accounts.

#### Bug Title: Inconsistent Task Completion Status

- **Severity:** Minor
- **Steps to Reproduce:** Complete a task and refresh the page.
- **Expected Behavior:** Task should remain marked as completed.
- **Actual Outcome:** Task shows as incomplete post-refresh.
- **Suggested Fix:** Persist completion status changes in the database.

#### Bug Title: Weak Password Not Handled

- **Severity:** Major
- **Steps to Reproduce:** Register using a simple/weak password like "123".
- **Expected Behavior:** Show error "Please enter a strong password".
- **Actual Outcome:** Registration proceeds without warning.
- **Suggested Fix:** Add backend validation to enforce password strength requirements.

## Test Automation

### Backend Automated Tests

Implemented in Jest focusing on:

- Task API endpoints: Addition, retrieval, and deletion.
- User API endpoints: Registration and login validations.

### Frontend Automated Tests

Utilized Cypress covering end-to-end scenarios such as:

- User registration, login, logout processes.
- Task creation, marking as complete, and deletions.

### Repository Details

- The GitHub repository includes a `README.md` file containing setup instructions for local test execution.
- Clarifications on assumptions, configurations, and modifications made during implementation are noted.

## Conclusion

This document showcases technical expertise through detailed planning, automated testing, and thorough documentation covering all aspects of the application's workflow. The testing efforts and bug reports provide valuable insights into the application's stability and enhancement opportunities.