require("dotenv").config();
const allureReporter = require("@wdio/allure-reporter").default;
const authHelper = require("../utils/authHelper");
const helpers = require("../utils/helpers");
const forsidePage = require("../pages/forsidePage");
const sektionerPage = require("../pages/sektionerPage");

describe("Sektioner", function () {
  this.timeout(90000);

  beforeEach(async () => {
    try {
      await authHelper.loginToFrontpage(browser);
    } catch (e) {
      await helpers.dismissBlockingPopups(browser, 2);
      await browser.pause(500);
      await authHelper.loginToFrontpage(browser);
    }

    await forsidePage.tapBottomNavItem(browser, "Sektioner", 3000);
    await forsidePage.waitForBottomTabLandingSignal(browser, "Sektioner", 5000);
    await sektionerPage.waitForSectionListContainer(browser, 6000);
  });

  it("should validate fixed sections and scroll sections", async () => {
    allureReporter.addFeature("Sektioner");
    allureReporter.addStory("Section List");

    const fixedSections = [
      "Business",
      "Echo",
      "Fodbold",
      "Klima",
      "Krimi",
      "Livsstil",
      "Podcast",
      "Politik",
    ];

    for (const section of fixedSections) {
      allureReporter.startStep(`Validate visible section: ${section}`);
      await sektionerPage.waitForSectionVisible(browser, section, 3000);
      allureReporter.endStep("passed");
    }

    const scrolledSections = [
      "Programmer",
      "Regionale nyheder",
      "Sport",
      "Udland",
      "Underholdning",
      "Vejr",
    ];

    for (const section of scrolledSections) {
      allureReporter.startStep(`Scroll and validate section: ${section}`);
      await sektionerPage.scrollToSection(browser, section, 9000);
      await sektionerPage.waitForSectionVisible(browser, section, 3000);
      allureReporter.endStep("passed");
    }
  });

  it("should open selected sections and validate destination", async () => {
    allureReporter.addFeature("Sektioner");
    allureReporter.addStory("Section Navigation");

    const sectionTargets = ["Politik"];

    for (const section of sectionTargets) {
      allureReporter.startStep("Reset Sektioner list to top");
      await sektionerPage.scrollListToTop(browser, 6);
      await sektionerPage.waitForSectionListContainer(browser, 6000);
      allureReporter.endStep("passed");

      allureReporter.startStep(`Open section: ${section}`);
      await sektionerPage.tapSection(browser, section, 9000);
      allureReporter.endStep("passed");

      allureReporter.startStep(`Validate section title: ${section}`);
      await sektionerPage.waitForSectionDetailTitle(browser, section, 6000);
      allureReporter.endStep("passed");

      allureReporter.startStep(`Validate article signal in ${section}`);
      await sektionerPage.waitForAnyArticleSignal(browser, 6000);
      allureReporter.endStep("passed");

      allureReporter.startStep("Go back to Sektioner list");
      await helpers.pressBackButton(browser);
      await helpers.dismissBlockingPopups(browser, 1);
      await sektionerPage.waitForSectionListContainer(browser, 6000);
      allureReporter.endStep("passed");
    }
  });
});
