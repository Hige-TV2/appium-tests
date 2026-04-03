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

  capabilities: [
    {
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
    const rawModel = execSync("adb shell getprop ro.product.model")
      .toString()
      .trim();
    const deviceModel = MODEL_NAMES[rawModel] || rawModel;
    const androidVersion = execSync(
      "adb shell getprop ro.build.version.release",
    )
      .toString()
      .trim();

    const content = `Device=${deviceModel}
Platform=Android ${androidVersion}
App=TV2 Nyheder
Package=dk.tv2.nyhedscenter`;

    // Selective cleanup: Keep the history, delete the rest
    if (fs.existsSync("allure-results")) {
      const files = fs.readdirSync("allure-results");
      files.forEach((file) => {
        if (file !== "history") {
          fs.rmSync(`allure-results/${file}`, { recursive: true, force: true });
        }
      });
    } else {
      fs.mkdirSync("allure-results", { recursive: true });
    }

    // Create executor to please Allure
    const executor = {
      name: "Local Machine",
      type: "local",
      buildName: `Run ${new Date().toLocaleString()}`,
    };
    fs.writeFileSync("allure-results/executor.json", JSON.stringify(executor));

    // Create environment.properties for the new run
    fs.writeFileSync("allure-results/environment.properties", content);
  },

  afterTest: async function (test, context, { error, passed }) {
    if (!passed) {
      await browser.takeScreenshot(); // auto-attaches to Allure report
    }
  },
};
