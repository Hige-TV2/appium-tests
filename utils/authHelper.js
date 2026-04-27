const helpers = require("./helpers");
const loginWallPage = require("../pages/loginWallPage");
const loginPage = require("../pages/loginPage");

const EMAIL_FIELD_SELECTOR = 'new UiSelector().resourceId("input-guid-1")';
const LOGIN_WALL_BUTTON_SELECTOR = 'new UiSelector().text("Log ind")';
const FRONTPAGE_SELECTORS = [
  'new UiSelector().text("Forside")',
  'new UiSelector().text("Seneste nyt")',
  'new UiSelector().text("Mest sete")',
  'new UiSelector().className("android.view.View").instance(47)',
  'new UiSelector().className("android.view.View").instance(49)',
];

async function isElementDisplayed(driver, selector) {
  try {
    const element = await driver.$(`android=${selector}`);
    return await element.isDisplayed();
  } catch (e) {
    return false;
  }
}

async function waitForAnyDisplayed(driver, selectors, timeout, timeoutMsg) {
  await driver.waitUntil(
    async () => {
      for (const selector of selectors) {
        if (await isElementDisplayed(driver, selector)) {
          return true;
        }
      }
      return false;
    },
    {
      timeout,
      interval: 350,
      timeoutMsg,
    },
  );
}

async function isLoggedIn(driver, timeout = 2500) {
  try {
    await waitForAnyDisplayed(
      driver,
      FRONTPAGE_SELECTORS,
      timeout,
      "No logged-in frontpage indicator was visible",
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function loginToFrontpage(driver) {
  if (!process.env.TV2_EMAIL || !process.env.TV2_PASSWORD) {
    throw new Error("Missing TV2_EMAIL or TV2_PASSWORD environment variables");
  }

  await helpers.dismissNotificationPermission(driver);
  await helpers.dismissBlockingPopups(driver, 2);

  if (await isLoggedIn(driver, 2000)) {
    return;
  }

  // Try to find and tap the login wall button
  try {
    const loginWallBtn = await driver.$(
      `android=${LOGIN_WALL_BUTTON_SELECTOR}`,
    );
    await loginWallBtn.waitForDisplayed({ timeout: 2500 });
    await loginWallPage.tapLogInd(driver);
  } catch (e) {
    // Login wall may not be visible if app already routed elsewhere
  }

  // Wait for email field to appear (we're now on the login form after tapping login wall)
  try {
    const emailField = await driver.$(`android=${EMAIL_FIELD_SELECTOR}`);
    await emailField.waitForDisplayed({ timeout: 4000 });
    await loginPage.enterEmail(driver, process.env.TV2_EMAIL);
    await loginPage.enterPassword(driver, process.env.TV2_PASSWORD);
    await helpers.pressEnterKey(driver);
  } catch (e) {
    // Already logged in or email field not found
  }

  await driver.waitUntil(
    async () => {
      await helpers.dismissBlockingPopups(driver, 1);
      return isLoggedIn(driver, 900);
    },
    {
      timeout: 12000,
      interval: 400,
      timeoutMsg: "Unable to reach frontpage after login and popup handling",
    },
  );
}

module.exports = {
  loginToFrontpage,
  isLoggedIn,
};
