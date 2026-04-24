require("dotenv").config();
const fs = require("fs");
const { execSync } = require("child_process");

const MODEL_NAMES = {
  "SM-G998B": "Samsung Galaxy S21 Ultra 5G",
  // add more devices as they come up
};

exports.config = {
  runner: "local",
  hostname: "localhost",
  port: 4723,
  logLevel: "error",
  maxInstances: 1,

  capabilities: [
    {
      maxInstances: 1,
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:udid": "adb-R5CNC0GCYCM-81cpHg._adb-tls-connect._tcp",
      "appium:appPackage": "dk.tv2.nyhedscenter",
      "appium:appActivity": "dk.tv2.nyhedscenter.LauncherActivity",
      "appium:chromeOptions": { args: ["--disable-web-security"] },
    },
  ],

  framework: "mocha",
  mochaOpts: {
    timeout: 60000,
  },

  specs: ["./tests/**/*.test.js"],

  reporters: [
    "spec", // clean terminal output
    [
      "allure",
      {
        outputDir: "allure-results",
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  onPrepare: function () {
    let deviceModel = "Unknown Device";
    let androidVersion = "Unknown";

    try {
      const rawModel = execSync("adb shell getprop ro.product.model", {
        stdio: "pipe",
      })
        .toString()
        .trim();
      deviceModel = MODEL_NAMES[rawModel] || rawModel;
      androidVersion = execSync("adb shell getprop ro.build.version.release", {
        stdio: "pipe",
      })
        .toString()
        .trim();
    } catch (e) {
      console.warn("⚠️ No device detected via ADB. Using placeholders.");
    }

    const content = `Device=${deviceModel}\nPlatform=Android ${androidVersion}\nApp=TV2 Nyheder\nPackage=dk.tv2.nyhedscenter`;

    // No wipe here — the testSuite script manages allure-results cleanup
    fs.mkdirSync("allure-results", { recursive: true });

    fs.writeFileSync("allure-results/environment.properties", content);

    const executor = {
      name: "Local Machine",
      type: "local",
      buildName: `Run ${new Date().toLocaleString()}`,
    };
    fs.writeFileSync("allure-results/executor.json", JSON.stringify(executor));
  },

  afterTest: async function (test, context, { error, passed }) {
    if (!passed) {
      try {
        await browser.takeScreenshot(); // auto-attaches to Allure report
      } catch (e) {
        // Session may be gone after a crash; avoid masking original test error.
      }
    }
  },
};
