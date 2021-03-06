/**
 * @jest-environment ./lib/puppeteer/environment.js
 */
/* eslint-env jest */

const devices = require('puppeteer/DeviceDescriptors')
const iPhone = devices['iPhone 6']
// const iPad = devices['iPad landscape']
const configPaths = require('../../../config/paths.json')
const PORT = configPaths.ports.test

let browser
let page
let baseUrl = 'http://localhost:' + PORT

beforeAll(async (done) => {
  browser = global.__BROWSER__
  page = await browser.newPage()
  done()
})

afterAll(async (done) => {
  await page.close()
  done()
})

describe('/components/tabs', () => {
  describe('/components/tabs/preview', () => {
    describe('when JavaScript is unavailable or fails', () => {
      it('falls back to making all tab containers visible', async () => {
        await page.setJavaScriptEnabled(false)
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })
        const isContentVisible = await page.waitForSelector('.govuk-tabs__panel', { visible: true, timeout: 1000 })
        expect(isContentVisible).toBeTruthy()
      })
    })

    describe('when JavaScript is available', () => {
      it('should indicate the open state of the first tab', async () => {
        await page.setJavaScriptEnabled(true)
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })

        const firstTabAriaSelected = await page.evaluate(() => document.body.querySelector('.govuk-tabs__list-item:first-child .govuk-tabs__tab').getAttribute('aria-selected'))
        expect(firstTabAriaSelected).toEqual('true')
      })

      it('should display the first tab panel', async () => {
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })

        const tabPanelIsHidden = await page.evaluate(() => document.body.querySelector('.govuk-tabs > .govuk-tabs__panel').classList.contains('govuk-tabs__panel--hidden'))
        expect(tabPanelIsHidden).toBeFalsy()
      })

      it('should hide all the tab panels except for the first one', async () => {
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })

        const tabPanelIsHidden = await page.evaluate(() => document.body.querySelector('.govuk-tabs > .govuk-tabs__panel ~ .govuk-tabs__panel').classList.contains('govuk-tabs__panel--hidden'))
        expect(tabPanelIsHidden).toBeTruthy()
      })
    })

    describe('when a tab is pressed', () => {
      it('should indicate the open state of the pressed tab', async () => {
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })

        // Click the second tab
        await page.click('.govuk-tabs__list-item:nth-child(2) .govuk-tabs__tab')

        const secondTabAriaSelected = await page.evaluate(() => document.body.querySelector('.govuk-tabs__list-item:nth-child(2) .govuk-tabs__tab').getAttribute('aria-selected'))
        expect(secondTabAriaSelected).toEqual('true')
      })

      it('should display the tab panel associated with the selected tab', async () => {
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })

        // Click the second tab
        await page.click('.govuk-tabs__list-item:nth-child(2) .govuk-tabs__tab')

        const secondTabPanelIsHidden = await page.evaluate(() => {
          const secondTabAriaControls = document.body.querySelector('.govuk-tabs__list-item:nth-child(2) .govuk-tabs__tab').getAttribute('aria-controls')
          return document.body.querySelector(`[id="${secondTabAriaControls}"]`).classList.contains('govuk-tabs__panel--hidden')
        })
        expect(secondTabPanelIsHidden).toBeFalsy()
      })
    })

    describe('when first tab is focused and the right arrow key is pressed', () => {
      it('should indicate the open state of the next tab', async () => {
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })

        // Press right arrow when focused on the first tab
        await page.focus('.govuk-tabs__list-item:first-child .govuk-tabs__tab')
        await page.keyboard.press('ArrowRight')

        const secondTabAriaSelected = await page.evaluate(() => document.body.querySelector('.govuk-tabs__list-item:nth-child(2) .govuk-tabs__tab').getAttribute('aria-selected'))
        expect(secondTabAriaSelected).toEqual('true')
      })

      it('should display the tab panel associated with the selected tab', async () => {
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })

        // Press right arrow
        await page.focus('.govuk-tabs__list-item:first-child .govuk-tabs__tab')
        await page.keyboard.down('ArrowRight')

        const secondTabPanelIsHidden = await page.evaluate(() => {
          const secondTabAriaControls = document.body.querySelector('.govuk-tabs__list-item:nth-child(2) .govuk-tabs__tab').getAttribute('aria-controls')
          return document.body.querySelector(`[id="${secondTabAriaControls}"]`).classList.contains('govuk-tabs__panel--hidden')
        })
        expect(secondTabPanelIsHidden).toBeFalsy()
      })
    })

    describe('when a hash associated with a tab panel is passed in the URL', () => {
      it('should indicate the open state of the associated tab', async () => {
        await page.goto(baseUrl + '/components/tabs/preview/#past-week', { waitUntil: 'load' })

        const currentTabAriaSelected = await page.evaluate(() => document.body.querySelector('.govuk-tabs__tab[href="#past-week"]').getAttribute('aria-selected'))
        expect(currentTabAriaSelected).toEqual('true')

        const currentTabPanelIsHidden = await page.evaluate(() => document.getElementById('past-week').classList.contains('govuk-tabs__panel--hidden'))
        expect(currentTabPanelIsHidden).toBeFalsy()
      })
    })

    describe('when rendered on a small device', () => {
      it('falls back to making the all tab containers visible', async () => {
        await page.emulate(iPhone)
        await page.goto(baseUrl + '/components/tabs/preview', { waitUntil: 'load' })
        const isContentVisible = await page.waitForSelector('.govuk-tabs__panel', { visible: true, timeout: 1000 })
        expect(isContentVisible).toBeTruthy()
      })
    })
  })
})
