# shared code and config stuff

import unittest
from sickle import Sickle
from urllib import quote

REDBOX_URL = 'https://redbox.research.uts.edu.au/redbox/'
REDBOX_VERSION = 'verNum1.6.2'
SEARCH_PATH = 'default/search?query=%s'
OAIPMH_URL = REDBOX_URL + 'published/feed/oai'

TEST_REDBOX_URL = 'http://redboxvm/redbox/'
TEST_REDBOX_VERSION = 'verNum1.9-UTS'
TEST_OAIPMH_URL = TEST_REDBOX_URL + 'published/feed/oai'

def search_url(id):
    safeid = quote(id)
    url = REDBOX_URL + ( SEARCH_PATH % safeid )
    return url

class OaiCase(unittest.TestCase):
    """A subclass which sets up a sickle OAI client"""
    def setUp(self):
        self.oai = Sickle(OAIPMH_URL)


