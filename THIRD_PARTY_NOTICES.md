# Avisos de terceros y atribución

## Modelo anatómico

El archivo GLB utilizado por Neuroscience 3D se carga desde:

- Proyecto: Brain Project — https://github.com/itayinbarr/brainproject
- Archivo: `brain-atlas/models/brain.glb`
- Metadatos: `brain-atlas/models/manifest.json`
- Demo del proyecto de origen: https://itayinbarr.github.io/brainproject/

Según el README y la licencia del proyecto de origen, los activos anatómicos 3D y metadatos derivados se distribuyen bajo **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**, con atribución a los colaboradores de Z-Anatomy y BodyParts3D / DBCLS. El código del visor de origen se distribuye bajo Apache License 2.0.

Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

Z-Anatomy: https://www.z-anatomy.com/
BodyParts3D / DBCLS: https://dbcls.rois.ac.jp/

Neuroscience 3D carga el modelo desde el repositorio de origen y no incluye una copia local del GLB. Si se redistribuye o modifica el modelo, deben conservarse los avisos de atribución y cumplirse las condiciones de la licencia, incluida la cláusula ShareAlike.

## Atlas de neuroimagen registrados

El proyecto de origen describe estructuras adicionales aproximadas registradas desde atlas abiertos, entre ellos:

- CIT168 subcortical atlas — Pauli, Nili & Tyszka (2018), Scientific Data, CC BY 4.0: https://osf.io/jkzwp/
- CIT168 amygdala atlas — Tyszka & Pauli (2016), CC BY-SA 4.0: https://osf.io/hksa6/
- Najdenovska et al. (2018), atlas probabilístico talámico, Scientific Data: https://doi.org/10.5281/zenodo.1405484
- Neudorfer et al. (2020), atlas de regiones hipotalámicas, Scientific Data: https://doi.org/10.5281/zenodo.3942115
- HCP1065 white-matter tract templates, Human Connectome Project.

La atribución de estos recursos se conserva conforme a la documentación del proyecto de origen. Las estructuras registradas no deben interpretarse como segmentaciones clínicas de alta resolución.

## Decodificador Draco

El visor utiliza DRACOLoader de Three.js y descarga el decodificador Draco desde Google-hosted static decoders:
https://www.gstatic.com/draco/versioned/decoders/1.5.6/

Consultar las licencias y avisos correspondientes a las dependencias en sus respectivos repositorios.
