require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const helpers = require("../helpers");
const loginWallPage = require("../pages/loginWallPage");
const loginPage = require("../pages/loginPage");
const forsidePage = require("../pages/forsidePage");
const minSidePage = require("../pages/minSidePage");

describe("Authentication", () => {
  it("should login and logout successfully", async () => {
    allureReporter.addFeature("Authentication");
    allureReporter.addStory("Login and Logout");

    allureReporter.startStep("Dismiss notification permission");
    await helpers.dismissNotificationPermission(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Tap log ind");
    await loginWallPage.tapLogInd(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Enter credentials");
    await loginPage.enterEmail(browser, process.env.TV2_EMAIL);
    await loginPage.enterPassword(browser, process.env.TV2_PASSWORD);
    await helpers.pressEnterKey(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Accept cookie consent");
    const cookiePopup = await browser.$(
      'android=new UiSelector().resourceId("dk.tv2.nyhedscenter:id/btn_accept_cookies")',
    );
    await cookiePopup.waitForDisplayed({ timeout: 5000 });
    await helpers.acceptCookies(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Dismiss region selection");
    const regionPopup = await browser.$(
      'android=new UiSelector().text("Ikke nu")',
    );
    await regionPopup.waitForDisplayed({ timeout: 5000 });
    await helpers.dismissRegionSelection(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Dismiss appearance selection");
    const appearancePopup = await browser.$(
      'android=new UiSelector().text("Gem udseende")',
    );
    await appearancePopup.waitForDisplayed({ timeout: 5000 });
    await helpers.dismissAppearanceSelection(browser);
    allureReporter.endStep("passed");

    allureReporter.startStep("Verify home screen");
    const forside = await browser.$('android=new UiSelector().text("Forside")');
    await forside.waitForDisplayed({ timeout: 10000 });
    allureReporter.endStep("passed");

    allureReporter.startStep("Logout");
    await forsidePage.tapProfilButton(browser);
    await browser.pause(2000);
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
    await loginWall.waitForDisplayed({ timeout: 10000 });
    allureReporter.endStep("passed");
  });
});
