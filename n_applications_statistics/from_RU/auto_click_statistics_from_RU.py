from selenium import webdriver
import time
import matplotlib.pyplot as plt
import csv

chromedriver = "./chromedriver/chromedriver"
browser = webdriver.Chrome(chromedriver)
print("setting up the page...\n")
browser.get('https://www3.wipo.int/madrid/monitor/en/')
#search by RU origin
browser.find_element_by_css_selector('#advancedModeLink > span.modeText').click()
browser.find_element_by_css_selector('#OO_input').send_keys('RU')
browser.find_element_by_css_selector('#advanced_search_container > div.searchButtonContainer.bottom.right > a > span.ui-button-text').click()
time.sleep(2)
#choose number of rows
browser.find_element_by_css_selector('#rowCount1 > option:nth-child(4)').click()
time.sleep(3)
#make options
browser.find_element_by_css_selector('#results_container > div.results_navigation.top_results_navigation.displayButtons > div.results_pager.ui-widget-content > div.rowCountContainer.lightBackground > span > a').click()
browser.find_element_by_css_selector('#colchooser_gridForsearch_pane > div > div > div.selected > div > a').click()
browser.find_element_by_css_selector('#colchooser_gridForsearch_pane > div > div > div.available > ul > li:nth-child(4) > a > span').click()
browser.find_element_by_css_selector('#wipo-int > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.noClose.ui-dialog-buttons.ui-draggable > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(1) > span').click()
time.sleep(2)
#count number of pages
tmp_n_pages = browser.find_element_by_css_selector('#results_container > div.results_navigation.top_results_navigation.displayButtons > div.results_pager.ui-widget-content > div.arrow_container > div > div').text[2:]
tmp_l_n_pages = tmp_n_pages.split(sep = ",")
count_pages = ""
for spl_n_pages in tmp_l_n_pages:
    count_pages = count_pages + spl_n_pages
n_pages = int(count_pages)
#make statistics
print("getting information from madrid monitor pages...\n")
designations = dict()
for i in range(n_pages):
    rows = browser.find_elements_by_xpath('//*[@aria-describedby="gridForsearch_pane_DS"]')
    print("page number =", i + 1)
    j = 0
    for j in range(len(rows)):
        tmp_desig = rows[j].text.split(sep = ", ")
        for x in tmp_desig:
            if (x in designations):
                designations[x] = designations[x] + 1
            else:
                designations.update({x : 1})
    print("\n", designations, "\n")
    if (i < n_pages - 1):
        browser.find_element_by_css_selector('#results_container > div.results_navigation.top_results_navigation.displayButtons > div.results_pager.ui-widget-content > div.arrow_container > a:nth-child(4) > span.ui-button-icon-primary.ui-icon.ui-icon-triangle-1-e').click()
    time.sleep(1)
#finish
time.sleep(2)
browser.quit()
print("completed successfully!\n")
