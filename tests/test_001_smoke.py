#!/usr/bin/env python3


import redbox
import unittest
import nose.tools as nt

LINKS = {
    'Home': '/default/home',
    'About': '/default/about',
    'Browse': '/default/search'
}

TARGET = 'Test'


class TestReDBoxIsUp(redbox.RedboxTestCase):

    def test(self):
        driver = self.driver
        url = self.url(TARGET)
        print("Trying server home page %s" % url)
        driver.get(self.url(TARGET))
        assert("UTS Research Data Catalogue" in driver.title)
        elts = driver.find_elements_by_xpath("//ul[@class='nav main']/li/a")
        assert(elts)
        for elt in elts:
            text = elt.text
            href = elt.get_attribute('href')
            if text in LINKS:
                nt.eq_(href, self.url(TARGET, LINKS[text]))

if __name__ == "__main__":
    nose.main()
