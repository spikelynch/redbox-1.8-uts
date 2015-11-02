#!/usr/bin/env python3

import unittest
from rbtests import OaiCase




class UpOaiPmh(OaiCase):

    def test_identify(self):
        response = self.oai.Identify()
        self.assertIsNotNone(response)


class GetRecords(OaiCase):

    def test_records(self):
        records = self.oai.ListRecords(metadataPrefix = 'oai_dc')
        self.assertIsNotNone(records)


if __name__ == "__main__":
    unittest.main()
