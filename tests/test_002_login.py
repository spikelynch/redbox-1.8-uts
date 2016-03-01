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
        assert(passwd)
        self.log_in(TARGET, LOGIN, passwd)
        wait = WebDriverWait(self.driver, 10)
        elt = wait.until(EC.invisibility_of_element_located((By.XPATH, '//div[@aria-describedby="login-form"]')))
        assert(True)


class TestBadLogin(redbox.RedboxTestCase):

    def test(self):
        passwd = self.identity(TARGET, LOGIN)
        assert(passwd)
        passwd += "bad"
        self.log_in(TARGET, LOGIN, passwd)
        dialog_gone = True
        try:
            wait = WebDriverWait(self.driver, 10)
            elt = wait.until(EC.invisibility_of_element_located((By.XPATH, '//div[@aria-describedby="login-form"]')))
        except selenium.common.exceptions.TimeoutException as e:
            assert(True)
            dialog_gone = False
        except Exception:
            assert(False)
        assert(not dialog_gone)


if __name__ == "__main__":
    nose.main()
