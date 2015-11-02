#!/usr/bin/env python3

import unittest
from selenium import webdriver
from sickle import Sickle

import rbtests

USER = '960700'
PASS = 'FlumM3x'


oai = Sickle(rbtests.OAIPMH_URL)

sel = webdriver.Firefox()


records = oai.ListRecords(metadataPrefix = 'oai_dc')
for record in records:
    assert('identifier' in record.metadata)
    title = record.metadata['title']
    identifier = record.metadata['identifier']
    print "Search: %s" % ( identifier )
    sel.get(rbtests.REDBOX_URL)
    search_elt = sel.find_element_by_id('search-form')
    if search_elt:
        search_elt.clear()
        search_elt.send_keys(identifier)
        search_elt.submit()
