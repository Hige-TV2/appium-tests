async function dismissNotificationPermission(driver) {
  try {
    const denyBtn = await driver.$('android=new UiSelector().text("Allow")');
    await denyBtn.waitForDisplayed({ timeout: 3000 });
    await denyBtn.click();
  } catch (e) {
    // Dialog didn't appear, that's fine
  }
}

async function dismissSavePasswordPopup(driver) {
  try {
    const popup = await driver.$(
      'android=new UiSelector().textContains("Use saved password")',
    );
    await popup.waitForDisplayed({ timeout: 3000 });
    await driver.pressKeyCode(4);
  } catch (e) {
    // Popup didn't appear, that's fine
  }
}

async function pressBackButton(driver) {
  await driver.pressKeyCode(4);
  await driver.pause(500);
}

async function pressEnterKey(driver) {
  await driver.pressKeyCode(66); // 66 = Enter key
  await driver.pause(500);
}

async function acceptCookies(driver, timeout = 1500) {
  try {
    const btn = await driver.$(
      'android=new UiSelector().resourceId("dk.tv2.nyhedscenter:id/btn_accept_cookies")',
    );
    await btn.waitForDisplayed({ timeout });
    await btn.click();
  } catch (e) {
    // Cookie popup didn't appear
  }
}

async function dismissRegionSelection(driver, timeout = 1500) {
  try {
    const btn = await driver.$('android=new UiSelector().text("Ikke nu")');
    await btn.waitForDisplayed({ timeout });
    await btn.click();
  } catch (e) {
    // Region popup didn't appear
  }
}

async function dismissAppearanceSelection(driver, timeout = 1500) {
  try {
    const btn = await driver.$('android=new UiSelector().text("Gem udseende")');
    await btn.waitForDisplayed({ timeout });
    await btn.click();
  } catch (e) {
    // Appearance popup didn't appear
  }
}

async function dismissBlockingPopups(driver, attempts = 2) {
  for (let i = 0; i < attempts; i += 1) {
    await acceptCookies(driver, 1200);
    await dismissRegionSelection(driver, 1200);
    await dismissAppearanceSelection(driver, 1200);
    await dismissSavePasswordPopup(driver);
    await driver.pause(250);
  }
}

module.exports = {
  dismissNotificationPermission,
  dismissSavePasswordPopup,
  pressBackButton,
  pressEnterKey,
  acceptCookies,
  dismissRegionSelection,
  dismissAppearanceSelection,
  dismissBlockingPopups,
};
