require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const authHelper = require("../utils/authHelper");
const helpers = require("../utils/helpers");
const forsidePage = require("../pages/forsidePage");
const podcastPage = require("../pages/podcastPage");
const selectorDebugHelper = require("./selectorDebugHelper");

function getRunLabel() {
  return new Date().toISOString().replace(/[.:]/g, "-");
}

describe("Podcast Debug Selectors", function () {
  this.timeout(90000);

  it("captures selector artifacts for podcast screen", async () => {
    allureReporter.addFeature("Podcast");
    allureReporter.addStory("Selector Debug");

    const runLabel = getRunLabel();

    allureReporter.startStep("Navigate to Podcast tab");
    await authHelper.loginToFrontpage(browser);
    await helpers.dismissBlockingPopups(browser, 1);
    await forsidePage.tapBottomNavItem(browser, "Podcast", 3000);
    await forsidePage.waitForBottomTabLandingSignal(browser, "Podcast", 9000);
    await podcastPage.waitForCarouselContainer(browser, 7000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Capture landing artifacts");
    const landing = await selectorDebugHelper.captureDebugBundle(
      browser,
      `podcast-landing-${runLabel}`,
    );
    allureReporter.addArgument("landingSource", landing.sourcePath);
    allureReporter.addArgument("landingTexts", landing.textsPath);
    allureReporter.addArgument("landingSelectors", landing.selectorsPath);
    allureReporter.endStep("passed");

    allureReporter.startStep("Swipe carousel left and capture artifacts");
    await podcastPage.swipeCarouselLeft(browser);
    const carousel = await selectorDebugHelper.captureDebugBundle(
      browser,
      `podcast-carousel-left-${runLabel}`,
    );
    allureReporter.addArgument("carouselSource", carousel.sourcePath);
    allureReporter.addArgument("carouselTexts", carousel.textsPath);
    allureReporter.addArgument("carouselSelectors", carousel.selectorsPath);
    allureReporter.endStep("passed");

    allureReporter.startStep(
      "Scroll page toward Seneste episoder and capture artifacts",
    );
    await browser.execute("mobile: swipeGesture", {
      left: 50,
      top: 450,
      width: 950,
      height: 1300,
      direction: "up",
      percent: 0.6,
    });
    await browser.pause(250);

    const episodes = await selectorDebugHelper.captureDebugBundle(
      browser,
      `podcast-episodes-${runLabel}`,
    );
    allureReporter.addArgument("episodesSource", episodes.sourcePath);
    allureReporter.addArgument("episodesTexts", episodes.textsPath);
    allureReporter.addArgument("episodesSelectors", episodes.selectorsPath);
    allureReporter.endStep("passed");
  });
});
