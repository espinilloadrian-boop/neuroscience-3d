# Motor estadístico general — alcance inicial

## Alcance implementado
- Estadística descriptiva cuantitativa: n válido, faltantes, media, desviación estándar muestral, mediana, cuartiles, RIQ, mínimo y máximo.
- Variables categóricas: frecuencias, proporciones y faltantes; el denominador de proporciones es el n no faltante.
- Resúmenes estratificados por grupo con n de filas y n válido por variable.
- Constructor de plan analítico que verifica existencia de variables, tipo de resultado y requisitos mínimos de identificación para diseños pareados o longitudinales.

## Límites deliberados
- No imputa faltantes, elimina valores ni modifica el conjunto de datos.
- No selecciona automáticamente pruebas inferenciales ni interpreta significación.
- Los diseños longitudinales/repetidos y pareados quedan bloqueados para inferencia si falta un identificador.
- El diccionario de variables debe declarar tipos y roles de forma explícita. No inferir escalas a partir de los valores observados.

## Próximas etapas
1. Integrar la configuración del plan en la interfaz de proyectos.
2. Conectar resúmenes descriptivos al CSV genérico ya validado.
3. Añadir pruebas inferenciales por diseño, con criterios de compatibilidad, tamaños de efecto e intervalos de confianza.
4. Exportar resultados agregados sin incluir filas individuales.