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
    """Creates a DMP, filling the mandatory fields with random text"""
    
    def test(self):
        passwd = self.identity(TARGET, LOGIN)
        self.log_in(TARGET, LOGIN, passwd)
        driver = self.driver
        driver.get(self.dashboard(TARGET))
        new_dmpt = driver.find_element_by_id('new-dmpt')
        new_dmpt.click()
        dmpt_form = self.load_form('dmpt')
        i = 1
        for tab in dmpt_form.tabs:
            for field in tab.fields:
                if field.required:
                    field.fill(driver)
            self.next_tab(i)
            i += 1
        assert False 

        
if __name__ == "__main__":
    nose.main()
