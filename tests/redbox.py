# shared code and config stuff

import sys, unittest, yaml, json, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import selenium.common.exceptions
from sickle import Sickle
from urllib.parse import quote
from forms import RedboxForm, RedboxTab


CONFIG = 'config.yml'

# json config which define the form pages and fields
# for automatically generating fixtures

FORMS = {
    'dmpt': 'fixtures/dmptform.json',
    'dataset': 'fixtures/self-submissionform.json'
}

FORM_STAGES = {
    'dmpt': 'dmpt-draft',
    'dataset': 'dataset-draft'
}




class RedboxTestCase(unittest.TestCase):
    """Test case with common methods for ReDBox tests, urls, etc"""

    def setUp(self):
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
        browser = self.cf['Selenium']['browser']
        if browser == 'Chrome':
            self.driver = webdriver.Chrome(self.cf['Selenium']['chromedriver'])
        else:
            self.driver = webdriver.Firefox()
        self.timeout = int(self.cf['Selenium']['timeout'])
        self.pause = int(self.cf['Selenium']['pause'])
        self.xpaths = self.cf['XPaths']
        self.forms = {}

    def xpath(self, name):
        if name in self.xpaths:
            return self.xpaths[name]
        else:
            print("Unknown xpath %s" % name)
            sys.exit(-1)
            

    def load_form(self, section):
        if section not in self.forms:
            form_js = None
            with open(FORMS[section]) as form_f:
                try:
                    form_js = json.load(form_f)
                except Exception as exc:
                    print("%s parse error: %s" % ( FORMS[section], exc ))
            if not form_js:
                sys.exit(-1)
            divs = form_js["stages"][FORM_STAGES[section]]["divs"]
            self.forms[section] = RedboxForm(divs)
        return self.forms[section]

    
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

    def home(self, server):
        s = self.server(server)
        return s['base'] + self.cf['Paths']['home']
        
    def dashboard(self, server):
        s = self.server(server)
        return s['base'] + self.cf['Paths']['dashboard']

            
    def search(self, server, id):
        """Note: search doesn't use the version in the path"""
        s = self.server(server)
        return s['base'] + self.cf['Paths']['search'] % quote(id)
    

    def oai(self, server):
        """This returns a Sickle object initiated at the server's URL"""
        s = self.server(server)
        url = s['base'] + self.cf['Paths']['oai_pmh']
        self.sickle = Sickle(url)
        return self.sickle

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
        """This waits for the dialog box to go away"""
        self.log_in_no_check(server, uname, passwd)
        wait = WebDriverWait(self.driver, 10)
        elt = wait.until(EC.invisibility_of_element_located((By.XPATH, '//div[@aria-describedby="login-form"]')))
        return True

    
    def log_in_no_check(self, server, uname, passwd):
        """Version which doesn't check for success"""
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

    def log_out_no_check(self, server):
        """Version which doesn't check for success"""
        driver = self.driver
        driver.get(self.url(server))
        #user_info = driver.find_element_by_id("user-info")
        logout_link = driver.find_element_by_id("logout-now")
        assert(logout_link)
        logout_link.click()


        
# code for doing commonly-needed Selenium boilerplate

    def next_tab(self, i):
        self._diagnose_next(i)
        xp = self.xpath('next_btn').format(i)
        print("Trying next_btn {}: {}".format(i, xp))
        wait = WebDriverWait(self.driver, self.timeout)
        next_btn = wait.until(EC.element_to_be_clickable((By.XPATH, xp)))
        next_btn.click()
        print("Clicked next_btn")
        print("Waiting for {}".format(self.pause))
        time.sleep(self.pause)

    def _diagnose_next(self, i):
        xp = self.xpath('next_btn').format(i)
        elts = self.driver.find_elements_by_xpath(xp)
        print("Looking for %s, found %d matches" % ( xp, len(elts)))
        for elt in elts:
            print(elt, elt.getLocation())    

        
