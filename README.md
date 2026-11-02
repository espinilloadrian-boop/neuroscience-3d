# Neuroscience 3D

Atlas cerebral 3D interactivo para formación, neuropsicología e investigación.

## Estado

**Prototipo Fase 1 — visor anatómico con modelo 3D real de origen abierto.**

La aplicación incorpora:
- Modelo cerebral GLB de Z-Anatomy / BodyParts3D cargado en el navegador.
- Estructuras individualizadas y selección directa sobre la malla.
- Búsqueda por nombre anatómico, región y categoría.
- Filtros para mostrar u ocultar sistemas anatómicos completos.
- Visualización del hemisferio izquierdo, derecho o ambos.
- Identificación de lateralidad y sistema anatómico a partir de metadatos del modelo.
- Fichas anatómicas curadas iniciales para hipocampo, tálamo, complejo amigdalino, cerebelo, corteza prefrontal, ganglios basales, corteza motora primaria, corteza somatosensorial primaria y cuerpo calloso: ubicación, organización, conectividad, funciones, correlatos clínicos, límites de interpretación y referencias externas.
- Separación entre metadatos del atlas y contenido científico curado; las estructuras sin ficha verificada no reciben descripciones funcionales inferidas.
- Rotación, zoom, restablecimiento de cámara y navegación rápida.
- Planos de recorte axial, coronal y sagital con deslizador.
- Exploradores de redes funcionales y tractos de sustancia blanca con límites de interpretación.
- Nueve modalidades de neuroimagen con principios, aplicaciones, usos clínicos y bibliografía.
- Cinco escenarios clínicos que relacionan neuroimagen, anatomía, redes y perfiles cognitivos.
- Laboratorio de correlación anatomoclínica: ocho estructuras con funciones, manifestaciones, ejemplos de pruebas neuropsicológicas, neuroimagen pertinente, límites y fuentes.
- Explorador de instrumentos neuropsicológicos: ACE-III/ACE-R, MoCA, MMSE, RAVLT, FCSRT, Figura de Rey, TMT, Stroop, FAB, IFS, fluencia verbal, Boston Naming, NPI, FAQ e Índice de Barthel.
- Advertencias de adaptación, normas locales, licencias y límites interpretativos; incluye referencia a datos normativos de Buenos Aires publicados en 2026 para RAVLT, TMT y fluencia verbal.
- Laboratorio metodológico de fluencia verbal semántica: diseño comparativo control/DCL/Alzheimer, frecuencia léxica, similitud vectorial, clustering/switching, latencias, educación, análisis estadístico y reproducibilidad. No contiene datos ni resultados simulados.
- Explorador de microanatomía y neurofisiología: capas corticales, neuronas piramidales, interneuronas, astrocitos, oligodendrocitos, microglía, sinapsis, potencial de acción, plasticidad y neurotransmisores.
- Explorador de dominios cognitivos: memoria episódica y de trabajo, atención, funciones ejecutivas, lenguaje, habilidades visuoespaciales, cognición social, emoción, memoria semántica y praxias; enlaza fichas de evaluación y correlación anatómica.
- Explorador de neuroquímica y farmacología: sistemas glutamatérgico, GABAérgico, dopaminérgico, serotoninérgico, noradrenérgico, colinérgico, opioide, endocannabinoide, histamina/orexina y principios de farmacodinamia.
- Laboratorio de neurofisiología: gradientes y potencial de membrana, canales iónicos, potencial de acción, integración sináptica, liberación vesicular, plasticidad, oscilaciones, EEG, sueño y acoplamiento neurovascular.
- Simuladores interactivos didácticos: excitabilidad neuronal simplificada, ocupación receptorial y plasticidad dependiente de señal de calcio. No son modelos biofísicos validados ni herramientas clínicas.
- Navegación desde escenarios clínicos y fichas de correlación hacia las estructuras disponibles en el atlas 3D.
- Interfaz adaptable a escritorio, tablet y móvil.

## Modelo anatómico y atribución

El modelo 3D se carga desde el repositorio público de [Brain Project](https://github.com/itayinbarr/brainproject), que integra activos de **Z-Anatomy / BodyParts3D / DBCLS** y estructuras adicionales registradas desde atlas de neuroimagen abiertos.

- Repositorio de origen: https://github.com/itayinbarr/brainproject
- Modelo utilizado: `brain-atlas/models/brain.glb`
- Manifiesto anatómico: `brain-atlas/models/manifest.json`
- Licencia de activos 3D y metadatos: **CC BY-SA 4.0**, según la documentación del proyecto de origen.
- Código del visor de origen: Apache License 2.0.

Este proyecto no redistribuye el archivo GLB: lo carga desde la URL pública del repositorio de origen. Se conserva la atribución y se debe mantener la referencia a la licencia del activo. Si en el futuro se incorpora una copia local o se modifica el modelo, habrá que incluir las atribuciones y cumplir la condición ShareAlike CC BY-SA 4.0.

## Resolución y límites anatómicos

El modelo ofrece anatomía macroscópica segmentada con estructuras identificadas. Los núcleos profundos, zonas hipotalámicas y tractos de sustancia blanca incorporados por registro de atlas de imagen en espacio MNI son aproximados (alrededor de 7 mm, según el proyecto de origen). No son representaciones de resolución histológica ni deben utilizarse para diagnóstico, planificación quirúrgica o mediciones clínicas.

Los cortes axial, coronal y sagital de esta versión son planos geométricos de recorte de la malla 3D. No equivalen a imágenes de RM, segmentaciones volumétricas nativas ni reconstrucciones histológicas.

Las fichas funcionales y clínicas se incorporan de forma progresiva y solo para estructuras cuya correspondencia anatómica haya sido revisada. La versión actual incluye fichas iniciales de hipocampo, tálamo, complejo amigdalino, cerebelo y corteza prefrontal; no debe extrapolarse su contenido a otras estructuras. No se infieren funciones, conectividad o relaciones causales únicamente a partir de su geometría.

## Ejecutar localmente

```bash
npm install
npm run dev
``

Compilar y previsualizar:

```bash
npm run build
npm run preview
``

Se requiere conexión a internet para cargar el modelo anatómico externo y el decodificador Draco.

## Hoja de ruta

1. **Atlas anatómico:** completar nombres, jerarquía TA2, lateralidad, límites, referencias y fichas anatómicas.
2. **Conectividad:** fascículos, vías de asociación/proyección/comisurales y redes funcionales, diferenciando atlas y evidencia.
3. **Microanatomía:** capas corticales, tipos celulares, glía, neuronas, mielina y sinapsis.
4. **Neurofisiología:** potencial de acción, neurotransmisores, receptores y plasticidad.
5. **Neuroimagen:** nueve modalidades con principios de adquisición, aplicaciones y límites de inferencia.
6. **Integración clínica:** escenarios clínicos, correlación anatomoclínica y navegación vinculada al atlas.
6. **Neurociencia clínica:** epilepsia, Alzheimer y otras demencias, ACV, TEC y neurodesarrollo.
7. **Evaluación e investigación:** fichas de instrumentos, variables, análisis estadísticos y módulo de investigación sobre fluencia verbal semántica.

## Criterio científico

Cada ficha debe diferenciar evidencia consolidada, emergente, hipótesis y controversias. Se documentarán fuentes primarias, DOI/PMID, población, metodología, limitaciones y fecha de revisión. No se presentarán asociaciones anatómico-funcionales como causalidad automática.

Neuroscience 3D es una herramienta educativa y de investigación; no constituye un instrumento diagnóstico.

## Tecnologías

Vite, JavaScript, Three.js, GLTFLoader y DRACOLoader.
