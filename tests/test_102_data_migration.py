#!/usr/bin/env python3

from __future__ import print_function
import unittest
from selenium import webdriver
from sickle import Sickle

import redbox

    
class TestFindRecords(redbox.RedboxTestCase):

    def setUp(self):
        super(TestFindRecords, self).setUp()
        cf = self.cf['test_102_data_migration']
        self.source = cf['source']
        self.target = cf['target']
        self.results_str = cf['results_str']

    def test(self):
        """
Fetches all the public records in one ReDBox instance (SOURCE) and looks them
up in another (TARGET)
""" 
        records = self.oai(self.source).ListRecords(metadataPrefix = 'oai_dc')
        for record in records:
            assert('identifier' in record.metadata, msg="Found identifier")
            titles = record.metadata['title']
            identifiers = record.metadata['identifier']
            if titles and identifiers:
                title = titles[0]
                identifier = identifiers[0]
                url = self.search(self.target, identifier)
                self.driver.get(url)
                self.check_results("Search for '{}' {}".format(title, identifier))
                

    def check_results(self, message):
        """
Looks in the ReDBox search results page and checks that the 'results-total'
element has the text in RESULT_STR
"""
        count_elts = self.driver.find_elements_by_class_name('results-total')
        assert(count_elts, msg="Search for {}".format(message))
        if count_elts:
            count_elt = count_elts[0]
            assert(self.results_str in count_elt.text, msg="Got one search result for {}".format(message))

                
if __name__ == "__main__":
    nosetests.main()
