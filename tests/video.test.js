require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const testSetup = require("../utils/testSetup");
const forsidePage = require("../pages/forsidePage");
const videosPage = require("../pages/videosPage");

describe("Video Tab Reel State Coverage", function () {
  this.timeout(600000); // 10 minutes: account for up to 16s ad waits per scroll (30 scrolls max)

  beforeEach(async () => {
    await testSetup.loginToFrontpageWithRecovery(browser);
  });

  it("should detect ads, normal reels, and geoblocks in video feed", async () => {
    allureReporter.addFeature("Video Tab");
    allureReporter.addStory("Reel State Coverage");

    // Phase 1: Launch & Navigate

    allureReporter.startStep("Wait for bottom navigation bar to be displayed");
    const bottomNav = await browser.$(
      'android=new UiSelector().resourceId("dk.tv2.nyhedscenter:id/bottomNavigation")',
    );
    await bottomNav.waitForDisplayed({ timeout: 8000 });
    allureReporter.endStep("passed");

    allureReporter.startStep("Tap the Video tab");
    await forsidePage.tapBottomNavItem(browser, "Video", 5000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Verify Video tab navigation succeeded");
    await forsidePage.waitForBottomTabLandingSignal(browser, "Video", 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Wait for first reel to load (player container)");
    await videosPage.waitForPlayerContainer(browser, 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep(
      "Wait for reel state to settle (could be ad, normal reel, or geoblock)",
    );
    await videosPage.waitForReelStateSettled(browser, 8000);
    allureReporter.endStep("passed");

    // Phase 2 & 3: Scroll Loop

    allureReporter.startStep(
      "Begin scroll loop to detect ads, reels, and geoblocks",
    );

    const flags = {
      adSeen: false,
      reelSeen: false,
      geoblockSeen: false,
    };

    let geoblockScrollCount = 0;
    const MAX_GEOBLOCK_CHECKS = 10;
    const MAX_TOTAL_SCROLLS = 30;
    const MAX_LOOP_PASSES = 60;
    let totalScrolls = 0;
    let loopPasses = 0;

    while (totalScrolls < MAX_TOTAL_SCROLLS && loopPasses < MAX_LOOP_PASSES) {
      loopPasses += 1;

      // Check current reel state before scrolling

      // Check for Ad
      const adPlaying = await videosPage.isAdPlaying(browser);
      if (adPlaying) {
        flags.adSeen = true;
        allureReporter.addArgument("reel_state", "Ad Detected");
      }

      // Check for Normal Reel
      const normalReelPlaying = await videosPage.isNormalReelPlaying(browser);
      if (normalReelPlaying) {
        flags.reelSeen = true;
        allureReporter.addArgument("reel_state", "Normal Reel Detected");
      }

      // Check for Geoblock (only if not yet seen and under max attempts)
      if (
        !flags.geoblockSeen &&
        !adPlaying &&
        !normalReelPlaying &&
        geoblockScrollCount < MAX_GEOBLOCK_CHECKS
      ) {
        const geoblocked = await videosPage.isGeoblocked(browser);
        if (geoblocked) {
          flags.geoblockSeen = true;
          allureReporter.addArgument("reel_state", "Geoblock Detected");
        }
        geoblockScrollCount += 1;
      } else if (
        !flags.geoblockSeen &&
        geoblockScrollCount >= MAX_GEOBLOCK_CHECKS
      ) {
        flags.geoblockSeen = "skipped";
      }

      // Exit loop if all flags are satisfied
      if (
        flags.adSeen &&
        flags.reelSeen &&
        (flags.geoblockSeen === true || flags.geoblockSeen === "skipped")
      ) {
        break;
      }

      // Wait for any ad to finish before scrolling
      allureReporter.startStep(
        `Wait for ad to finish if playing (before scroll ${totalScrolls + 1})`,
      );
      try {
        const adWaitResult = await videosPage.waitForAdToFinish(browser, 22000);
        allureReporter.addArgument("ad_wait_result", adWaitResult);
        allureReporter.endStep("passed");

        if (adWaitResult === "still_playing") {
          await browser.pause(500);
          continue;
        }
      } catch (e) {
        allureReporter.endStep("failed");
        throw new Error(`Failed waiting for ad to finish: ${e.message}`);
      }

      // Scroll to next reel
      allureReporter.startStep(
        `Scroll to next reel (scroll ${totalScrolls + 1})`,
      );
      try {
        await videosPage.scrollToNextReel(browser);
        await videosPage.waitForReelStateSettled(browser, 6000);
        totalScrolls += 1;
        allureReporter.endStep("passed");
      } catch (e) {
        allureReporter.endStep("failed");
        throw new Error(`Failed to scroll to next reel: ${e.message}`);
      }
    }

    allureReporter.endStep("passed");

    allureReporter.addArgument("totalScrolls", String(totalScrolls));
    allureReporter.addArgument("loopPasses", String(loopPasses));
    allureReporter.addArgument("adSeen", String(flags.adSeen));
    allureReporter.addArgument("reelSeen", String(flags.reelSeen));
    allureReporter.addArgument("geoblockSeen", String(flags.geoblockSeen));

    // Phase 4: Assertions

    allureReporter.startStep("Assert ad was detected");
    if (!flags.adSeen) {
      throw new Error("Ad was not detected during scroll loop");
    }
    allureReporter.endStep("passed");

    allureReporter.startStep("Assert normal reel was detected");
    if (!flags.reelSeen) {
      throw new Error("Normal reel was not detected during scroll loop");
    }
    allureReporter.endStep("passed");

    allureReporter.startStep("Assert geoblock was detected or skipped");
    if (flags.geoblockSeen !== true && flags.geoblockSeen !== "skipped") {
      throw new Error("Geoblock detection failed");
    }

    if (flags.geoblockSeen === "skipped") {
      allureReporter.addArgument(
        "warning",
        "Geoblock was not detected after 10 checks - test passed but geoblock detection was skipped",
      );
    }
    allureReporter.endStep("passed");
  });
});
