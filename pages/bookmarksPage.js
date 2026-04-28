class BookmarksPage {
  constructor() {
    this.articleBookmarkButtonSelectors = [
      'new UiSelector().description("Bookmark")',
    ];

    this.searchBarSelectors = ['new UiSelector().description("Search")'];

    this.bookmarkedItemSelectors = [
      'new UiSelector().description("Bookmark").instance(0)',
      'new UiSelector().description("Bookmark")',
    ];

    this.emptyListSelectors = [
      'new UiSelector().description("Empty article list")',
    ];

    this.backButtonSelectors = [
      'new UiSelector().description("Back").instance(0)',
    ];

    this.frontpageArticleSelectors = [
      'new UiSelector().className("android.view.View").instance(22)',
    ];

    this.frontpageArticleXPathSelectors = [
      '//android.widget.FrameLayout[@resource-id="dk.tv2.nyhedscenter:id/fragment_container"]/androidx.compose.ui.platform.ComposeView/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[1]/android.view.View[1]/android.view.View[2]/android.view.View/android.view.View[1]',
    ];
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

  async waitForArticleScreen(driver, timeout = 8000) {
    await this.findFirstDisplayed(
      driver,
      this.articleBookmarkButtonSelectors,
      timeout,
    );
  }

  async tapArticleBookmarkButton(driver, timeout = 5000) {
    const button = await this.findFirstDisplayed(
      driver,
      this.articleBookmarkButtonSelectors,
      timeout,
    );
    await button.click();
  }

  async waitForBookmarksScreen(driver, timeout = 7000) {
    const landingSignals = [
      'new UiSelector().text("Gemte artikler")',
      'new UiSelector().description("Search")',
      'new UiSelector().description("Empty article list")',
      'new UiSelector().description("Bookmark")',
    ];

    await driver.waitUntil(
      async () => this.isAnySelectorDisplayed(driver, landingSignals),
      {
        timeout,
        interval: 350,
        timeoutMsg: "Bookmarks tab landing signal was not visible",
      },
    );
  }

  async waitForSearchBar(driver, timeout = 6000) {
    return this.findFirstDisplayed(driver, this.searchBarSelectors, timeout);
  }

  async waitForBookmarkedListItem(driver, timeout = 6000) {
    return this.findFirstDisplayed(
      driver,
      this.bookmarkedItemSelectors,
      timeout,
    );
  }

  async tapFirstBookmarkedListItem(driver, timeout = 6000) {
    const item = await this.waitForBookmarkedListItem(driver, timeout);
    await item.click();
  }

  async tapBackButton(driver, timeout = 6000) {
    const button = await this.findFirstDisplayed(
      driver,
      this.backButtonSelectors,
      timeout,
    );
    await button.click();
  }

  async waitForEmptyBookmarkList(driver, timeout = 6000) {
    return this.findFirstDisplayed(driver, this.emptyListSelectors, timeout);
  }

  async tapFirstArticleFromFrontpage(driver, timeout = 10000) {
    try {
      const article = await this.findFirstDisplayed(
        driver,
        this.frontpageArticleSelectors,
        timeout,
      );
      await article.click();
      return;
    } catch (e) {
      // Fallbacks below handle layout differences.
    }

    for (const selector of this.frontpageArticleXPathSelectors) {
      try {
        const article = await driver.$(selector);
        await article.waitForDisplayed({ timeout });
        await article.click();
        return;
      } catch (e) {
        // Try next XPath selector.
      }
    }

    await driver.waitUntil(
      async () => {
        try {
          const candidates = await driver.$$(
            '//*[@content-desc and not(@content-desc="Bookmark") and not(@content-desc="Back") and not(@content-desc="Search")]',
          );

          for (const candidate of candidates) {
            if (await candidate.isDisplayed()) {
              await candidate.click();
              return true;
            }
          }
        } catch (e) {
          // Retry until timeout.
        }

        return false;
      },
      {
        timeout,
        interval: 350,
        timeoutMsg: "Could not find a tappable frontpage article",
      },
    );
  }
}

module.exports = new BookmarksPage();
