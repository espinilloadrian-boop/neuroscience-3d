// Fichas anatómicas curadas. Contenido resumido y vinculado a fuentes consultables.
// Las relaciones funcionales se presentan como asociaciones de redes, no como causalidad exclusiva.
export const structureFacts = [
  {
    match: ["hippocampus", "hippocampus proper", "hipocampo"],
    title: "Formación hipocampal",
    location: "Lóbulo temporal medial, en el piso del asta temporal del ventrículo lateral; se extiende desde la región amigdalar hacia el esplenio del cuerpo calloso.",
    boundaries: "Incluye hipocampo propio (campos CA), giro dentado y subículo. Se continúa con la corteza entorrinal y la región parahipocampal.",
    brodmann: "No corresponde asignar un área de Brodmann única al hipocampo; es allocorteza/arquicorteza.",
    connections: "Entrada cortical principal desde la corteza entorrinal por la vía perforante hacia el giro dentado y CA; circuito trisimpático giro dentado → CA3 → CA1 → subículo. La salida principal se organiza a través del fórnix.",
    functions: "Participa en la codificación y consolidación de memoria episódica/declarativa, asociación relacional y navegación espacial. Su contribución depende de interacciones con corteza entorrinal, parahipocampal y redes distribuidas.",
    clinical: "La esclerosis/atrofia hipocampal puede asociarse a epilepsia temporal mesial. La afectación temprana de circuitos temporomediales es frecuente en enfermedad de Alzheimer, pero la imagen aislada no establece diagnóstico ni etiología.",
    limitation: "La ficha describe organización general; no sustituye la segmentación de subcampos CA1–CA4, giro dentado y subículo ni una evaluación individual.",
    references: [
      { label: "Fogwe et al. — Neuroanatomy, Hippocampus (StatPearls, 2023)", url: "https://www.ncbi.nlm.nih.gov/books/NBK482171/" },
      { label: "Chauhan et al. — The Anatomy of the Hippocampus (2021)", url: "https://doi.org/10.36255/exonpublications.cerebralischemia.2021.hippocampus" }
    ]
  },
  {
    match: ["thalamus", "tálamo"],
    title: "Tálamo",
    location: "Diencéfalo, a ambos lados del tercer ventrículo, superior al mesencéfalo y medial a la cápsula interna.",
    boundaries: "Conjunto bilateral de núcleos separados parcialmente por láminas medulares. Se reconocen grupos anterior, medial, lateral, intralaminar, de línea media y reticular; la organización funcional depende del núcleo.",
    brodmann: "No corresponde: es una estructura subcortical y no una región cortical de Brodmann.",
    connections: "La mayoría de los núcleos mantienen circuitos recíprocos tálamo-corticales. VPL/VPM proyectan a corteza somatosensorial; geniculado lateral a corteza visual; geniculado medial a corteza auditiva; núcleos anteriores participan en circuitos límbicos; núcleos mediodorsales se conectan con corteza prefrontal.",
    functions: "Integra y modula el flujo sensorial (excepto la vía olfatoria primaria), motor, límbico y asociativo. También participa en atención, alerta, sueño-vigilia y nivel de conciencia; no es un simple relevo pasivo.",
    clinical: "Lesiones talámicas pueden producir síndromes sensitivos, alteraciones motoras, dolor central, trastornos de memoria o de conciencia, según territorio y lateralidad. La clínica depende del núcleo y de las conexiones comprometidas.",
    limitation: "No inferir un síndrome a partir de la etiqueta global 'tálamo': es imprescindible identificar el núcleo, territorio vascular, extensión y correlato clínico.",
    references: [
      { label: "Torrico & Munakomi — Neuroanatomy, Thalamus (StatPearls, 2023)", url: "https://www.ncbi.nlm.nih.gov/books/NBK549908/" },
      { label: "Sheridan & Tadi — Neuroanatomy, Thalamic Nuclei (StatPearls)", url: "https://www.ncbi.nlm.nih.gov/books/NBK549908/" },
      { label: "The thalamus: Structure, function, and neurotherapeutics (2025)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12014413/" }
    ]
  }
  ,
  {
    match: ["amygdala", "amygdaloid complex", "amygdaloid body", "amigdala"],
    title: "Complejo amigdalino",
    location: "Región anteromedial del lóbulo temporal, anterior a la formación hipocampal y próxima al extremo anterior del asta temporal del ventrículo lateral.",
    boundaries: "Complejo heterogéneo de núcleos: grupos basolateral, centromedial y cortical, además de áreas de transición y componentes de la amígdala extendida. No constituye un núcleo unitario.",
    brodmann: "No posee un área de Brodmann: es un conjunto de núcleos subcorticales.",
    connections: "Recibe información de cortezas sensoriales y asociativas, hipocampo y corteza prefrontal. Sus salidas incluyen la estría terminal y la vía amigdalófuga ventral hacia hipotálamo, área septal, tálamo y tronco encefálico. La conectividad varía entre núcleos.",
    functions: "Interviene en aprendizaje asociativo con relevancia emocional, valoración de saliencia, memoria emocional y coordinación de respuestas autonómicas y conductuales. No es un 'centro del miedo': participa en múltiples procesos y contextos.",
    clinical: "Alteraciones de sus circuitos se estudian en epilepsia temporal, trastorno por estrés postraumático, ansiedad y demencias. La asociación no implica que una diferencia estructural aislada confirme un trastorno.",
    limitation: "La etiqueta global del atlas no permite distinguir subnúcleos ni inferir conectividad funcional individual. Para ello se requieren segmentaciones y métodos específicos.",
    references: [
      { label: "McDonald & Mott — Functional neuroanatomy of amygdalohippocampal interconnections (2017)", url: "https://pubmed.ncbi.nlm.nih.gov/26876924/" },
      { label: "The Cortico-Limbo-Thalamo-Cortical Circuits (2023)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10164017/" },
      { label: "AbuHasan et al. — Neuroanatomy, Amygdala (StatPearls, 2023)", url: "https://www.ncbi.nlm.nih.gov/books/NBK537102/" }
    ]
  },
  {
    match: ["cerebellum", "cerebelo"],
    title: "Cerebelo",
    location: "Fosa craneal posterior, dorsal al puente y bulbo raquídeo; conectado al tronco encefálico por los pedúnculos cerebelosos superior, medio e inferior.",
    boundaries: "Se organiza en vermis y hemisferios; lóbulos anterior, posterior y floculonodular; y zonas longitudinales. La corteza presenta capas molecular, de Purkinje y granulosa, con núcleos profundos.",
    brodmann: "No corresponde: la corteza cerebelosa no se clasifica mediante áreas de Brodmann.",
    connections: "Aferencias por fibras musgosas y trepadoras a través de los pedúnculos. Las células de Purkinje constituyen la salida de la corteza cerebelosa hacia núcleos profundos y vestibulares. La salida cerebelosa alcanza tálamo y tronco encefálico; existen circuitos recíprocos con áreas motoras, prefrontales y asociativas.",
    functions: "Participa en coordinación, temporización, adaptación y aprendizaje motor. Sus circuitos posteriores y laterales también se relacionan con lenguaje, memoria de trabajo, funciones ejecutivas y regulación afectiva, en interacción con redes cerebrales distribuidas.",
    clinical: "Las lesiones pueden producir ataxia, dismetría, disartria y alteraciones oculomotoras. Lesiones posteriores pueden acompañarse de síndrome cognitivo-afectivo cerebeloso, con alteraciones ejecutivas, visuoespaciales, lingüísticas y afectivas.",
    limitation: "La función depende de lobulillos, zonas y circuitos específicos; 'cerebelo' no es una unidad funcional homogénea. La topografía cognitiva se apoya en evidencia convergente, pero no permite atribuir una función compleja a un único lobulillo.",
    references: [
      { label: "Schmahmann et al. — The Theory and Neuroscience of Cerebellar Cognition (2019)", url: "https://doi.org/10.1146/annurev-neuro-070918-050258" },
      { label: "Diedrichsen & McDougle — How does the cerebellum contribute to cognitive functions? (2026)", url: "https://doi.org/10.1371/journal.pbio.3003688" },
      { label: "Benagiano et al. — The functional anatomy of the cerebrocerebellar circuit (2018)", url: "https://pubmed.ncbi.nlm.nih.gov/29238972/" }
    ]
  },
  {
    match: ["prefrontal cortex", "corteza prefrontal", "prefrontal"],
    title: "Corteza prefrontal",
    location: "Porción anterior del lóbulo frontal, por delante de las cortezas premotora y motora. Incluye territorios dorsolateral, ventrolateral, orbitofrontal y medial/cingulado anterior, con límites dependientes del criterio anatómico y funcional.",
    boundaries: "No es una única área citoarquitectónica. Comprende regiones con perfiles laminares y conexiones diferenciados; las delimitaciones entre corteza prefrontal y premotora no son idénticas en todos los atlas.",
    brodmann: "Se suelen relacionar BA 9, 10, 11, 12, 46 y 47, y porciones de BA 24, 25 y 32 en regiones mediales/cinguladas; la correspondencia depende de la subdivisión y del atlas. No asignar una BA única a toda la corteza prefrontal.",
    connections: "Conectividad recíproca con núcleos mediodorsales y otros núcleos talámicos, estriado, amígdala, hipocampo y cortezas parietales, temporales y sensoriales. Participa en bucles frontoestriatales y circuitos cortico-límbicos.",
    functions: "Contribuye a control ejecutivo, memoria de trabajo, planificación, flexibilidad, selección de acciones, regulación emocional, toma de decisiones y conducta social. Los subterritorios participan en operaciones diferentes y coordinadas.",
    clinical: "La disfunción de circuitos prefrontales puede expresarse en alteraciones ejecutivas, apatía, desinhibición, dificultades de planificación y regulación socioemocional. Estos perfiles no son específicos de una lesión o diagnóstico único.",
    limitation: "La expresión 'corteza prefrontal' agrupa subregiones heterogéneas. Las áreas de Brodmann son una referencia citoarquitectónica histórica, no equivalen directamente a módulos funcionales ni a límites individuales de neuroimagen.",
    references: [
      { label: "The anatomical relationships of the prefrontal cortex with limbic structures and basal ganglia (1997)", url: "https://pubmed.ncbi.nlm.nih.gov/9208373/" },
      { label: "Kovner et al. — Cortico-Limbic Interactions Mediate Adaptive and Maladaptive Responses (2020)", url: "https://pubmed.ncbi.nlm.nih.gov/31787014/" },
      { label: "The Cortico-Limbo-Thalamo-Cortical Circuits (2023)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10164017/" }
    ]
  }
  ,
  {
    match: ["basal ganglia", "basal nuclei", "ganglios basales", "núcleos basales", "nucleos basales", "striatum", "caudate", "putamen", "globus pallidus"],
    title: "Ganglios basales",
    location: "Conjunto de núcleos subcorticales telencefálicos y diencefálicos, profundos a la corteza cerebral. El término funcional incluye estriado, globo pálido, núcleo subtalámico y sustancia negra.",
    boundaries: "Estriado dorsal (caudado y putamen), globo pálido externo e interno, núcleo subtalámico y sustancia negra pars compacta/reticulata. El estriado ventral incluye núcleo accumbens. La clasificación anatómica y funcional no es idéntica.",
    brodmann: "No corresponde: son núcleos subcorticales. Reciben proyecciones de múltiples áreas corticales, incluidas regiones prefrontales y motoras.",
    connections: "La corteza proyecta al estriado (glutamato); el estriado proyecta mediante vías directa e indirecta a segmentos de salida palidales y nig­rales (GABA). La dopamina nigroestriatal modula la actividad de las vías. Los circuitos de salida alcanzan tálamo y tronco encefálico y retornan a corteza.",
    functions: "Participan en selección e iniciación de acciones, aprendizaje por refuerzo, formación de hábitos, vigor motor y procesos cognitivo-motivacionales. Los circuitos son paralelos pero interactúan; no constituyen exclusivamente un sistema motor.",
    clinical: "La disfunción de circuitos nigroestriatales se relaciona con enfermedad de Parkinson; la degeneración estriatal es característica de enfermedad de Huntington. También se estudian en distonías, tics, TOC y adicciones, con mecanismos y evidencias heterogéneos.",
    limitation: "La expresión 'ganglios basales' agrupa núcleos y circuitos distintos. La ficha general no permite localizar una lesión ni inferir el estado dopaminérgico de una persona.",
    references: [
      { label: "Lanciego et al. — Functional neuroanatomy of the basal ganglia (2012)", url: "https://doi.org/10.3389/fnana.2012.00030" },
      { label: "Nelson & Kreitzer — Reassessing models of basal ganglia function (2014)", url: "https://doi.org/10.1038/nrn3747" },
      { label: "DeLong & Wichmann — Circuits and circuit disorders of the basal ganglia (2015)", url: "https://doi.org/10.1016/j.arcmed.2015.05.003" }
    ]
  },
  {
    match: ["primary motor cortex", "precentral gyrus", "corteza motora primaria", "giro precentral", "precentral"],
    title: "Corteza motora primaria (M1)",
    location: "Giro precentral del lóbulo frontal y porción anterior del lobulillo paracentral en la cara medial del hemisferio.",
    boundaries: "Corresponde principalmente al área 4 de Brodmann. Se ubica anterior al surco central y posterior a regiones premotoras; contiene una representación somatotópica corporal distribuida y variable.",
    brodmann: "BA 4. La delimitación citoarquitectónica no coincide exactamente con una frontera funcional simple en todos los individuos.",
    connections: "Recibe aferencias de corteza premotora, área motora suplementaria, corteza somatosensorial y tálamo. Proyecta por vías corticobulbares y corticoespinales; también participa en conexiones cortico-corticales y corticoestriatales.",
    functions: "Contribuye a la ejecución y control de movimientos voluntarios, fuerza, dirección y coordinación de patrones motores. La ejecución resulta de redes distribuidas, no de M1 en aislamiento.",
    clinical: "Lesiones pueden producir debilidad contralateral, pérdida de destreza y signos de neurona motora superior, con expresión dependiente de extensión, territorio y reorganización. La estimulación cortical y la neuroimagen funcional aportan información complementaria.",
    limitation: "El homúnculo es una representación esquemática: las representaciones se superponen y cambian con la tarea, el aprendizaje y el daño. No debe interpretarse como un mapa rígido de músculos.",
    references: [
      { label: "Rossi et al. — Motor control and the primary motor cortex (2021)", url: "https://pubmed.ncbi.nlm.nih.gov/33509378/" },
      { label: "Harris & Shepherd — The cortical connectivity of the primary motor cortex (2015)", url: "https://doi.org/10.1016/j.neuron.2015.03.005" },
      { label: "Geyer et al. — Functional neuroanatomy of the human primary motor cortex (1996)", url: "https://pubmed.ncbi.nlm.nih.gov/8876654/" }
    ]
  },
  {
    match: ["primary somatosensory cortex", "postcentral gyrus", "corteza somatosensorial primaria", "corteza somatosensitiva primaria", "giro postcentral", "postcentral"],
    title: "Corteza somatosensorial primaria (S1)",
    location: "Giro postcentral del lóbulo parietal y porción posterior del lobulillo paracentral en la cara medial.",
    boundaries: "Incluye áreas citoarquitectónicas 3a, 3b, 1 y 2 de Brodmann, con diferencias de conectividad y procesamiento. Se organiza somatotópicamente, con representaciones contralaterales del cuerpo.",
    brodmann: "BA 3a, 3b, 1 y 2. BA 3b recibe de forma destacada aferencias talámicas cutáneas; BA 3a procesa información propioceptiva; BA 1 y 2 integran características táctiles y somáticas.",
    connections: "Recibe proyecciones de núcleos ventrales posteriores del tálamo (VPL/VPM). Se conecta con otras áreas somatosensoriales, corteza parietal posterior, áreas motoras y redes de integración multisensorial.",
    functions: "Participa en el procesamiento de tacto, propiocepción, vibración y características somáticas como textura y forma. La percepción consciente e integración corporal involucran redes parietales y talamocorticales más amplias.",
    clinical: "Lesiones pueden causar alteraciones sensitivas contralaterales, discriminación táctil reducida y dificultades de localización o reconocimiento somático, según subregión y extensión. La astereognosia requiere considerar también vías y áreas asociativas.",
    limitation: "Las subdivisiones de S1 no deben colapsarse en una función única. El mapa somatotópico es dinámico y no equivale a límites anatómicos nítidos visibles en una RM estructural convencional.",
    references: [
      { label: "Kaas — The functional organization of somatosensory cortex (2012)", url: "https://pubmed.ncbi.nlm.nih.gov/22326901/" },
      { label: "Saal & Bensmaia — Touch is a team effort: interplay of submodalities in somatosensation (2014)", url: "https://doi.org/10.1016/j.neuron.2014.03.019" },
      { label: "Geyer et al. — Functional anatomy of the somatosensory cortex (1999)", url: "https://pubmed.ncbi.nlm.nih.gov/10501509/" }
    ]
  },
  {
    match: ["corpus callosum", "cuerpo calloso"],
    title: "Cuerpo calloso",
    location: "Gran comisura de sustancia blanca situada en profundidad de la fisura longitudinal, por encima de los ventrículos laterales y del fórnix.",
    boundaries: "Se divide convencionalmente en rostro, genu, cuerpo o tronco, istmo y esplenio. Las fibras interhemisféricas conectan territorios corticales homólogos y heterólogos; la distribución varía a lo largo de sus segmentos.",
    brodmann: "No corresponde: es un tracto de sustancia blanca, no corteza.",
    connections: "Conecta ambos hemisferios mediante fibras comisurales. El genu contiene abundantes conexiones frontales; el cuerpo conecta regiones premotoras y motoras; el esplenio conecta regiones parietales, temporales y occipitales posteriores, con variabilidad individual.",
    functions: "Facilita transferencia e integración interhemisférica de información sensorial, motora y cognitiva. Su papel depende del segmento y de las áreas corticales conectadas.",
    clinical: "Agenesia o lesiones callosas pueden asociarse a dificultades de integración interhemisférica, síndromes de desconexión y alteraciones cognitivas variables. La interpretación requiere evaluar también malformaciones, lesiones asociadas y desarrollo.",
    limitation: "La topografía de fibras no puede deducirse con precisión a partir de la forma externa del cuerpo calloso. La tractografía es una estimación basada en difusión y no demuestra por sí sola conexiones axonales individuales.",
    references: [
      { label: "Luders et al. — The anatomy of the corpus callosum (2010)", url: "https://pubmed.ncbi.nlm.nih.gov/20152837/" },
      { label: "Wahl et al. — The human corpus callosum: fiber pathways and connectivity (2007)", url: "https://pubmed.ncbi.nlm.nih.gov/17588730/" },
      { label: "Gazzaniga — Cerebral specialization and interhemispheric communication (2000)", url: "https://pubmed.ncbi.nlm.nih.gov/10944599/" }
    ]
  }
];

export function findStructureFact(label) {
  const value = String(label || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return structureFacts.find(f => f.match.some(alias => value.includes(alias.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()))) || null;
}
