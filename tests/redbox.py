# shared code and config stuff

import unittest, yaml
from selenium import webdriver
from sickle import Sickle
from urllib.parse import quote

CONFIG = 'config.yml'

class RedboxTestCase(unittest.TestCase):
    """Test case with common methods for ReDBox tests, urls, etc"""

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.cf = None
        with open(CONFIG) as conf_f:
            try:
                self.cf = yaml.load(conf_f)
            except yaml.YAMLError as exc:
                print("%s parse error: %s" % ( CONFIG, exc ))
                if hasattr(exc, 'problem_mark'):
                    mark = exc.problem_mark
                    print("Error position: (%s:%s)" % (mark.line + 1, mark.column + 1))
        if not self.cf:
            print("Config error")
            sys.exit(-1)

    def tearDown(self):
        self.driver.close()

    def server(self, server):
        if not server in self.cf['Servers']:
            print("Unknown server %s" % server)
            sys.exit(-1)
        return self.cf['Servers'][server]
        
        
    def url(self, server, *args):
        s = self.server(server)
        urlbase = s['base'] + s['version']
        if args:
            return urlbase + args[0]
        else:
            return urlbase

    def search(self, server, id):
        """Note: search doesn't use the version in the path"""
        s = self.server(server)
        return s['base'] + self.cf['Paths']['search'] % quote(id)
    

    def oai(self, server, request):
        """Note: oai doesn't use the version in the path"""
        s = self.server(server)
        url = s['base'] + self.cf['Paths']['oai_pmh']
        self.oai_sickle = Sickle(url)
        return self.oai_sickle(request)
