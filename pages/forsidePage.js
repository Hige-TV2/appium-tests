class ForsidePage {
  async tapProfilButton(driver) {
    const btn = await driver.$(
      'android=new UiSelector().className("android.widget.Button")',
    );
    await btn.click();
  }
}

module.exports = new ForsidePage();
