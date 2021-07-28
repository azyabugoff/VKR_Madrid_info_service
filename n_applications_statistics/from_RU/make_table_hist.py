import csv
import matplotlib.pyplot as plt

designations = dict()
designations = {'AM': 8309, 'AZ': 8281, 'BY': 13443, 'CN': 8604, 'EM': 3372, 'GE': 6156, 'KG': 7961, 'KZ': 14451, 'MD': 7212, 'MN': 2869, 'TJ': 6613, 'TM': 5163, 'UA': 12296, 'US': 4511, 'UZ': 6612, 'DE': 5606, 'IL': 1710, 'LT': 5481, 'LV': 5719, 'AT': 2621, 'BX': 2652, 'CA': 425, 'CH': 2738, 'FI': 2250, 'FR': 4090, 'GB': 3615, 'IN': 1495, 'IT': 4026, 'JP': 1914, 'KR': 1945, 'MX': 897, 'RS': 2808, 'VN': 2440, 'DK': 1592, 'PL': 4102, 'BR': 167, 'CO': 371, 'ES': 3444, 'GR': 2168, 'PT': 2005, 'EG': 1715, 'ID': 398, 'PH': 505, 'SG': 1371, 'TH': 336, 'TR': 3549, 'CY': 1693, 'CZ': 3333, 'EE': 4660, 'IE': 1181, 'SE': 1865, 'KE': 500, 'BG': 3377, 'SI': 2197, 'AU': 1579, 'KP': 863, 'NZ': 402, 'NO': 1766, 'HR': 2191, 'HU': 2707, 'RO': 2679, 'SK': 2648, 'MC': 913, 'KH': 196, 'MY': 82, 'AL': 896, 'SD': 572, 'AF': 112, 'OA': 259, 'ME': 1675, 'BA': 1620, 'IS': 838, 'LI': 783, 'MK': 1661, 'SM': 538, 'CU': 868, 'DZ': 1163, 'IR': 1460, 'MA': 988, 'MZ': 342, 'TN': 352, 'ZM': 306, 'ZW': 109, 'AG': 252, 'BH': 372, 'BN': 67, 'GH': 283, 'GM': 86, 'LR': 371, 'MG': 237, 'MW': 41, 'NA': 288, 'OM': 423, 'SL': 301, 'SY': 676, 'WS': 12, 'LA': 124, 'RW': 109, 'BT': 248, 'BW': 218, 'CW': 193, 'ST': 158, 'SX': 190, 'SZ': 328, 'LS': 258, 'BQ': 200, ' ': 14, 'CS': 1, 'YU': 4, 'AN': 1}
l_designations = list(designations.items())
l_designations.sort(key=lambda i: i[1], reverse=True)
#make csv table
desigs_countries = dict()
with open("desigs_countries.csv", newline = '') as csvfile:
    reader = csv.DictReader(csvfile, delimiter = ";")
    for row in reader:
        desigs_countries.update({row['КОД'] : row['ГОСУДАРСТВО ИЛИ МЕЖПРАВИТЕЛЬСТВЕННАЯ ОРГАНИЗАЦИЯ']})
with open("stats_from_RU.csv", 'w', newline = '') as csvfile:
    writer = csv.writer(csvfile, delimiter = ";")
    writer.writerow(["Государство или межправительственная организация", "Код", "Количество заявок из других стран в Россию"])
    for i in l_designations:
        if (i[0] != ' '):
            writer.writerow([desigs_countries[i[0]], i[0], i[1]])
#make histogram
x = []
y = []
for i in l_designations:
    x.append(i[0])
    y.append(i[1])
plt.bar(range(len(x)), y, tick_label=x, align='center', width=0.8)
plt.xticks(rotation=90)
plt.title("Applications from Russia to other countries")
plt.xlabel("other countries")
plt.show()