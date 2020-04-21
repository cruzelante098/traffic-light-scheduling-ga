# Comparativa de IMD y aforo

> **Metodología**
>
> 1. Para inferir los datos de tráfico de las vías por horas se hace una simple regla de tres a partir de los datos provistos por la estación TF-5 Padre Anchieta.
>
>    $$\text{Datos de tráfico a las 8:00} = \frac{\text{IMD de la vía} \, * \, \text{Tráfico TF-5 8:00}}{\text{IMD TF-5}}$$
>
> 2. Para determinar el tráfico que circula en cada sentido de la vía (ascendente y descendente) se toma como punto de partida una distribución normal del tráfico total de la vía con parámetros 
>
> | Media | Varianza |
> | :--: | :--: |
> | $$mu=\frac{\text{Tráfico 8:00}}{2}$$ | $$sigma = \text{Tráfico 8:00} * 0.05$$ |
> La varianza es el 5% del tráfico en esa hora.
>
> El valor que devuelve la distribución normal, calculado aleatoriamente, luego se le resta al tráfico, con lo que nos quedan dos valores que sumados dan el total de tráfico de la vía a esa hora, solo que desagregados en tráfico ascendente y descendente.

## TF-5 Anchieta 

#### IMD 2018

| **Vehículo** | **IMD** |
| ----------- | ----------- |
| Normales | 110 841 |
| Pesados | 3088 |

#### Datos de tráfico — 27 feb. 2020

| **Tipo de tráfico** | **Hora** | Tráfico descendente | Tráfico ascendente |
| ----------- | ----------: | ----------: | ----------: |
| Normal | 8:00 | 3492 | 4007 |
| Normal | 14:00 | 5916 |               4774 |
| Pesado              |     8:00 |                 127 |                216 |
| Pesado              |    14:00 |                 118 | 205 |

## TF-24 La Esperanza

#### IMD 2018

| **Vehículo** | **IMD** |
| ----------- | ----------- |
| Normales | 14782 |
| Pesados | 521 |

#### Datos de tráfico ESTIMADOS — 27 feb. 2020

| **Tipo de tráfico** | **Hora** | Tráfico descendente | Tráfico ascendente |
| ------------------- | -------: | ------------------: | -----------------: |
| Normal              |     8:00 |                 416 |                584 |
| Normal              |    14:00 |                 713 |                712 |
| Pesado              |     8:00 |                  26 |                 31 |
| Pesado              |    14:00 |                  28 |                 26 |

## TF-263 Geneto

#### IMD 2018

| **Vehículo** | **IMD** |
| ----------- | ----------- |
| Normales | 9935 |
| Pesados | 361 |

#### Datos de tráfico ESTIMADOS — 27 feb. 2020

| **Tipo de tráfico** | **Hora** | Tráfico descendente | Tráfico ascendente |
| ------------------- | -------: | ------------------: | -----------------: |
| Normal              |     8:00 |                 354 |                318 |
| Normal              |    14:00 |                 318 |                520 |
| Pesado              |     8:00 |                  21 |                 19 |
| Pesado              |    14:00 |                  16 |                 21 |

## TF-265 Carretera del Nuriana (usados para calcular Av. Astrofísico)

#### IMD 2018

| **Vehículo** | **IMD** |
| ----------- | ----------- |
| Normales | 8730 |
| Pesados | 333 |

#### Datos de tráfico ESTIMADOS — 27 feb. 2020

Nota. El tráfico debería ser mayor en este punto, especialmente si hablamos de horas puntas.

| **Tipo de tráfico** | **Hora** | Tráfico descendente | Tráfico ascendente |
| ------------------- | -------: | ------------------: | -----------------: |
| Normal              |     8:00 |                 320 |                270 |
| Normal              |    14:00 |                 468 |                373 |
| Pesado              |     8:00 |                  17 |                 19 |
| Pesado              |    14:00 |                  16 |                 18 |

