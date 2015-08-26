#!/usr/bin/env python

import unittest
from selenium import webdriver
from sickle import Sickle

import rbtests



class UpOaiPmh(unittest.TestCase):

    def setUp(self):
        self.oai = Sickle(rbtests.OAIPMH_URL)

    def test_identify(self):
        response = self.oai.Identify()
        self.assertIsNotNone(response)



if __name__ == "__main__":
    unittest.main()
