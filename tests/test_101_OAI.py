#!/usr/bin/env python3

import redbox
import nose.tools as nt

TARGET = 'Test'


class TestOaiPmhUp(redbox.RedboxTestCase):

    def test(self):
        response = self.oai(TARGET).Identify()
        assert(response)


class TestGetRecords(redbox.RedboxTestCase):

    def test(self):
        records = self.oai(TARGET).ListRecords(metadataPrefix = 'oai_dc')
        assert(records)


if __name__ == "__main__":
    nose.main()
