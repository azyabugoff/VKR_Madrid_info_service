import csv
import matplotlib.pyplot as plt

origins = dict()
origins = {'SG': 1045, 'EM': 39490, 'US': 22388, 'IT': 33552, 'CN': 22838, 'BY': 2037, 'PT': 1066, 'RS': 770, 'KZ': 972, 'DE': 53363, 'BX': 19138, 'ES': 8486, 'TR': 9163, 'UA': 3480, 'GE': 205, 'LT': 849, 'VN': 470, 'FR': 39996, 'KR': 2877, 'LV': 1235, 'GB': 8297, 'CH': 28215, 'PL': 4258, 'AU': 2642, 'GR': 443, 'BG': 2446, 'RO': 559, 'JP': 7116, 'DK': 2712, 'AM': 267, 'CZ': 4790, 'AT': 6916, 'TH': 57, 'SI': 1583, 'SK': 1135, 'HU': 3378, 'IL': 770, 'NZ': 328, 'HR': 582, 'IR': 206, 'IN': 333, 'FI': 2675, 'MD': 602, 'CY': 184, 'UZ': 69, 'IS': 274, 'SY': 26, 'NO': 1350, 'SE': 2262, 'MA': 193, 'MK': 88, 'EG': 228, 'EE': 512, 'MX': 70, 'ME': 44, 'CO': 20, 'MC': 598, 'AZ': 100, 'IE': 509, 'MN': 30, 'LI': 1467, 'YU': 336, 'CS': 547, 'DT': 7887, 'DD': 131, 'CA': 127, 'KP': 39, 'CU': 78, 'BR': 23, 'SM': 190, 'CW': 26, 'TN': 31, 'TJ': 10, 'MY': 11, 'PH': 49, 'KG': 48, 'TM': 3, 'BA': 74, 'AL': 22, 'AN': 45, 'OA': 3, 'BQ': 1, 'KE': 12, 'DZ': 64, 'MG': 1, 'SX': 1, 'ID': 13, 'AG': 2, 'LA': 1, 'OM': 6, 'KH': 1, 'BW': 2, 'ZW': 1, 'SU': 1, 'NA': 1, 'BH': 3, 'MZ': 1}
l_origins = list(origins.items())
l_origins.sort(key=lambda i: i[1], reverse=True)
#make csv table
desigs_countries = dict()
with open("desigs_countries.csv", newline = '') as csvfile:
    reader = csv.DictReader(csvfile, delimiter = ";")
    for row in reader:
        desigs_countries.update({row['КОД'] : row['ГОСУДАРСТВО ИЛИ МЕЖПРАВИТЕЛЬСТВЕННАЯ ОРГАНИЗАЦИЯ']})
with open("stats_in_RU.csv", 'w', newline = '') as csvfile:
    writer = csv.writer(csvfile, delimiter = ";")
    writer.writerow(["Государство или межправительственная организация", "Код", "Количество заявок из России в другие страны"])
    for i in l_origins:
        if (i[0] != ' '):
            writer.writerow([desigs_countries[i[0]], i[0], i[1]])
#make histogram
x = []
y = []
for i in l_origins:
    x.append(i[0])
    y.append(i[1])
plt.bar(range(len(x)), y, tick_label=x, align='center', width=0.8)
plt.xticks(rotation=90)
plt.title("Applications from other countries to Russia")
plt.xlabel("other countries")
plt.show()
