# Inferencia entre grupos independientes

## Dos grupos
Para un resultado cuantitativo se ofrece una prueba t bilateral de Welch, diferencia de medias (B menos A), IC 95%, valor p, grados de libertad aproximados y g de Hedges.

## Tres o más grupos
Se ofrece ANOVA de Welch como contraste global de medias, con grados de libertad aproximados. Si el análisis global se ejecuta, se presentan comparaciones por pares mediante pruebas t de Welch bilaterales y ajuste de Holm de los valores p.

El ajuste de Holm controla el error familiar de las comparaciones por pares. Los intervalos de confianza por pares que se muestran son nominales, no ajustados por multiplicidad; deben interpretarse en consecuencia. Este procedimiento es una opción práctica de comparaciones múltiples, pero no equivale al procedimiento Games–Howell.

## Condiciones y límites
- Los métodos están destinados a grupos independientes y resultados cuantitativos.
- No usar con medidas pareadas, longitudinales/repetidas, conglomerados o participantes con varias observaciones dependientes.
- La independencia depende del diseño y no puede verificarse a partir de una columna CSV.
- Revisar valores extremos, distribución, medición y selección muestral. Welch no presupone igualdad de varianzas, pero no corrige sesgos ni confusión.
- Cada grupo necesita al menos dos observaciones válidas y variabilidad estimable.
- No ajusta covariables, no imputa faltantes y no analiza desenlaces categóricos.
- La herramienta no realiza automáticamente pruebas de normalidad para decidir el método. La elección debe basarse en el diseño, escala, distribución y protocolo.
- Las observaciones faltantes o no numéricas se excluyen del cálculo y se contabilizan.

Los cálculos se realizan localmente en el navegador. No cargar identificadores directos ni datos clínicos identificables.

## Resultados categóricos
Para diseños transversales con grupos independientes y un resultado nominal u ordinal, se construye una tabla de contingencia.
- Chi-cuadrado de Pearson: se calcula solo cuando todas las frecuencias esperadas son al menos 5.
- Tablas 2×2 con alguna frecuencia esperada menor que 5: prueba exacta de Fisher bilateral.
- Tablas mayores que 2×2 con frecuencias esperadas pequeñas: el programa se abstiene de calcular un p-valor. Se necesita un método exacto RxC o Monte Carlo validado, que aún no está implementado.

Se informan tabla observada, totales, frecuencias esperadas mínimas, método, estadístico/grados de libertad cuando corresponde, valor p y observaciones excluidas. La prueba evalúa asociación, no causalidad. Requiere observaciones independientes y categorías mutuamente excluyentes. No calcula medidas de asociación (OR/RR/V de Cramér), no ajusta covariables y no resuelve datos pareados o longitudinales.
