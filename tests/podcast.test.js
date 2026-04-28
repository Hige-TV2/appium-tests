require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const testSetup = require("../utils/testSetup");
const forsidePage = require("../pages/forsidePage");
const podcastPage = require("../pages/podcastPage");

describe("Podcast", function () {
  this.timeout(90000);

  beforeEach(async () => {
    await testSetup.loginToFrontpageWithRecovery(browser);
  });

  it("should validate podcast landing content", async () => {
    allureReporter.addFeature("Podcast");
    allureReporter.addStory("Podcast Landing Content");

    allureReporter.startStep("Tap Podcast bottom tab");
    await forsidePage.tapBottomNavItem(browser, "Podcast", 3000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Validate Podcast tab landing signal");
    await forsidePage.waitForBottomTabLandingSignal(browser, "Podcast", 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Validate Podcasts section title");
    await podcastPage.waitForPodcastSectionTitle(browser, 6000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Validate TV 2 Podcasts list title");
    await podcastPage.waitForTopPodcastListTitle(browser, 6000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Validate horizontal podcast carousel");
    await podcastPage.waitForCarouselContainer(browser, 6000);
    const visibleCovers = await podcastPage.waitForMinimumVisiblePodcastCovers(
      browser,
      1,
      6000,
    );
    allureReporter.addArgument("visiblePodcastCovers", String(visibleCovers));
    allureReporter.endStep("passed");

    allureReporter.startStep("Validate Seneste episoder section title");
    await podcastPage.waitForLatestEpisodesTitle(browser, 6000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Validate at least one episode signal");
    await podcastPage.waitForAnyEpisodeSignal(browser, 6000);
    allureReporter.endStep("passed");
  });
});
