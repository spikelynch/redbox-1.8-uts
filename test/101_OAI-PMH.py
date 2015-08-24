#!/usr/bin/env python

import unittest
from selenium import webdriver

# import my-spiffy-test-utility-module

REDBOX_URL = 'http://redboxvm:9000/redbox/'

REDBOX_VERSION = 'verNum1.9-UTS'

OAIPMH_URL = REDBOX_URL + 'default/feed/oai?verb=ListRecords&metadataPrefix=oai_dc'



class OaiPmh(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()

    def test_oaipmh(self):
        driver = self.driver
        driver.get(OAIPMH_URL)
        self.assertIn("OAI 2.0 Request Results", driver.title)

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()
