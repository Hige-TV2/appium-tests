class PodcastPage {
  constructor() {
    this.sectionTitleSelectors = [
      'new UiSelector().text("Podcasts")',
      'new UiSelector().textContains("Podcast")',
    ];

    this.listTitleSelectors = [
      'new UiSelector().text("TV 2 Podcasts")',
      'new UiSelector().textContains("Podcasts")',
    ];

    this.carouselContainerSelectors = [
      'new UiSelector().className("android.widget.HorizontalScrollView")',
    ];

    this.latestEpisodesTitleSelectors = [
      'new UiSelector().text("Seneste episoder")',
      'new UiSelector().textContains("episoder")',
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

  async waitForPodcastSectionTitle(driver, timeout = 6000) {
    return this.findFirstDisplayed(driver, this.sectionTitleSelectors, timeout);
  }

  async waitForTopPodcastListTitle(driver, timeout = 6000) {
    return this.findFirstDisplayed(driver, this.listTitleSelectors, timeout);
  }

  async waitForCarouselContainer(driver, timeout = 6000) {
    return this.findFirstDisplayed(
      driver,
      this.carouselContainerSelectors,
      timeout,
    );
  }

  async countVisiblePodcastCovers(driver) {
    let visible = 0;

    for (let i = 0; i < 3; i += 1) {
      try {
        const item = await driver.$(
          `android=new UiSelector().description("Podcast cover").instance(${i})`,
        );
        if (await item.isDisplayed()) {
          visible += 1;
        }
      } catch (e) {
        // Ignore missing item and continue scanning visible instances.
      }
    }

    return visible;
  }

  async waitForMinimumVisiblePodcastCovers(
    driver,
    minCount = 1,
    timeout = 6000,
  ) {
    await driver.waitUntil(
      async () => {
        const count = await this.countVisiblePodcastCovers(driver);
        return count >= minCount;
      },
      {
        timeout,
        interval: 350,
        timeoutMsg: `Expected at least ${minCount} visible Podcast cover items`,
      },
    );

    return this.countVisiblePodcastCovers(driver);
  }

  async waitForLatestEpisodesTitle(driver, timeout = 6000) {
    return this.findFirstDisplayed(
      driver,
      this.latestEpisodesTitleSelectors,
      timeout,
    );
  }

  async isAnyEpisodeSignalDisplayed(driver) {
    const episodeSelectors = [
      'new UiSelector().description("Podcast episode")',
      'new UiSelector().descriptionContains("Podcast")',
      'new UiSelector().className("android.widget.Button").instance(0)',
      'new UiSelector().className("android.widget.Button").instance(1)',
      'new UiSelector().className("android.widget.Button").instance(2)',
    ];

    for (const selector of episodeSelectors) {
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

  async waitForAnyEpisodeSignal(driver, timeout = 6000) {
    await driver.waitUntil(
      async () => this.isAnyEpisodeSignalDisplayed(driver),
      {
        timeout,
        interval: 350,
        timeoutMsg: "No episode signal found in Seneste episoder area",
      },
    );
  }

  async swipeCarouselLeft(driver) {
    const container = await this.waitForCarouselContainer(driver, 5000);
    let rect;

    try {
      rect = await container.getRect();
    } catch (e) {
      const location = await container.getLocation();
      const size = await container.getSize();
      rect = {
        x: location.x,
        y: location.y,
        width: size.width,
        height: size.height,
      };
    }

    await driver.execute("mobile: swipeGesture", {
      left: Math.round(rect.x),
      top: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      direction: "left",
      percent: 0.8,
    });

    await driver.pause(220);
  }
}

module.exports = new PodcastPage();
