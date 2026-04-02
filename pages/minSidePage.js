class MinSidePage {
  async tapLogUd(driver) {
    const btn = await driver.$('android=new UiSelector().text("Log ud")');
    await btn.click();
  }
}

module.exports = new MinSidePage();
