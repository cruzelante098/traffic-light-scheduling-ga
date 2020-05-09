import xml.etree.ElementTree as ET
from random import random


# Open original file
tree = ET.parse('../instances/anchieta_no_tls_many_pedestrians/peatones_aleatorios.rou.xml')

root = tree.getroot()
to_delete = []

for i in range(len(root)):
    if random() > 0.25:
        to_delete.append(i)

i = 0
for x in to_delete:
    del root[x - i]
    i += 1

print(len(root))

tree.write('../instances/anchieta_no_tls_few_pedestrians/peatones_aleatorios.rou.xml')