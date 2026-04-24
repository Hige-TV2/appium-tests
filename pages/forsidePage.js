class ForsidePage {
  constructor() {
    this.bottomNavSelectors = {
      Forside: [
        'new UiSelector().text("Forside")',
        'new UiSelector().className("android.view.View").instance(49)',
      ],
      Sektioner: [
        'new UiSelector().text("Sektioner")',
        'new UiSelector().className("android.view.View").instance(51)',
      ],
      Video: [
        'new UiSelector().text("Video")',
        'new UiSelector().className("android.view.View").instance(53)',
      ],
      Podcast: [
        'new UiSelector().text("Podcast")',
        'new UiSelector().className("android.view.View").instance(55)',
      ],
      Gemt: [
        'new UiSelector().text("Gemt")',
        'new UiSelector().className("android.view.View").instance(57)',
      ],
    };

    this.topNavSelectors = {
      Tophistorier: [
        'new UiSelector().text("Tophistorier")',
        'new UiSelector().className("android.view.View").instance(47)',
      ],
      "Seneste nyt": [
        'new UiSelector().text("Seneste nyt").instance(1)',
        'new UiSelector().text("Seneste nyt")',
        'new UiSelector().className("android.view.View").instance(49)',
      ],
      "Mest sete": [
        'new UiSelector().text("Mest sete")',
        'new UiSelector().className("android.view.View").instance(51)',
      ],
    };

    this.bottomTabLandingSignals = {
      Sektioner: [
        'new UiSelector().text("Sektioner").instance(0)',
        'new UiSelector().text("Business")',
      ],
      Video: [
        'new UiSelector().text("Del")',
        'new UiSelector().className("android.widget.SeekBar")',
      ],
      Podcast: [
        'new UiSelector().text("Podcasts")',
        'new UiSelector().text("Podcast")',
        'new UiSelector().textContains("Podcast")',
        'new UiSelector().text("TV 2 Podcasts")',
        'new UiSelector().text("Seneste episoder")',
      ],
      Gemt: [
        'new UiSelector().text("Gemte artikler")',
        'new UiSelector().description("Bookmark")',
      ],
    };
  }

  async findFirstDisplayed(driver, selectors, timeout = 3000) {
    let lastError;

    for (const selector of selectors) {
      try {
        const element = await driver.$(`android=${selector}`);
        await element.waitForDisplayed({ timeout });
        return element;
      } catch (e) {
        lastError = e;
      }
    }

    throw (
      lastError || new Error("Could not locate element with provided selectors")
    );
  }

  async tapProfilButton(driver) {
    const btn = await driver.$(
      'android=new UiSelector().className("android.widget.Button")',
    );
    await btn.click();
  }

  async waitForBottomNavItem(driver, itemName, timeout = 3000) {
    const selectors = this.bottomNavSelectors[itemName];
    if (!selectors) {
      throw new Error(`Unsupported bottom nav item: ${itemName}`);
    }

    return this.findFirstDisplayed(driver, selectors, timeout);
  }

  async waitForTopNavItem(driver, itemName, timeout = 3000) {
    const selectors = this.topNavSelectors[itemName];
    if (!selectors) {
      throw new Error(`Unsupported top nav item: ${itemName}`);
    }

    return this.findFirstDisplayed(driver, selectors, timeout);
  }

  async tapBottomNavItem(driver, itemName, timeout = 3000) {
    const item = await this.waitForBottomNavItem(driver, itemName, timeout);
    await item.click();
  }

  async tapTopNavItem(driver, itemName, timeout = 3000) {
    const item = await this.waitForTopNavItem(driver, itemName, timeout);
    await item.click();
  }

  async isAnySelectorDisplayed(driver, selectors) {
    for (const selector of selectors) {
      try {
        const element = await driver.$(`android=${selector}`);
        if (await element.isDisplayed()) {
          return true;
        }
      } catch (e) {
        // Try next selector.
      }
    }

    return false;
  }

  async waitForBottomTabLandingSignal(driver, tabName, timeout = 5000) {
    const selectors = this.bottomTabLandingSignals[tabName];
    if (!selectors) {
      throw new Error(`Unsupported bottom tab landing validation: ${tabName}`);
    }

    await driver.waitUntil(
      async () => this.isAnySelectorDisplayed(driver, selectors),
      {
        timeout,
        interval: 400,
        timeoutMsg: `No landing signal found for bottom tab: ${tabName}`,
      },
    );
  }
}

module.exports = new ForsidePage();
