const authHelper = require("./authHelper");
const helpers = require("./helpers");
const forsidePage = require("../pages/forsidePage");

async function loginToFrontpageWithRecovery(driver, options = {}) {
  const {
    maxAttempts = 2,
    recoverPopupAttempts = 2,
    recoverPauseMs = 500,
    postLoginPopupAttempts = 1,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await authHelper.loginToFrontpage(driver);

      if (postLoginPopupAttempts > 0) {
        await helpers.dismissBlockingPopups(driver, postLoginPopupAttempts);
      }

      return;
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await helpers.dismissBlockingPopups(driver, recoverPopupAttempts);

        if (recoverPauseMs > 0) {
          await driver.pause(recoverPauseMs);
        }
      }
    }
  }

  throw lastError;
}

async function openBottomTabAndWait(driver, tabName, options = {}) {
  const {
    tapTimeout = 3000,
    landingTimeout = 5000,
    dismissPopupAttempts = 0,
  } = options;

  await forsidePage.tapBottomNavItem(driver, tabName, tapTimeout);
  await forsidePage.waitForBottomTabLandingSignal(
    driver,
    tabName,
    landingTimeout,
  );

  if (dismissPopupAttempts > 0) {
    await helpers.dismissBlockingPopups(driver, dismissPopupAttempts);
  }
}

module.exports = {
  loginToFrontpageWithRecovery,
  openBottomTabAndWait,
};
