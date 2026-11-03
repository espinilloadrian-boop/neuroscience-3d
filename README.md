# Neuroscience 3D

Atlas neurocientífico interactivo para formación, neuropsicología e investigación. Combina un visor anatómico 3D con módulos de conectividad, neurofisiología, neuroimagen, cognición, clínica y análisis de datos.

## Estado del desarrollo

La rama de trabajo actual amplía el prototipo publicado. Los cambios descritos aquí están en revisión y no deben confundirse con la versión pública hasta que se integren y desplieguen.

### Visor anatómico 3D
- Modelo GLB externo de Z-Anatomy / BodyParts3D integrado por Brain Project.
- Manifiesto TA2 de la versión fijada: 437 registros anatómicos en 12 categorías. El número de estructuras que se muestra en pantalla corresponde a las mallas identificadas durante la carga; no se presupone que todos los registros tengan una malla independiente.
- Selección de mallas, búsqueda por nombre, lateralidad, filtros por categoría, aislamiento de estructura, rotación, zoom y planos geométricos de recorte.
- Fallback 3D local simplificado si el modelo externo no puede descargarse. El fallback conserva la visualización, pero no permite seleccionar estructuras individuales.
- La disponibilidad de una ficha anatómica o de una correspondencia con redes depende de la identificación verificable de la malla.

### Integración anatómica y funcional
- 27 fichas anatomo-funcionales relacionan estructuras seleccionadas con neurofisiología, funciones cognitivas/conductuales, redes y relevancia clínica.
- Explorador de 10 tractos con origen, trayecto, terminaciones, función, relevancia clínica, neuroimagen y límites metodológicos.
- Explorador de redes funcionales con nodos navegables cuando existe una correspondencia suficientemente específica con una malla.
- Las descripciones funcionales representan contribuciones a circuitos distribuidos; no implican localización exclusiva ni causalidad automática.

### Neurociencia clínica y evaluación
- 8 escenarios clínicos: enfermedad de Alzheimer/DCL, epilepsia temporal, ACV isquémico, traumatismo encefalocraneano, trastornos del neurodesarrollo, deterioro cognitivo vascular, variante conductual de demencia frontotemporal y Parkinson.
- Cada escenario incluye conexiones anatómicas, red funcional, tracto y una guía de lectura multimodal con límites de inferencia.
- Catálogo de 18 instrumentos y recursos de evaluación neuropsicológica. Se describen constructos, usos y cautelas; no se reproducen materiales protegidos, claves ni baremos.
- Exploradores de dominios cognitivos, neuroimagen, microanatomía, neurofisiología, neurotransmisión, farmacología clínica y simulaciones didácticas.

### Investigación
- Laboratorio metodológico de fluencia verbal semántica: frecuencia léxica, similitud semántica, clustering/switching, latencias, edad y educación.
- Importación y validación de CSV, estadística descriptiva y funciones exploratorias de asociación y discriminación.
- El procesamiento del CSV ocurre localmente en el navegador. No se incorporan datos ni resultados simulados como si fueran observaciones reales.
- Los análisis son exploratorios: requieren revisión del diseño, supuestos, calidad de datos, control de confusores y validación independiente antes de cualquier inferencia científica.

## Modelo anatómico, atribución y límites

El modelo se carga desde [Brain Project](https://github.com/itayinbarr/brainproject), que integra activos de Z-Anatomy / BodyParts3D / DBCLS y estructuras adicionales registradas desde atlas de neuroimagen abiertos.

- Modelo: `brain-atlas/models/brain.glb`
- Manifiesto: `brain-atlas/models/manifest.json`
- Activos 3D y metadatos: CC BY-SA 4.0, según la documentación del proyecto de origen.
- Visor de origen: Apache License 2.0.

Se conserva la atribución al proyecto de origen. Si se redistribuye o modifica el activo 3D, deben respetarse la atribución y las condiciones ShareAlike de CC BY-SA 4.0.

La segmentación es principalmente macroscópica. Algunos núcleos profundos, regiones hipotalámicas y tractos añadidos por registro de atlas en espacio MNI son aproximados (alrededor de 7 mm, según el proyecto de origen). No equivalen a resolución histológica, segmentación clínica individual ni reconstrucción de tractografía de una persona.

Los planos axial, coronal y sagital de esta versión son planos geométricos de recorte de la malla; no son imágenes de RM ni segmentaciones volumétricas nativas. El atlas es educativo y de investigación; no debe utilizarse para diagnóstico, mediciones clínicas ni planificación quirúrgica.

## Desarrollo y validación

Requisitos: Node.js 22 o compatible y conexión a internet para descargar el modelo GLB y el decodificador Draco.

```bash
npm install
npm run dev
```

Compilar, probar y previsualizar:

```bash
npm test
npm run build
npm run preview
```

La integración continua ejecuta pruebas automatizadas y compilación en las ramas configuradas. Estas comprobaciones validan lógica y empaquetado, pero no sustituyen una inspección visual del modelo 3D en un navegador real.

## Criterio científico

Cada módulo debe distinguir evidencia consolidada, evidencia emergente, hipótesis y controversias. Se priorizan fuentes primarias, revisiones académicas, DOI/PMID y guías reconocidas. Las asociaciones anatómico-funcionales se presentan con sus límites, población y método cuando corresponda. La selección, administración, corrección e interpretación de instrumentos requieren formación profesional, normas pertinentes y consideración de licencias.

## Tecnologías

Vite, JavaScript, Three.js, GLTFLoader y DRACOLoader.
