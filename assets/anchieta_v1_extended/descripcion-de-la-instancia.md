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