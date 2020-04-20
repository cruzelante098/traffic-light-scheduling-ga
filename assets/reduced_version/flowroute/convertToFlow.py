import pandas as pd
import re
import unidecode

hour = 14
filename = "datos_aforo_cabildo/padre-anchieta_guajara_2020-02-27_vehiculos-normales_sin-agrupar.csv"
output_filename = f"flow_TF-5_2020-02-27_{hour}h_normal.csv"

df = pd.read_csv(filename, header=0, index_col=0)
traffic_data = df.loc[hour]


def get_lane_name(lane):
    values = lane.split(';')
    station_point = values[2].strip().lower().replace(" ", "_")
    direction = unidecode.unidecode(
        re.search(r'.*([DC].*)', values[3])
        .group(1)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("c.", "creciente")
        .replace("d.", "decreciente"))
    return station_point + "_" + direction


stations = list(map(get_lane_name, traffic_data.index.values))
flows = traffic_data.values

header = ["Detector", "Time", "qPKW", "qLKW"]
data = []

avg_lane_speed = {
    "lento": 90,
    "medio": 110,
    "mediolento": 110,
    "mediorapido": 120,
    "rapido": 125,
}

for station, flow in zip(stations, flows):
    lane_info = station.split("_")
    lane_type = lane_info[-1] if lane_info[-2] != "medio" else lane_info[-2] + lane_info[-1]
    row = [station, 60, flow, avg_lane_speed[lane_type]]
    data.append(row)


df = pd.DataFrame(data, columns=header)
df = df.sort_values(by=["Detector"])

print(f"Saving to {output_filename}...")

print(df.to_csv(sep=";",header=True, index=False))
df.to_csv(path_or_buf=output_filename, sep=";",header=True, index=False)
