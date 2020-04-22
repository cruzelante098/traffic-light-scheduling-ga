# Descripciones de las instancias

## Índice de contenidos

- `anchieta_v1_extended`: **[Actualmente no está siendo usada para la simulación].** Instancia inicial de la zona de la rotonda del Padre Anchieta, con la inclusión de varias vías circundantes tales como la TF-5, las calles Pedro Zerolo, Heraclio Sánchez, y Catedral; así como las avenidas Leonardo Torriani, Lora Tamayo, y los Menceyes (parcial); entre otras vías.
- `anchieta_v2_small`: Instancia de la zona de la rotonda del Padre Anchieta más restringida, con la principal inclusión de la TF-5 (y sus respectivas entradas y salidas de la rotonda) así como las salidas/incorporaciones que se encuentran a la altura del IES Viera y Clavijo.


## anchieta_v1_extended

### Descripción

**[Actualmente no está siendo usada para la simulación].** Instancia inicial de la zona de la rotonda del Padre Anchieta, con la inclusión de varias vías circundantes tales como la TF-5, las calles Pedro Zerolo, Heraclio Sánchez, y Catedral; así como las avenidas Leonardo Torriani, Lora Tamayo, y los Menceyes (parcial); entre otras vías.

### Red

- Colocación de semáforos en todas las salidas y entradas de la rotonda del Padre Anchieta (salvo en la entrada a la Av. Astrofísico, donde no hay semáforo), y otro más en la intersección del Camino San Francisco de Paula (TF-265) y la Av. Astrofísico Francisco Sánchez.

- El algoritmo evolutivo solo trabaja sobre los semáforos de la rotonda, ignorando al resto.

- No están representados los semáforos de la rotonda de Cruz de Piedra (por donde pasa el Tranvía).

- Modificación exhaustiva de las intersecciones de la rotonda para adaptarlas a la realidad. La conversión desde el archivo `osm` provisto por Open Street Map y convertido a un archivo de red gracias a `NETCONVERT` contiene muchas imperfecciones que han sido corregidas manualmente.

  > TODO: Añadir modificaciones realizadas.

- La incorporación a la TF-5 sentido norte desde la rotonda circundante al IES Viera y Clavijo no es posible al no estar representada en el archivo de red.

### Tráfico

- El tráfico ha sido generado aleatoriamente gracias a la herramienta `randomTrips.py`. No se corresponde demasiado con el tráfico real.

### Simulación

- El tráfico colapsa al cabo de media hora (aproximadamente) si durante la simulación se deshabilita el teletransporte de vehículos, llegando a detenerse completamente en toda la zona de la red. Esto podría deberse al bloqueo principal que se produce en la rotonda del Padre Anchieta, muy probablemente debido a los semáforos, lo que hace que todas las vías circundantes queden bloquedas.

## anchieta_v2_small

### Descripción

Instancia de la zona de la rotonda del Padre Anchieta más restringida, con la principal inclusión de la TF-5 (y sus respectivas entradas y salidas de la rotonda) así como las salidas/incorporaciones que se encuentran a la altura del IES Viera y Clavijo.

### Red

- Colocación de semáforos en todas las salidas y entradas de la rotonda del Padre Anchieta (salvo en la entrada a la Av. Astrofísico, donde no hay semáforo).

- La incorporación a la TF-5 sentido norte desde la rotonda circundante al IES Viera y Clavijo se ha modificado para permitir que los vehículos puedan incorporarse a la autopista. Sin embargo, por limitaciones de SUMO, no es posible prohibir que los vehículos de la autopista se pasen a esta salida (SUMO no soporta las prohibiciones asimétricas de cambio de carriles) aunque no parece afectar severamente a la simulación dado que los vehículos que quieren tomar esta salida lo hacen desde más atrás en el carril de la TF-5 que está habilitado para tomar dicha salida.

### Tráfico

- La generación del tráfico se ha realizado gracias a `DFROUTER` y `flowrouter.py`, dos herramientas que trae SUMO. En este caso, se ha partido de los siguientes datos de flujo de tráfico gracias a los contadores provistos por el Cabildo, respecto del día 27 de febrero de 2020 )por ser de los días que más tráfico hubo en lo que va de 2020) en dos rangos horarios distintos 8:00-9:00 y 14:00-15:00, por ser donde se acumula la mayor cantidad de tráfico del día, y con la inclusión de tráfico pesado.
  - Estación permanente Campus Guajara TF-5.
  - Estación permanente Padre Anchieta TF-5.
  - IMD TF-5.
  - IMD TF-24 La Esperanza, km 0.
  - IMD TF-263 Geneto, km 0.
  - IMD TF-265 Camino San Francisco de Paula, a la altura del IES Nuryana, km 0.
- Los datos del resto de vías de la rotonda (Av. Guimerá, Av. Trinidad, etc.) han sido estimados e introducidos manualmente en la simulación.
- La generación de rutas y flujos de tráfico ha sido generada con las herramientas antes mencionadas, a partir de los datos descritos.

### Simulación

- El tráfico es bastante más realista, pero sigue siendo necesario añadir más contadores, especialmente en las salidas y entradas a la autopista desde la rotonda. Los datos de los semáforos siguen siendo los de SUMO, con lo que se producen bloqueos totales si no se deshabilita la opción de teletransporte.

