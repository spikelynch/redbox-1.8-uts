#!/usr/bin/env python3


import redbox
import nose.tools as nt
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import selenium.common.exceptions

TARGET = 'Test'
LOGIN = 'researcher'

class TestGoodLogin(redbox.RedboxTestCase):

    def test(self):
        passwd = self.identity(TARGET, LOGIN)
        assert passwd, "Found identity for {} {}".format(TARGET, LOGIN)
        self.log_in_no_check(TARGET, LOGIN, passwd)
        wait = WebDriverWait(self.driver, 10)
        elt = wait.until(EC.invisibility_of_element_located((By.XPATH, '//div[@aria-describedby="login-form"]')))
        self.log_out_no_check(TARGET)
        self.driver.implicitly_wait(1)
        login_link = self.driver.find_elements_by_class_name("login-now")
        assert login_link, "We've logged out"



class TestBadLogin(redbox.RedboxTestCase):

    def test(self):
        passwd = self.identity(TARGET, LOGIN)
        assert passwd, "Found identity for {} {}".format(TARGET, LOGIN)
        passwd += "bad"
        self.log_in_no_check(TARGET, LOGIN, passwd)
        dialog_gone = True
        try:
            wait = WebDriverWait(self.driver, 10)
            elt = wait.until(EC.invisibility_of_element_located((By.XPATH, '//div[@aria-describedby="login-form"]')))
        except selenium.common.exceptions.TimeoutException as e:
            dialog_gone = False
        except Exception:
            assert(False)
        assert not dialog_gone, "Login with bad credentials failed"



        
if __name__ == "__main__":
    nose.main()
