# Neuroscience 3D

Atlas cerebral 3D interactivo orientado a formación, neuropsicología e investigación.

## Estado
**Prototipo Fase 1 — interfaz y escena anatómica esquemática.** Esta primera versión permite rotar, acercar/alejar, seleccionar regiones y consultar fichas introductorias. La geometría inicial es didáctica y simplificada: no representa límites anatómicos exactos, coordenadas MNI ni un atlas clínico.

## Ejecutar localmente
```bash
npm install
npm run dev
``

## Próximas etapas
1. Sustituir la geometría esquemática por mallas anatómicas con licencia y procedencia documentadas.
2. Incorporar cortes axial, coronal y sagital con registro espacial verificable.
3. Añadir conectividad, microanatomía, neurofisiología, neuroimagen y módulos clínicos.
4. Construir fichas con bibliografía primaria verificable y límites de inferencia.

## Criterio científico
Cada contenido debe distinguir evidencia consolidada, evidencia emergente e hipótesis. No usar la visualización como herramienta diagnóstica. Las mallas, metadatos y fuentes deberán conservar atribución y condiciones de licencia.

## Tecnologías
Vite, JavaScript y Three.js.
