class VideosPage {
  constructor() {
    this.playerContainerSelector =
      'new UiSelector().resourceId("dk.tv2.nyhedscenter:id/exo_content_frame")';
    this.adOverlaySelector =
      'new UiSelector().resourceId("dk.tv2.nyhedscenter:id/exo_ad_overlay")';
    this.seekBarSelector =
      'new UiSelector().className("android.widget.SeekBar")';
    this.delButtonLabelSelector = 'new UiSelector().text("Del")';
    this.lydButtonLabelSelector = 'new UiSelector().text("Lyd")';
    this.geoblockDialogSelector =
      'new UiSelector().resourceId("dk.tv2.nyhedscenter:id/region_dialog")';
    this.skipAdSelectors = [
      'new UiSelector().description("Skip ad")',
      'new UiSelector().textContains("Skip ad")',
      'new UiSelector().textContains("Skip")',
      'new UiSelector().textContains("skip")',
      'new UiSelector().textContains("Spring")',
    ];
  }

  /**
   * Utility to find first displayed element from a list of selectors
   */
  async findFirstDisplayed(driver, selectors, timeout = 3000) {
    let lastError;

    const selectorsArray = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of selectorsArray) {
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

  /**
   * Utility to check if element exists and is displayed
   */
  async isElementDisplayed(driver, selector, timeout = 1500) {
    try {
      const element = await driver.$(`android=${selector}`);
      return await element.isDisplayed({ timeout });
    } catch (e) {
      return false;
    }
  }

  /**
   * Wait for player container to be ready
   */
  async waitForPlayerContainer(driver, timeout = 6000) {
    return this.findFirstDisplayed(
      driver,
      this.playerContainerSelector,
      timeout,
    );
  }

  /**
   * Wait for SeekBar to indicate reel is playing
   */
  async waitForSeekBar(driver, timeout = 6000) {
    return this.findFirstDisplayed(driver, this.seekBarSelector, timeout);
  }

  async findFirstExistingDisplayed(driver, selectors, timeout = 500) {
    for (const selector of selectors) {
      try {
        const element = await driver.$(`android=${selector}`);
        await element.waitForDisplayed({ timeout });
        return element;
      } catch (e) {
        // Try next selector.
      }
    }

    return null;
  }

  async getPageSource(driver) {
    return driver.getPageSource();
  }

  hasNestedAdContent(xmlSource) {
    const adOverlayWithContent = new RegExp(
      'resource-id="dk\\.tv2\\.nyhedscenter:id/exo_ad_overlay"[^>]*>[\\s\\S]*?<android\\.webkit\\.WebView',
      "i",
    );

    return adOverlayWithContent.test(xmlSource);
  }

  hasMeaningfulRegionDialogContent(xmlSource) {
    const regionDialogWithText = new RegExp(
      'resource-id="dk\\.tv2\\.nyhedscenter:id/region_dialog"[^>]*>[\\s\\S]*?text="[^"]+"',
      "i",
    );

    const regionDialogWithButton = new RegExp(
      'resource-id="dk\\.tv2\\.nyhedscenter:id/region_dialog"[^>]*>[\\s\\S]*?<android\\.widget\\.(Button|TextView)',
      "i",
    );

    return (
      regionDialogWithText.test(xmlSource) ||
      regionDialogWithButton.test(xmlSource)
    );
  }

  /**
   * Detect whether the ad overlay currently contains real ad content.
   * The shell container is always present, so existence/displayed is not useful.
   * Returns true if ad is playing, false otherwise
   */
  async isAdPlaying(driver) {
    try {
      const xmlSource = await this.getPageSource(driver);
      return this.hasNestedAdContent(xmlSource);
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if all three signals are present for a normal reel
   */
  async isNormalReelPlaying(driver) {
    try {
      const seekBarPresent = await this.isElementDisplayed(
        driver,
        this.seekBarSelector,
        500,
      );
      const delPresent = await this.isElementDisplayed(
        driver,
        this.delButtonLabelSelector,
        500,
      );
      const lydPresent = await this.isElementDisplayed(
        driver,
        this.lydButtonLabelSelector,
        500,
      );

      return seekBarPresent && delPresent && lydPresent;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if region dialog contains real geoblock content.
   * The dialog shell is always present, so only meaningful descendants count.
   */
  async isGeoblocked(driver) {
    try {
      const xmlSource = await this.getPageSource(driver);
      return this.hasMeaningfulRegionDialogContent(xmlSource);
    } catch (e) {
      return false;
    }
  }

  async trySkipAd(driver) {
    try {
      const skipButton = await this.findFirstExistingDisplayed(
        driver,
        this.skipAdSelectors,
        400,
      );

      if (!skipButton) {
        return false;
      }

      await skipButton.click();
      await driver.pause(500);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Scroll to next reel by swiping upward on the player container
   * Drag starts inside the player container so the feed interprets it as reel navigation
   */
  async scrollToNextReel(driver) {
    let centerX;
    let startY;
    let endY;

    try {
      const playerContainer = await driver.$(
        `android=${this.playerContainerSelector}`,
      );
      await playerContainer.waitForDisplayed({ timeout: 6000 });

      const location = await playerContainer.getLocation();
      const size = await playerContainer.getSize();
      centerX = Math.round(location.x + size.width / 2);
      startY = Math.round(location.y + size.height * 0.78);
      endY = Math.round(location.y + size.height * 0.22);
    } catch (e) {
      const windowSize = await driver.getWindowSize();
      centerX = Math.round(windowSize.width * 0.5);
      startY = Math.round(windowSize.height * 0.76);
      endY = Math.round(windowSize.height * 0.24);
    }

    await driver.execute("mobile: dragGesture", {
      startX: centerX,
      startY,
      endX: centerX,
      endY,
      speed: 900,
    });

    // Brief pause for transition
    await driver.pause(1200);
  }

  /**
   * Wait for any ad to finish playing
   * Supports both unskippable and skippable ads with variable lengths.
   * Returns "no_ad", "finished", "skipped", or "still_playing"
   */
  async waitForAdToFinish(driver, timeout = 26000) {
    // Check if an ad is currently playing
    const adIsPlaying = await this.isAdPlaying(driver);
    if (!adIsPlaying) {
      return "no_ad";
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Check if ad is still playing
        const stillPlaying = await this.isAdPlaying(driver);
        if (!stillPlaying) {
          // Ad has finished, normal reel or geoblock should be visible
          await driver.pause(300);
          return "finished";
        }

        const skipped = await this.trySkipAd(driver);
        if (skipped) {
          const skipWaitStart = Date.now();
          while (Date.now() - skipWaitStart < 5000) {
            if (!(await this.isAdPlaying(driver))) {
              await driver.pause(300);
              return "skipped";
            }

            await driver.pause(300);
          }
        }

        await driver.pause(500);
      } catch (e) {
        // Continue waiting
      }
    }

    return "still_playing";
  }

  /**
   * Wait for reel state to settle after scrolling
   * Checks for presence of SeekBar, ad overlay with children, or geoblock with children
   */
  async waitForReelStateSettled(driver, timeout = 6000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Check if any of the "ready" signals are present
        const seekBarReady = await this.isElementDisplayed(
          driver,
          this.seekBarSelector,
          300,
        );
        if (seekBarReady) {
          return true;
        }

        const adReady = await this.isAdPlaying(driver);
        if (adReady) {
          return true;
        }

        const geoblockReady = await this.isGeoblocked(driver);
        if (geoblockReady) {
          return true;
        }

        await driver.pause(200);
      } catch (e) {
        // Continue waiting
      }
    }

    throw new Error("Timeout waiting for reel state to settle");
  }
}

module.exports = new VideosPage();
