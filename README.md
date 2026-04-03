# TV2 Nyheder - Appium Test Suite

Automated mobile tests for the TV2 Nyheder Android app using Appium and WebdriverIO.

## Prerequisites

### 1. Node.js

Download and install from [nodejs.org](https://nodejs.org).

### 2. Android Studio

Download from [developer.android.com](https://developer.android.com/studio). Even if you never open a project, Android Studio installs ADB (Android Debug Bridge) which is required to communicate with the device.

### 3. Appium

Install globally via npm:

```bash
npm install -g appium
```

### 4. UiAutomator2 Driver

Install the Android automation driver via Appium:

```bash
appium driver install uiautomator2
```

### 5. Allure Commandline (for reports)

Install globally via npm:

```bash
npm install -g allure-commandline
```

### 6. Appium Inspector (optional but recommended)

Used for exploring UI element selectors. Download the latest release from:
[github.com/appium/appium-inspector/releases](https://github.com/appium/appium-inspector/releases)

---

## Device Setup

1. On the Android device, go to **Settings → About Phone** and tap **Build Number** 7 times to enable Developer Options.
2. Go to **Settings → Developer Options** and enable:
   - **USB Debugging**
   - **Wireless Debugging**
3. Connect the device to the same WiFi network as your machine.
4. Open **Android Studio → Device Manager** (requires a project to be open) and pair the device using the **Pair using WiFi** option with a QR code or pairing code.
5. Verify the connection by running:

```bash
adb devices
```

You should see your device listed.

---

## Project Setup

1. Clone or copy the project to your machine.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with your test account credentials:

```
TV2_EMAIL=your@email.dk
TV2_PASSWORD=yourpassword
```

> ⚠️ Never commit the `.env` file to version control.

---

## Running Tests

1. Start the Appium server in one terminal:

```bash
appium
```

You should see: `Appium REST http interface listener started on 0.0.0.0:4723`

2. In a second terminal, run the full test suite:

```bash
npm test
```

---

## Viewing Reports

After the test suite has finished, generate and open the Allure HTML report:

```bash
npm run report
```

This will open a browser window with a full report including test steps, durations, and environment info. The report is regenerated fresh on every run.

---

## Project Structure

```
├── pages/                  # Page objects (one file per screen)
│   ├── loginWallPage.js    # Login wall (first screen on fresh install)
│   ├── loginPage.js        # Email/password login form
│   ├── forsidePage.js      # Home screen
│   └── minSidePage.js      # Profile/settings page
├── tests/                  # Test files
│   └── login.test.js       # Login and logout flow
├── utils/
│   └── driver.js           # Appium capabilities
├── helpers.js              # Reusable helper functions
├── wdio.config.js          # WebdriverIO configuration and test runner
├── .env                    # Credentials (not committed)
└── package.json
```

---

## App Info

- **Package:** `dk.tv2.nyhedscenter`
- **Launcher Activity:** `dk.tv2.nyhedscenter.LauncherActivity`

---

## Notes

- Tests run with a full app reset (`noReset` disabled), meaning the app starts fresh every run — cookies, region selection, and appearance popups will appear and are handled automatically.
- Each test is independent and handles its own login/logout cycle.
- The notification permission dialog is accepted on first run — Android will not ask again until the app is reset.
- The `allure-results` folder is wiped automatically at the start of each test run, so reports always reflect the latest run only.
- Device information (model, Android version) is detected automatically via ADB and included in the report environment panel.
