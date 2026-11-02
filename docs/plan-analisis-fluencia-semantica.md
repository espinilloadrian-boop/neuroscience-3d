# Plan de análisis estadístico — fluencia verbal semántica

## Estado del documento
Plantilla metodológica para completar y aprobar antes de analizar la muestra definitiva. No presupone tamaños muestrales, criterios diagnósticos, exclusiones ni resultados. Toda decisión pendiente debe quedar cerrada en el protocolo o identificada como exploratoria.

## Pregunta y marco
Explorar diferencias en la organización léxico-semántica durante fluencia verbal semántica entre controles, deterioro cognitivo leve (DCL) y enfermedad de Alzheimer (EA), considerando producción, frecuencia léxica, similitud semántica, agrupamiento, alternancia y latencia.

El modelo vectorial de representación semántica es una operacionalización computacional de relaciones distribucionales entre palabras. No debe interpretarse como medición directa de la representación semántica neural.

## Variables y operacionalización
| Dominio | Variable | Definición operativa pendiente de especificación |
|---|---|---|
| Producción | total_words | Número de respuestas válidas según reglas explícitas de depuración |
| Frecuencia | mean_log_frequency | Media de frecuencia logarítmica de las respuestas; fijar corpus, idioma, versión y transformación |
| Similitud | mean_semantic_similarity | Media de similitud coseno entre pares consecutivos o dentro de clústeres; definir algoritmo |
| Clustering | clustering | Número/tamaño de agrupamientos semánticos según criterio publicado y codificación |
| Switching | switching | Número de transiciones entre agrupamientos; fijar regla de segmentación |
| Latencia | first_latency | Tiempo hasta primera respuesta; especificar unidad, equipo y tratamiento de censura |
| Covariables | age, education | Edad y años de educación formal; definir fuente y momento de medición |

## Hipótesis de trabajo
1. La producción total puede diferir entre grupos; explorar modificación por edad y educación.
2. La frecuencia léxica media podría aumentar en el grupo EA respecto de controles; considerar educación como covariable/moderadora solo si el tamaño muestral y el diseño lo permiten.
3. La diversidad/estructura semántica y similitud podrían diferir entre grupos y asociarse con educación/reserva cognitiva.
4. Frecuencia y similitud podrían aportar información discriminativa; la capacidad diagnóstica debe estimarse con intervalos de confianza y validación independiente.
5. Latencia podría asociarse con eficiencia de acceso y producción, sin equipararla a una medida ejecutiva pura.

Estas hipótesis son provisionales: requieren definición del desenlace primario, dirección esperada y jerarquía antes de examinar resultados.

## Secuencia analítica
1. Auditoría de datos: unidad de análisis, duplicados, valores imposibles, datos faltantes, distribuciones y tamaños por grupo.
2. Descriptivos por grupo: n válido, media/DE y, cuando corresponda, mediana/rango intercuartílico; inspección gráfica.
3. Comparación global: elegir ANOVA/modelo lineal si supuestos y diseño lo justifican; en otro caso Kruskal–Wallis como contraste de rangos. El test de rangos no compara necesariamente medianas si las distribuciones difieren en forma.
4. Post hoc: Dunn con corrección Holm tras omnibus significativo, interpretado junto con magnitud y distribución; definir familia de comparaciones.
5. Asociaciones: Pearson para relaciones aproximadamente lineales con condiciones apropiadas; Spearman para asociaciones monotónicas/rangos. Reportar n y gráficos.
6. Discriminación binaria: AUC con IC 95% bootstrap estratificado. AUC no sustituye validación externa, calibración, sensibilidad/especificidad en umbral clínicamente justificado ni evaluación de utilidad clínica.
7. Modelos ajustados: considerar edad, educación, sexo u otras covariables justificadas por literatura y diseño; evitar sobreajuste. No ajustar indiscriminadamente por variables que puedan ser mediadoras.
8. Datos longitudinales/repetidos: no tratar mediciones del mismo participante como independientes; usar modelos mixtos/GEE o métodos apropiados al diseño.

## Decisiones que deben fijarse antes del análisis confirmatorio
- Criterios de inclusión/exclusión y definición diagnóstica de controles, DCL y EA.
- Unidad de análisis y tratamiento de visitas repetidas.
- Tarea, categoría semántica, duración, idioma/variante y reglas de transcripción/depuración.
- Corpus de frecuencia y modelo de embeddings (nombre, versión, idioma, dimensión, entrenamiento y cobertura).
- Definición reproducible de similitud, clustering, switching y latencia.
- Desenlace primario, hipótesis direccionales, covariables y familia de comparaciones.
- Manejo de faltantes, valores atípicos y tamaños muestrales.
- Cálculo de potencia/tamaño muestral y estrategia de validación interna/externa.
- Aprobación ética, consentimiento y desidentificación de datos.

## Interpretación y límites
Los resultados serán asociativos y exploratorios salvo que el diseño permita inferencia confirmatoria. Una AUC elevada en la misma muestra de desarrollo puede estar optimistamente sesgada. La frecuencia, similitud y estructura de respuestas dependen del idioma, cultura, edad, educación, familiaridad con la categoría, audición, habla, velocidad motora, fatiga y contexto de evaluación.

## Privacidad
El módulo CSV procesa el archivo localmente en el navegador. Usar únicamente datos desidentificados y autorizados. No subir nombres, documentos, fechas exactas ni combinaciones que permitan reidentificación. La privacidad técnica local no reemplaza aprobación institucional ni obligaciones éticas/legales.
