#!/usr/bin/env python

import unittest
from selenium import webdriver
from sickle import Sickle

import rbtests


class OaiCase(unittest.TestCase):

    def setUp(self):
        self.oai = Sickle(rbtests.OAIPMH_URL)




class UpOaiPmh(OaiCase):

    def test_identify(self):
        response = self.oai.Identify()
        self.assertIsNotNone(response)


class GetRecords(OaiCase):

    def test_identity(self):
        records = self.oai.ListRecords(metadataPrefix = 'oai_dc')
        self.assertIsNotNone(records)


if __name__ == "__main__":
    unittest.main()
