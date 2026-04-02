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

async function acceptCookies(driver) {
  try {
    const btn = await driver.$(
      'android=new UiSelector().resourceId("dk.tv2.nyhedscenter:id/btn_accept_cookies")',
    );
    await btn.waitForDisplayed({ timeout: 5000 });
    await btn.click();
  } catch (e) {
    // Cookie popup didn't appear
  }
}

async function dismissRegionSelection(driver) {
  try {
    const btn = await driver.$('android=new UiSelector().text("Ikke nu")');
    await btn.waitForDisplayed({ timeout: 5000 });
    await btn.click();
  } catch (e) {
    // Region popup didn't appear
  }
}

async function dismissAppearanceSelection(driver) {
  try {
    const btn = await driver.$('android=new UiSelector().text("Gem udseende")');
    await btn.waitForDisplayed({ timeout: 5000 });
    await btn.click();
  } catch (e) {
    // Appearance popup didn't appear
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
};
