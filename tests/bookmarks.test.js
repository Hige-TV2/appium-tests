require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const testSetup = require("../utils/testSetup");
const forsidePage = require("../pages/forsidePage");
const bookmarksPage = require("../pages/bookmarksPage");

describe("Gemt", function () {
  this.timeout(90000);

  beforeEach(async () => {
    await testSetup.loginToFrontpageWithRecovery(browser);
  });

  it("should add and remove an article from Gemt", async () => {
    allureReporter.addFeature("Gemt");
    allureReporter.addStory("Bookmark Article Lifecycle");

    allureReporter.startStep("Go to Forside and wait for frontpage signals");
    await forsidePage.tapBottomNavItem(browser, "Forside", 3000);
    await forsidePage.waitForBottomNavItem(browser, "Forside", 3000);
    await forsidePage.waitForTopNavItem(browser, "Tophistorier", 7000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Open the first article on frontpage");
    await bookmarksPage.tapFirstArticleFromFrontpage(browser, 12000);
    await bookmarksPage.waitForArticleScreen(browser, 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Bookmark the article from article screen");
    await bookmarksPage.tapArticleBookmarkButton(browser, 6000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Open Gemt tab and wait for landing screen");
    await testSetup.openBottomTabAndWait(browser, "Gemt", {
      tapTimeout: 4000,
      landingTimeout: 8000,
      dismissPopupAttempts: 1,
    });
    await bookmarksPage.waitForBookmarksScreen(browser, 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep(
      "Verify search bar and bookmarked item are visible",
    );
    await bookmarksPage.waitForSearchBar(browser, 7000);
    await bookmarksPage.waitForBookmarkedListItem(browser, 7000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Open bookmarked article from Gemt list");
    await bookmarksPage.tapFirstBookmarkedListItem(browser, 7000);
    await bookmarksPage.waitForArticleScreen(browser, 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Unbookmark the article while on article screen");
    await bookmarksPage.tapArticleBookmarkButton(browser, 7000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Go back to Gemt list");
    await bookmarksPage.tapBackButton(browser, 7000);
    await bookmarksPage.waitForBookmarksScreen(browser, 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Verify Gemt list is empty");
    await bookmarksPage.waitForEmptyBookmarkList(browser, 8000);
    allureReporter.endStep("passed");
  });
});
