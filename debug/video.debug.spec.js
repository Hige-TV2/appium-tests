require("dotenv").config();
const fs = require("fs");
const path = require("path");
const allureReporter = require("@wdio/allure-reporter").default;
const authHelper = require("../utils/authHelper");
const helpers = require("../utils/helpers");
const forsidePage = require("../pages/forsidePage");
const videosPage = require("../pages/videosPage");
const selectorDebugHelper = require("./selectorDebugHelper");

function getRunLabel() {
  return new Date().toISOString().replace(/[.:]/g, "-");
}

function ensureDebugDir() {
  const dir = path.resolve(process.cwd(), "debug");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function collectElementState(driver, selector, label) {
  const element = await driver.$(`android=${selector}`);
  const exists = await element.isExisting();

  if (!exists) {
    return {
      label,
      selector,
      exists: false,
      displayed: false,
      childCount: 0,
      bounds: null,
      text: null,
      resourceId: null,
    };
  }

  let displayed = false;
  let childCount = 0;
  let bounds = null;
  let text = null;
  let resourceId = null;

  try {
    displayed = await element.isDisplayed();
  } catch (e) {
    displayed = false;
  }

  try {
    const children = await element.$$("./*");
    childCount = children.length;
  } catch (e) {
    childCount = 0;
  }

  try {
    bounds = await element.getAttribute("bounds");
  } catch (e) {
    bounds = null;
  }

  try {
    text = await element.getText();
  } catch (e) {
    text = null;
  }

  try {
    resourceId = await element.getAttribute("resource-id");
  } catch (e) {
    resourceId = null;
  }

  return {
    label,
    selector,
    exists,
    displayed,
    childCount,
    bounds,
    text,
    resourceId,
  };
}

async function captureVideoState(driver, label) {
  const debugDir = ensureDebugDir();
  const bundle = await selectorDebugHelper.captureDebugBundle(driver, label);

  const states = await Promise.all([
    collectElementState(
      driver,
      'new UiSelector().resourceId("dk.tv2.nyhedscenter:id/exo_ad_overlay")',
      "adOverlay",
    ),
    collectElementState(
      driver,
      'new UiSelector().resourceId("dk.tv2.nyhedscenter:id/region_dialog")',
      "regionDialog",
    ),
    collectElementState(
      driver,
      'new UiSelector().className("android.widget.SeekBar")',
      "seekBar",
    ),
    collectElementState(driver, 'new UiSelector().text("Del")', "delLabel"),
    collectElementState(driver, 'new UiSelector().text("Lyd")', "lydLabel"),
    collectElementState(
      driver,
      'new UiSelector().resourceId("dk.tv2.nyhedscenter:id/exo_content_frame")',
      "playerContainer",
    ),
  ]);

  const statePath = path.join(debugDir, `${label}-state.json`);
  fs.writeFileSync(statePath, JSON.stringify(states, null, 2), "utf-8");

  return {
    ...bundle,
    statePath,
  };
}

describe("Video Debug Selectors", function () {
  this.timeout(120000);

  it("captures video state artifacts before and after ad wait", async () => {
    allureReporter.addFeature("Video");
    allureReporter.addStory("Selector Debug");

    const runLabel = getRunLabel();

    allureReporter.startStep("Navigate to Video tab");
    await authHelper.loginToFrontpage(browser);
    await helpers.dismissBlockingPopups(browser, 1);
    await forsidePage.tapBottomNavItem(browser, "Video", 3000);
    await videosPage.waitForPlayerContainer(browser, 8000);
    await videosPage.waitForReelStateSettled(browser, 8000);
    allureReporter.endStep("passed");

    allureReporter.startStep("Capture initial Video state");
    const initial = await captureVideoState(
      browser,
      `video-initial-${runLabel}`,
    );
    allureReporter.addArgument("initialState", initial.statePath);
    allureReporter.addArgument("initialSource", initial.sourcePath);
    allureReporter.endStep("passed");

    allureReporter.startStep("Wait for ad to finish if present");
    const adWaitResult = await videosPage.waitForAdToFinish(browser, 22000);
    allureReporter.addArgument("adWaitResult", adWaitResult);
    allureReporter.endStep("passed");

    allureReporter.startStep("Capture post-wait Video state");
    const postWait = await captureVideoState(
      browser,
      `video-post-wait-${runLabel}`,
    );
    allureReporter.addArgument("postWaitState", postWait.statePath);
    allureReporter.addArgument("postWaitSource", postWait.sourcePath);
    allureReporter.endStep("passed");
  });
});
