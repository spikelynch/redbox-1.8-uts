#!/usr/bin/env python3


import rbtests
import unittest
import nose.tools as nt
from selenium import webdriver

LINKS = {
    'Home': '/default/home',
    'About': '/default/about',
    'Browse': '/default/search'
}


def absUrl(rel):
    return rbtests.REDBOX_URL + rbtests.REDBOX_VERSION + rel



class TestReDBoxIsUp(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()


    def test(self):
        driver = self.driver
        driver.get(rbtests.REDBOX_URL)
        assert("UTS Research Data Catalogue" in driver.title)
        elts = driver.find_elements_by_xpath("//ul[@class='nav main']/li/a")
        assert(elts)
        for elt in elts:
            text = elt.text
            href = elt.get_attribute('href')
            if text in LINKS:
                nt.eq_(href, absUrl(LINKS[text]))
#             if elt:
#                 href = elt.get_attribute('href')
#                 self.assertEqual(href, url)


    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    nose.main()
