#!/usr/bin/env python3


import redbox
import nose.tools as nt
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import selenium.common.exceptions

TARGET = 'Test'
LOGIN = 'researcher'

class TestCreateDMP(redbox.RedboxTestCase):

    def test(self):
        passwd = self.identity(TARGET, LOGIN)
        assert(passwd)
        self.log_in(TARGET, LOGIN, passwd)
        driver = self.driver
        driver.get(self.dashboard(TARGET))
        new_dmpt = driver.find_element_by_id('new-dmpt')
        new_dmpt.click()
        wait = WebDriverWait(self.driver, 10)
        next_btn = wait.until(EC.element_to_be_clickable((By.XPATH, '//div[@id="tab-1"]//button')))
        next_btn.click()



        
if __name__ == "__main__":
    nose.main()
