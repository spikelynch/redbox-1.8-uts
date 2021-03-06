#!/usr/bin/env python3

import redbox
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
        driver.get(self.url(TARGET))
        assert "UTS Research Data Catalogue" in driver.title, "Page title OK"
        elts = driver.find_elements_by_xpath("//ul[@class='nav main']/li/a")
        assert elts, "Navigation links found"
        for elt in elts:
            text = elt.text
            href = elt.get_attribute('href')
            if text in LINKS:
                nt.eq_(href, self.url(TARGET, LINKS[text]), "Link {} to {}".format(text, LINKS[text]))

                
if __name__ == "__main__":
    nose.main()
