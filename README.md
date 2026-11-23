Playwright Two-Factor Authentication Testing
Project Overview

This project contains automated and manual testing for the Two-Factor Authentication (2FA) functionality of The Internet website.

Application: https://the-internet.herokuapp.com/two_factor

Testing Framework: Playwright
Programming Language: TypeScript
Browsers: Chromium, Firefox and WebKit

Project Contents

The ZIP file contains the following:

text
Playwright-automate/
│
├── tests/
│   └── two-factor.spec.ts
│
├── screenshots/
│   └── (Testing evidence)
│
├── playwright.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md

Prerequisites

Before running the tests, install:

Node.js
npm
Installation and Setup
Step 1: Extract the ZIP file

Extract the submitted ZIP file to your preferred location.

Step 2: Open the project

Open the extracted Playwright-automate folder in Visual Studio Code.

Step 3: Open the terminal

In Visual Studio Code, select:

Terminal → New Terminal

Step 4: Install project dependencies

Run:

bash
npm install

Step 5: Install Playwright browsers

Run:

bash
npx playwright install

Running the Automated Tests
Run all default tests
bash
npx playwright test

Run tests with the browser visible
bash
npx playwright test --headed

Run tests in individual browsers

Chromium:

bash
npx playwright test --project=chromium


Firefox:

bash
npx playwright test --project=firefox


WebKit:

bash
npx playwright test --project=webkit

Run a specific test
bash
npx playwright test -g "Verify Username and Password fields"

OTP Expiry Test

The three-minute OTP expiry test is excluded from the default test execution to keep the main test suite fast.

To execute this test:

Open tests/two-factor.spec.ts.
Locate the OTP expiry test.
Temporarily change test.skip() to test().
Run:
bash
npx playwright test -g "Verify OTP expires"

After testing, restore test.skip() to keep it excluded from normal execution.

The expiry test waits 180 seconds before submitting the previously retrieved OTP.

Test Reports

To view the Playwright HTML report, run:

bash
npx playwright show-report


The report includes test results and execution details.

Screenshots

Screenshots are configured to be captured automatically when tests fail.

The configuration is:

typescript
use: {
  baseURL: 'https://the-internet.herokuapp.com',
  screenshot: 'only-on-failure',
}

Test Scenarios

The project covers the following scenarios:

Verify Username and Password fields exist and have labels.
Verify invalid credentials are rejected.
Complete successful login using valid credentials and a dynamically retrieved OTP.
Verify incorrect OTP submissions are rejected.
Verify the secure area cannot be accessed without authentication.
Verify logout ends the authenticated session.
Verify OTP expiry after three minutes (separate test).
Test Credentials

Username: tomsmith

Password: SuperSecretPassword!

The one-time authentication code is retrieved dynamically from the webpage during test execution rather than being hard-coded.

Important Notes
Each test is designed to run independently.
The default test suite excludes the three-minute OTP expiry test.
The project is configured for Chromium, Firefox and WebKit.
Screenshots are captured automatically when tests fail.
Internet access is required to access the application.

End of README