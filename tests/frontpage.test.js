require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const authHelper = require("../utils/authHelper");
const forsidePage = require("../pages/forsidePage");

describe("Frontpage Navigation", () => {
  beforeEach(async () => {
    await authHelper.loginToFrontpage(browser);
  });

  it("should show all expected bottom navigation items", async () => {
    allureReporter.addFeature("Frontpage Navigation");
    allureReporter.addStory("Bottom Navigation");

    const bottomTabs = ["Forside", "Sektioner", "Video", "Podcast", "Gemt"];

    for (const tab of bottomTabs) {
      allureReporter.startStep(`Validate bottom tab: ${tab}`);
      await forsidePage.waitForBottomNavItem(browser, tab, 3000);
      allureReporter.endStep("passed");
    }
  });

  it("should show and allow tapping expected top navigation tabs", async () => {
    allureReporter.addFeature("Frontpage Navigation");
    allureReporter.addStory("Top Navigation");

    const topTabs = ["Tophistorier", "Seneste nyt", "Mest sete"];

    for (const tab of topTabs) {
      allureReporter.startStep(`Validate top tab: ${tab}`);
      await forsidePage.waitForTopNavItem(browser, tab, 3000);
      allureReporter.endStep("passed");

      allureReporter.startStep(`Tap top tab: ${tab}`);
      await forsidePage.tapTopNavItem(browser, tab, 3000);
      allureReporter.endStep("passed");
    }

    allureReporter.startStep("Return to Forside in bottom navigation");
    await forsidePage.tapBottomNavItem(browser, "Forside", 3000);
    allureReporter.endStep("passed");
  });

  it("should navigate to each bottom tab and show tab-specific content", async () => {
    allureReporter.addFeature("Frontpage Navigation");
    allureReporter.addStory("Bottom Tab Navigation");

    const tabChecks = ["Sektioner", "Video", "Podcast", "Gemt"];

    for (const tab of tabChecks) {
      allureReporter.startStep(`Tap bottom tab: ${tab}`);
      await forsidePage.tapBottomNavItem(browser, tab, 3000);
      allureReporter.endStep("passed");

      allureReporter.startStep(`Validate tab landing signal: ${tab}`);
      const timeout = tab === "Podcast" ? 8000 : 5000;
      await forsidePage.waitForBottomTabLandingSignal(browser, tab, timeout);
      allureReporter.endStep("passed");
    }

    allureReporter.startStep("Return to Forside after bottom tab checks");
    await forsidePage.tapBottomNavItem(browser, "Forside", 3000);
    await forsidePage.waitForBottomNavItem(browser, "Forside", 3000);
    allureReporter.endStep("passed");
  });
});
