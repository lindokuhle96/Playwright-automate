# A - Test Plan: Two-Factor Authentication

## 1. Test plan

### Objective
Verify that the two-step login protects the secure area by requiring valid username/password credentials followed by a valid, current, six-digit one-time code. Confirm validation, error handling, code expiry and single-use behaviour, session protection, and logout.

### Scope
**In scope**
- Login page availability and labelled controls.
- Username and password validation, including empty and invalid credentials.
- Transition from the first step to the one-time-code step.
- One-time-code masking, length and numeric validation.
- Incorrect, expired and previously used codes.
- Successful access to the secure area.
- Protection against direct access to the secure-area URL.
- Logout and session termination.

**Out of scope**
- Load, stress, brute-force and denial-of-service testing.
- Testing delivery by SMS, email or authenticator application; this practice site displays the code on the page.
- Testing production identity providers or real customer accounts.

### Environment and test data
- Application: https://the-internet.herokuapp.com/two_factor
- Browser: Playwright-supported Chromium (also run against Firefox and WebKit if time permits).
- Automation: Playwright Test; use isolated browser contexts for independent tests.
- Username: `tomsmith`
- Password: `SuperSecretPassword!`
- OTP: Read the displayed six-digit code from the page at runtime. Do not hard-code a code that may change.
- Use a clean session for each independent test. Keep repeated invalid attempts to no more than 10 against this shared public site.

### Risks and considerations
- OTPs are time-sensitive. Test execution delays, slow CI workers or clock differences may cause a valid code to expire during a test.
- A code may be regenerated when the flow is restarted. Read the current code immediately before submitting it.
- Expiry and single-use checks require controlled timing and a fresh code. Avoid relying on long fixed sleeps; use timestamps and bounded waits.
- The practice site's displayed OTP is not equivalent to secure out-of-band delivery. This test verifies the site's stated practice behaviour, not real-world delivery security.
- Shared public infrastructure may be unavailable or change without notice. Keep attempts low and do not run parallel repeated-attempt tests.
- Error messages can reveal whether a username exists. Verify that errors do not expose sensitive authentication details.
- Session cookies and browser state can persist between steps or tests. Use isolated contexts and verify logout using a fresh navigation/request.
- Do not include passwords or OTP values in test logs, screenshots, reports or source control.

## 2. Detailed test cases

| ID | Scenario / priority | Preconditions | Steps | Expected result |
|---|---|---|---|---|
| TC01 | Login page loads and controls are labelled - High | Application is reachable. | 1. Navigate to the main URL. 2. Locate the Username and Password fields by their accessible labels. 3. Locate the Next button. | Page loads successfully. Username and Password fields and the Next button are visible and accessible by their labels/names. |
| TC02 | Submit both credentials empty - High / Negative | Login page is open. | 1. Leave Username and Password empty. 2. Select Next. | A validation error is displayed. The user remains on the first-step login page and is not advanced to OTP entry or the secure area. |
| TC03 | Invalid username or password - High / Negative | Login page is open. | 1. Enter an invalid username with the supplied password. 2. Select Next. 3. Repeat once with the supplied username and an incorrect password. | Each attempt displays an authentication error. The user remains on the first step. No OTP step or secure-area access is granted. |
| TC04 | Username case sensitivity - Medium / Negative | Login page is open. | 1. Enter `TomSmith` (wrong case) and the correct password. 2. Select Next. | If usernames are case-sensitive, authentication is rejected with an error and the user remains on the login page. If the application intentionally treats usernames as case-insensitive, document the observed behaviour and confirm it against the product requirement. |
| TC05 | Valid first-step credentials lead to OTP - High / Positive | Login page is open. | 1. Enter `tomsmith`. 2. Enter `SuperSecretPassword!`. 3. Select Next. | The second step is displayed and clearly requests a one-time code. A six-digit code is visible on the practice page. The secure area is not yet accessible. |
| TC06 | OTP field masks input and limits length - High / Boundary | User has reached the OTP step. | 1. Inspect the OTP input type. 2. Type a test value. 3. Attempt to enter more than six characters. | Typed OTP characters are masked. The field accepts no more than six characters. The input does not reveal the typed code in plain text. |
| TC07 | OTP rejects empty, nonnumeric and over-length input - High / Negative | User has reached the OTP step. | 1. Submit the field empty. 2. Enter letters or mixed alphanumeric characters and submit. 3. Attempt to enter seven or more digits and submit. | Empty and nonnumeric values are rejected with a clear error or field validation. More than six characters cannot be entered or are rejected. The user is not authenticated. |
| TC08 | Incorrect six-digit OTP - High / Negative | User has reached the OTP step and has the current displayed code. | 1. Enter a different six-digit numeric value. 2. Select the verification/submit control. | An error message is displayed. The user remains outside the secure area. No authenticated session is created. |
| TC09 | Correct current OTP opens secure area - Critical / Positive | User has completed step one and the displayed code is current. | 1. Read the six-digit code from the page. 2. Enter it immediately. 3. Submit the code. | The secure area opens and displays its success/authentication message. The user is authenticated only after both steps are completed. |
| TC10 | OTP expires after three minutes - High / Boundary / Negative | User has reached the OTP step and a fresh code is displayed. | 1. Record when the code is displayed. 2. Wait until at least three minutes have elapsed. 3. Submit that same code. | The expired code is rejected with an error. The secure area is not opened. If the site does not expose a controllable clock or expiry indication, record the limitation and execute this test manually or with a controlled test clock where supported. |
| TC11 | OTP can only be used once - Critical / Security | A fresh code has successfully authenticated a user once. | 1. Complete both steps with the current code. 2. Log out or start a fresh unauthenticated flow. 3. Attempt to submit the previously successful code again. | The reused code is rejected. It must not create a new authenticated session. Use a fresh code for any subsequent successful login. |
| TC12 | Secure area requires authentication; logout ends session - Critical / Security | Start in a clean unauthenticated browser context. | 1. Navigate directly to the secure-area URL without logging in. 2. Confirm access is denied or redirected to login. 3. Complete both authentication steps. 4. Log out. 5. Try the secure-area URL again and use browser Back. | Direct access before authentication is denied. After logout, the session is invalidated; direct navigation and browser Back must not reveal protected content. The user must authenticate again using both steps. |

## 3. Execution notes for Playwright

- Prefer role- and label-based locators, for example `getByLabel('Username')`, `getByLabel('Password')`, and `getByRole('button', { name: 'Next' })`.
- Read the OTP from the page using a locator tied to the displayed code; avoid brittle selectors where possible.
- Keep OTP expiry and reuse tests independent. A successful login may consume the code, so do not share it across tests.
- Use a fresh browser context for tests that verify direct URL access and session termination.
- For expiry testing, use a measured wait of at least 180 seconds plus a small safety margin. Do not shorten the wait and claim the three-minute requirement has been verified.
- Confirm the actual secure-area URL and logout control from the rendered application before implementing selectors. Do not assume route names or DOM structure.
- Capture screenshots and Playwright traces on failure, but redact credentials and OTP values.
- Because this is a shared public practice site, run tests sequentially where repeated attempts or timing are involved. Do not run load tests or brute-force tests.

## 4. Entry and exit criteria

**Entry criteria**
- The application is reachable.
- Test credentials are available.
- Playwright and the selected browser are installed.
- The displayed OTP can be read from the page.

**Exit criteria**
- All applicable test cases have a recorded pass, fail or blocked result.
- Critical security failures (direct access without authentication, reused OTP accepted, or session still active after logout) are reported.
- Any unsupported or untestable behaviour, especially expiry control, is documented rather than marked as passed without evidence.
