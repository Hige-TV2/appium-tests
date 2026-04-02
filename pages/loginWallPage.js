class LoginWallPage {
  async tapLogInd(driver) {
    const btn = await driver.$('android=new UiSelector().text("Log ind")');
    await btn.click();
  }

  async tapOpretLogin(driver) {
    const btn = await driver.$(
      'android=new UiSelector().text("Opret TV 2 Login")',
    );
    await btn.click();
  }

  async tapHjaelpOgForklaring(driver) {
    const btn = await driver.$(
      'android=new UiSelector().text("Hjælp og forklaring")',
    );
    await btn.click();
  }
}

module.exports = new LoginWallPage();
