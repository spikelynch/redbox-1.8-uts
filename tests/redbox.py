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

    # Standard URLs
        
    def url(self, server, *args):
        s = self.server(server)
        if args:
            return s['base'] + s['version'] + args[0]
        else:
            return s['base'] + self.cf['Paths']['home']

    # Special URLs 
        
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

    # User passwords

    def identity(self, server, username):
        if server not in self.cf['Identities']:
            print("Server %s doesn't have an entry in Identities" % server)
            sys.exit(-1)
        users = self.cf['Identities'][server]
        if username not in users:
            print("User %s not listed in Identities for %s" % ( username, server))
            sys.exit(-1)
        return users[username]

    # Common UI actions

    def log_in(self, server, uname, passwd):
        driver = self.driver
        driver.get(self.url(server))
        print("Logging in as %s / %s" % ( uname, passwd ) )
        user_info = driver.find_element_by_id("user-info")
        login_link = user_info.find_element_by_class_name("login-now")
        assert(login_link)
        login_link.click()
        uname_field = driver.find_element_by_id("username")
        passwd_field = driver.find_element_by_id("password")
        submit_btn = driver.find_element_by_id("login-submit")
        assert(uname_field and passwd_field and submit_btn)
        uname_field.send_keys(uname)
        passwd_field.send_keys(passwd)
        submit_btn.click()
