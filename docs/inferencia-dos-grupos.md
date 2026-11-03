# Inferencia inicial: dos grupos independientes

La herramienta ofrece una comparación inicial de un resultado cuantitativo entre exactamente dos grupos independientes mediante la prueba t bilateral de Welch.

## Qué informa
- n válido por grupo, media y desviación estándar.
- Diferencia de medias (Grupo B menos Grupo A), error estándar, estadístico t, grados de libertad de Welch y valor p bilateral.
- Intervalo de confianza del 95% para la diferencia.
- g de Hedges como tamaño de efecto estandarizado y un intervalo aproximado del 95%.
- Cantidad de observaciones excluidas por dato faltante o no válido.

## Límites de uso
- No usar con medidas pareadas, longitudinales/repetidas, datos agrupados por centro/familia/terapeuta u otras estructuras dependientes.
- La independencia debe justificarse por el diseño; no se verifica automáticamente.
- Revisar distribución, valores extremos, calidad de medición y proceso de selección. Welch no requiere igualdad de varianzas, pero no resuelve sesgos ni confusión.
- No ajusta covariables ni corrige comparaciones múltiples.
- El intervalo del tamaño de efecto es aproximado.
- Si hay más de dos grupos, la herramienta no ejecuta múltiples t: hace falta un contraste global y un procedimiento post hoc con control de multiplicidad.
- No se ejecuta inferencia para resultados categóricos, diseños pareados o longitudinales en esta versión.

El análisis se realiza en el navegador con el CSV seleccionado; no se envían los registros a un servidor. No cargar identificadores directos ni datos clínicos identificables.
