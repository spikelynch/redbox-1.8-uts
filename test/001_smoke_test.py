#!/usr/bin/env python

import unittest
from selenium import webdriver

REDBOX_URL = 'http://redboxvm:9000/redbox/'

REDBOX_VERSION = 'verNum1.9-UTS'

LINKS = {
    'Home': '/default/home',
    'About': '/default/about',
    'Browse': '/default/search'
}


def absUrl(rel):
    return REDBOX_URL + REDBOX_VERSION + rel



class ReDBoxIsUp(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()

    def test_for_redbox(self):
        driver = self.driver
        driver.get(REDBOX_URL)
        self.assertIn("UTS Research Data Catalogue", driver.title)
        elts = driver.find_elements_by_xpath("//ul[@class='nav main']/li/a")
        self.assertIsNotNone(elts)
        for elt in elts:
            text = elt.text
            href = elt.get_attribute('href')
            if text in LINKS:
                self.assertEqual(href, absUrl(LINKS[text]))
#             if elt:
#                 href = elt.get_attribute('href')
#                 self.assertEqual(href, url)


    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()
