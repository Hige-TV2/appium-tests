require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const helpers = require("../utils/helpers");
const authHelper = require("../utils/authHelper");
const forsidePage = require("../pages/forsidePage");
const minSidePage = require("../pages/minSidePage");

describe("Authentication", () => {
  it("should login and logout successfully", async () => {
    allureReporter.addFeature("Authentication");
    allureReporter.addStory("Login and Logout");

    allureReporter.startStep("Dismiss notification permission");
    await helpers.dismissNotificationPermission(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Login to frontpage");
    await authHelper.loginToFrontpage(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Verify home screen");
    const forside = await browser.$('android=new UiSelector().text("Forside")');
    await forside.waitForDisplayed({ timeout: 7000 });
    allureReporter.endStep("passed");

    allureReporter.startStep("Logout");
    await forsidePage.tapProfilButton(browser);
    await browser.pause(1200);
    await browser.execute("mobile: scroll", {
      strategy: "-android uiautomator",
      selector:
        "new UiScrollable(new UiSelector().scrollable(true)).scrollForward()",
    });
    await minSidePage.tapLogUd(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Verify login wall");
    const loginWall = await browser.$(
      'android=new UiSelector().text("Log ind")',
    );
    await loginWall.waitForDisplayed({ timeout: 7000 });
    allureReporter.endStep("passed");
  });
});
