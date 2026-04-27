class SektionerPage {
  getSectionInListXPath(sectionName) {
    const safeText = sectionName.replace(/"/g, '\\"');
    return `//android.widget.FrameLayout[@resource-id="dk.tv2.nyhedscenter:id/fragment_container"]/androidx.compose.ui.platform.ComposeView/android.view.View/android.view.View/android.view.View[1]//*[@text="${safeText}"]`;
  }

  async isDisplayedByUiSelector(driver, uiSelector) {
    try {
      const element = await driver.$(`android=${uiSelector}`);
      return await element.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  async waitForSectionListContainer(driver, timeout = 5000) {
    const listSelectors = [
      'new UiSelector().className("android.view.View").instance(10)',
    ];

    await driver.waitUntil(
      async () => {
        for (const selector of listSelectors) {
          if (await this.isDisplayedByUiSelector(driver, selector)) {
            return true;
          }
        }

        try {
          const xpathContainer = await driver.$(
            '//android.widget.FrameLayout[@resource-id="dk.tv2.nyhedscenter:id/fragment_container"]/androidx.compose.ui.platform.ComposeView/android.view.View/android.view.View/android.view.View[1]',
          );
          return await xpathContainer.isDisplayed();
        } catch (e) {
          return false;
        }
      },
      {
        timeout,
        interval: 350,
        timeoutMsg: "Sektioner list container was not visible",
      },
    );
  }

  async waitForSectionVisible(driver, sectionName, timeout = 3000) {
    try {
      const scopedElement = await driver.$(
        this.getSectionInListXPath(sectionName),
      );
      await scopedElement.waitForDisplayed({ timeout });
      return scopedElement;
    } catch (e) {
      // fallback to global selectors below
    }

    const selectors =
      sectionName === "Podcast"
        ? [
            'new UiSelector().text("Podcast").instance(0)',
            'new UiSelector().text("Podcast")',
          ]
        : [`new UiSelector().text("${sectionName}")`];

    for (const selector of selectors) {
      try {
        const element = await driver.$(`android=${selector}`);
        await element.waitForDisplayed({ timeout });
        return element;
      } catch (e) {
        // try next selector fallback
      }
    }

    throw new Error(`Section not visible: ${sectionName}`);
  }

  async scrollToSection(driver, sectionName, timeout = 8000) {
    const safeText = sectionName.replace(/"/g, '\\"');

    try {
      const element = await driver.$(
        `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${safeText}"))`,
      );
      await element.waitForDisplayed({ timeout: 2500 });
      return element;
    } catch (e) {
      // fallback to manual forward scroll loop
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
      try {
        const visible = await this.waitForSectionVisible(
          driver,
          sectionName,
          700,
        );
        if (visible) {
          return visible;
        }
      } catch (e) {
        // continue scrolling
      }

      await driver.execute("mobile: scroll", {
        strategy: "-android uiautomator",
        selector:
          "new UiScrollable(new UiSelector().scrollable(true)).scrollForward()",
      });
      await driver.pause(180);
    }

    throw new Error(`Could not scroll section into view: ${sectionName}`);
  }

  async scrollListToTop(driver, maxAttempts = 10) {
    // Try to detect when we're at the top using multiple anchor sections
    const topAnchors = ["Business", "Echo", "Fodbold"];

    for (let i = 0; i < maxAttempts; i += 1) {
      // Check if we can find any of the top anchor sections
      for (const anchor of topAnchors) {
        try {
          await this.waitForSectionVisible(driver, anchor, 500);
          return; // Found a top anchor, we're at the top
        } catch (e) {
          // continue checking other anchors
        }
      }

      // Scroll backward to try to reach the top
      await driver.execute("mobile: scroll", {
        strategy: "-android uiautomator",
        selector:
          "new UiScrollable(new UiSelector().scrollable(true)).scrollBackward()",
      });
      await driver.pause(180);
    }

    // After max attempts, just proceed - we likely can't scroll further
  }

  async ensureSectionVisible(driver, sectionName, timeout = 8000) {
    try {
      return await this.waitForSectionVisible(driver, sectionName, 3000);
    } catch (e) {
      return this.scrollToSection(driver, sectionName, timeout);
    }
  }

  async tapSection(driver, sectionName, timeout = 8000) {
    try {
      const scopedElement = await driver.$(
        this.getSectionInListXPath(sectionName),
      );
      await scopedElement.waitForDisplayed({ timeout: 2500 });
      await scopedElement.click();
      return;
    } catch (e) {
      // fallback to generic visibility + click strategy
    }

    const section = await this.ensureSectionVisible(
      driver,
      sectionName,
      timeout,
    );
    await section.click();
  }

  async waitForSectionDetailTitle(driver, sectionName, timeout = 5000) {
    const selectors = [
      `new UiSelector().text("${sectionName}").instance(3)`,
      `new UiSelector().text("${sectionName}").instance(2)`,
      `new UiSelector().text("${sectionName}").instance(1)`,
      `new UiSelector().text("${sectionName}").instance(0)`,
      `new UiSelector().text("${sectionName}")`,
    ];

    for (const selector of selectors) {
      try {
        const element = await driver.$(`android=${selector}`);
        await element.waitForDisplayed({ timeout });
        return element;
      } catch (e) {
        // try next selector fallback
      }
    }

    throw new Error(
      `Section title was not visible on detail page: ${sectionName}`,
    );
  }

  async waitForAnyArticleSignal(driver, timeout = 5000) {
    await driver.waitUntil(
      async () => {
        try {
          const elements = await driver.$$(
            "//*[@content-desc and string-length(normalize-space(@content-desc)) > 0]",
          );
          return elements.length > 0;
        } catch (e) {
          return false;
        }
      },
      {
        timeout,
        interval: 350,
        timeoutMsg: "No article-like content-desc signal found in section",
      },
    );
  }
}

module.exports = new SektionerPage();
