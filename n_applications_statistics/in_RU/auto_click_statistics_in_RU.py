from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import matplotlib.pyplot as plt

chromedriver = "./chromedriver/chromedriver"
browser = webdriver.Chrome(chromedriver)
print("setting up the page...\n")
browser.get('https://www3.wipo.int/madrid/monitor/en/')
#search by RU designation
browser.find_element_by_css_selector('#advancedModeLink > span.modeText').click()
browser.find_element_by_css_selector('#DS_input').send_keys('RU')
browser.find_element_by_css_selector('#advanced_search_container > div.searchButtonContainer.bottom.right > a > span.ui-button-text').click()
time.sleep(2)
#choose number of rows
browser.find_element_by_css_selector('#rowCount1 > option:nth-child(4)').click()
time.sleep(3)
#make options
browser.find_element_by_css_selector('#results_container > div.results_navigation.top_results_navigation.displayButtons > div.results_pager.ui-widget-content > div.rowCountContainer.lightBackground > span > a').click()
browser.find_element_by_css_selector('#colchooser_gridForsearch_pane > div > div > div.selected > div > a').click()
browser.find_element_by_css_selector('#wipo-int > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.noClose.ui-dialog-buttons.ui-draggable > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(1) > span').click()
time.sleep(2)
#count number of pages
tmp_n_pages = browser.find_element_by_css_selector('#results_container > div.results_navigation.top_results_navigation.displayButtons > div.results_pager.ui-widget-content > div.arrow_container > div > div').text[2:]
tmp_l_n_pages = tmp_n_pages.split(sep = ",")
count_pages = ""
for spl_n_pages in tmp_l_n_pages:
    count_pages = count_pages + spl_n_pages
n_pages = int(count_pages)
#open from the needed page
browser.find_element_by_css_selector('#skipValue1').clear()
browser.find_element_by_css_selector('#skipValue1').send_keys("3420", Keys.ENTER) #page-------------
time.sleep(2)
#make statistics
print("getting information from madrid monitor pages...\n")
origins = dict()
origins = {'SG': 980, 'EM': 38967, 'US': 21073, 'IT': 32187, 'CN': 20291, 'BY': 2020, 'PT': 996, 'RS': 755, 'KZ': 948, 'DE': 49662, 'BX': 18062, 'ES': 8046, 'TR': 8429, 'UA': 3378, 'GE': 198, 'LT': 847, 'VN': 442, 'FR': 38061, 'KR': 2664, 'LV': 1216, 'GB': 7736, 'CH': 25674, 'PL': 4119, 'AU': 2599, 'GR': 411, 'BG': 2170, 'RO': 521, 'JP': 6858, 'DK': 2598, 'AM': 251, 'CZ': 4702, 'AT': 6608, 'TH': 52, 'SI': 1542, 'SK': 1115, 'HU': 3312, 'IL': 762, 'NZ': 322, 'HR': 564, 'IR': 152, 'IN': 268, 'FI': 2641, 'MD': 591, 'CY': 161, 'UZ': 65, 'IS': 267, 'SY': 24, 'NO': 1300, 'SE': 2223, 'MA': 175, 'MK': 83, 'EG': 144, 'EE': 511, 'MX': 68, 'ME': 41, 'CO': 18, 'MC': 566, 'AZ': 96, 'IE': 459, 'MN': 30, 'LI': 1307, 'YU': 333, 'CS': 544, 'DT': 7738, 'DD': 130, 'CA': 123, 'KP': 39, 'CU': 63, 'BR': 20, 'SM': 187, 'CW': 24, 'TN': 27, 'TJ': 10, 'MY': 11, 'PH': 45, 'KG': 46, 'TM': 3, 'BA': 73, 'AL': 19, 'AN': 41, 'OA': 3, 'BQ': 1, 'KE': 8, 'DZ': 61, 'MG': 1, 'SX': 1, 'ID': 7, 'AG': 2, 'LA': 1, 'OM': 6, 'KH': 1, 'BW': 2, 'ZW': 1, 'SU': 1}
for i in range(3419, n_pages): #page - 1------------------------------------------------------------
    time.sleep(1)
    rows = browser.find_elements_by_xpath('//*[@aria-describedby="gridForsearch_pane_OO"]')
    print("page number =", i + 1)
    j = 0
    for j in range(len(rows)):
        tmp_orig = rows[j].text
        if (tmp_orig in origins):
            origins[tmp_orig] = origins[tmp_orig] + 1
        else:
            origins.update({tmp_orig : 1})
    print("\n", origins, "\n")
    if (i < n_pages - 1):
        browser.find_element_by_css_selector('#results_container > div.results_navigation.top_results_navigation.displayButtons > div.results_pager.ui-widget-content > div.arrow_container > a:nth-child(4) > span.ui-button-icon-primary.ui-icon.ui-icon-triangle-1-e').click()
    time.sleep(1)
#finish
time.sleep(2)
browser.quit()
print("completed successfully!\n")