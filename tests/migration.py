#!/usr/bin/env python3

from __future__ import print_function
import unittest
from selenium import webdriver
from sickle import Sickle

import rbtests




oai = Sickle(rbtests.OAIPMH_URL)

sel = webdriver.Firefox()



RESULT_STR = "Showing 1 to 1 of 1 items"


records = oai.ListRecords(metadataPrefix = 'oai_dc')
for record in records:
    assert('identifier' in record.metadata)
    title = record.metadata['title'][0]
    identifier = record.metadata['identifier'][0]
    print("Record: %s: %s" % ( identifier, title ))
    url = rbtests.search_url(identifier)
    sel.get(url)
    count_elts = sel.find_elements_by_class_name('results-total')
    if count_elts:
        count_elt = count_elts[0]
        assert(RESULT_STR in count_elt.text)
