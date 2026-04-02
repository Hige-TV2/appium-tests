class LoginPage {
  async enterEmail(driver, email) {
    const field = await driver.$(
      'android=new UiSelector().resourceId("input-guid-1")',
    );
    await field.setValue(email);
  }

  async enterPassword(driver, password) {
    const field = await driver.$(
      'android=new UiSelector().resourceId("input-guid-2")',
    );
    await field.setValue(password);
  }

  async tapLogInd(driver) {
    const btn = await driver.$('android=new UiSelector().text("Log ind")');
    await btn.click();
  }
}

module.exports = new LoginPage();
