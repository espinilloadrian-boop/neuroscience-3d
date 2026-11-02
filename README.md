# Neuroscience 3D

Atlas cerebral 3D interactivo orientado a formación, neuropsicología e investigación.

## Estado del proyecto

**Prototipo Fase 1 — explorador anatómico interactivo.**

La aplicación incluye:
- Escena 3D con rotación, zoom y selección directa de regiones.
- Navegación rápida desde una lista de estructuras.
- Fichas introductorias de lóbulos frontal, parietal, temporal y occipital, cerebelo y tronco encefálico.
- Planos de sección axial, coronal y sagital con control deslizante de posición.
- Diseño adaptable a escritorio, tablet y móvil.
- Despliegue automatizado preparado para GitHub Pages.

### Advertencia sobre las secciones

Los cortes actuales utilizan planos de recorte geométricos sobre una malla esquemática. Las superficies quedan abiertas: no son cortes anatómicos segmentados ni reconstrucciones volumétricas. No representan coordenadas MNI, límites citoarquitectónicos o anatomía clínica de precisión.

## Ejecutar localmente

```bash
npm install
npm run dev
``

Para generar la versión de producción:

```bash
npm run build
npm run preview
``

## Hoja de ruta

1. **Base anatómica:** sustituir las masas esquemáticas por mallas anatómicas de procedencia y licencia verificadas.
2. **Atlas y orientación:** incorporar nomenclatura anatómica consistente, hemisferios, surcos, giros, estructuras profundas y referencias espaciales.
3. **Conectividad:** tractos, fascículos, redes y relaciones estructurales/funcionales.
4. **Microanatomía:** corteza por capas, tipos celulares, neuronas, glía, sinapsis y mielina.
5. **Neurofisiología:** potencial de acción, neurotransmisores, receptores y plasticidad.
6. **Neuroimagen y clínica:** RM, DTI, fMRI, PET, EEG y módulos de epilepsia, demencias, ACV, TEC y neurodesarrollo.
7. **Evaluación e investigación:** fichas de instrumentos, variables, análisis estadísticos y módulo de investigación.

## Criterio científico

Cada ficha debe diferenciar evidencia consolidada, evidencia emergente e hipótesis. Se documentarán fuentes primarias, DOI/PMID, población, metodología, limitaciones y fecha de revisión. Las asociaciones anatómico-funcionales no se presentarán como causalidad automática.

El atlas es una herramienta educativa y de investigación. No constituye un instrumento diagnóstico ni reemplaza evaluación clínica.

## Licencias y atribución

No se incorporarán modelos anatómicos externos hasta verificar la licencia de cada activo, sus metadatos y los requisitos de atribución. Las modificaciones deberán respetar las condiciones originales de distribución.

## Tecnologías

Vite, JavaScript y Three.js.
