#!/usr/bin/env python3

import unittest
from selenium import webdriver
from sickle import Sickle

from rbtests import OaiCase

# Data migration tester - fetch a list of identifiers from the old
# ReDBox and try to look them up in the new one.





class FindRecords(OaiCase):

    def setup(self):
        self.driver = webdriver.Firefox()


    def test_find_records(self):
        records = self.oai.ListRecords(metadataPrefix = 'oai_dc')
        for record in records:
            for key, value in record.metadata.items():
                print "%s: %s" % ( key, value )

if __name__ == "__main__":
    unittest.main()
