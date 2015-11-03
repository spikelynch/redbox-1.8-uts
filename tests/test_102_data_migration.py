#!/usr/bin/env python3

from __future__ import print_function
import unittest
from selenium import webdriver
from sickle import Sickle

from rbtests import OaiCase, search_url

# Data migration tester - fetch a list of identifiers from the old
# ReDBox and try to look them up in the new one.


RESULT_STR="Showing 1 to 1 of 1 items"

    




class FindRecords(OaiCase):

    def setUp(self):
        super(FindRecords, self).setUp()
        self.driver = webdriver.Firefox()

    def check_results(self):
        count_elts = self.driver.find_elements_by_class_name('results-total')
        assert(count_elts)
        if count_elts:
            count_elt = count_elts[0]
            assert(RESULT_STR in count_elt.text)


    def test_find_records(self):
        records = self.oai.ListRecords(metadataPrefix = 'oai_dc')
        for record in records:
            assert('identifier' in record.metadata)
            titles = record.metadata['title']
            identifiers = record.metadata['identifier']
            if titles and identifiers:
                title = titles[0]
                identifier = identifiers[0]
                url = search_url(identifier)
                self.driver.get(url)
                self.check_results()
                

if __name__ == "__main__":
    unittest.main()
