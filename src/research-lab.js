// Laboratorio metodológico: fluencia verbal semántica y organización léxico-semántica.
// No contiene datos de participantes ni resultados empíricos. Los análisis son un plan reproducible.
export const researchLab = {
 title:"Modelo vectorial de representación semántica",
 subtitle:"Fluencia verbal semántica · controles, DCL y enfermedad de Alzheimer",
 question:"¿Las propiedades léxico-semánticas de la producción verbal permiten caracterizar diferencias entre adultos mayores cognitivamente sanos, personas con deterioro cognitivo leve y personas con enfermedad de Alzheimer, considerando edad, sexo y educación?",
 design:"Estudio observacional comparativo de grupos. La unidad primaria es el participante; las palabras y secuencias se modelan como observaciones anidadas dentro de cada participante. Definir criterios diagnósticos, inclusión/exclusión, contexto de reclutamiento y cegamiento del análisis antes de examinar resultados.",
 groups:["Control cognitivamente sano","Deterioro cognitivo leve (DCL)","Enfermedad de Alzheimer (EA)"],
 variables:[
  {name:"Producción total",role:"Resultado conductual",definition:"Cantidad de respuestas válidas dentro del tiempo estandarizado; reportar también repeticiones, intrusiones y exclusiones."},
  {name:"Frecuencia léxica",role:"Variable léxica",definition:"Frecuencia de cada lema en corpus de español pertinente; documentar corpus, variedad dialectal, tokenización, lematización y escala (p. ej., log frecuencia)."},
  {name:"Similitud semántica",role:"Variable vectorial",definition:"Similitud coseno entre vectores de palabras consecutivas o dentro de categorías; especificar modelo, corpus, dimensión, versión y manejo de OOV."},
  {name:"Clustering y switching",role:"Estrategia de búsqueda",definition:"Agrupamientos semánticos y cambios entre subcategorías, con reglas operacionales definidas a priori y evaluación de concordancia entre codificadores."},
  {name:"Latencia",role:"Acceso y eficiencia",definition:"Tiempo hasta primera respuesta y, si existe registro fiable, intervalos inter-respuesta; diferenciar pausas, autocorrecciones y problemas técnicos."},
  {name:"Edad, sexo y educación",role:"Covariables / moderadores",definition:"Registrar de forma explícita, definir codificación y justificar inclusión. La educación puede actuar como proxy parcial de reserva cognitiva, no como medida completa."}
 ],
 objectives:[
  "O1 · Describir la producción total por grupo y explorar diferencias según edad, sexo y educación.",
  "O2 · Evaluar si la frecuencia léxica de las respuestas difiere entre grupos y si la educación modifica esa relación.",
  "O3 · Analizar diversidad y organización semántica mediante similitud vectorial, clustering y switching, considerando educación y reserva cognitiva.",
  "O4 · Estimar la capacidad discriminativa de frecuencia y similitud semántica, comparadas con variables conductuales tradicionales.",
  "O5 · Explorar latencia inicial e intervalos inter-respuesta como indicadores de acceso léxico y eficiencia ejecutiva, y su contribución a la diferenciación entre grupos."
 ],
 pipeline:[
  {step:"01 · Protocolo",detail:"Preespecificar hipótesis, criterios de grupo, tarea, consigna, duración, categoría semántica, grabación, transcripción y reglas de puntuación."},
  {step:"02 · Curación",detail:"Anonimizar; revisar transcripciones; conservar forma original y lema; marcar repeticiones, intrusiones, variantes regionales, errores y casos ambiguos con reglas reproducibles."},
  {step:"03 · Variables léxicas",detail:"Vincular cada respuesta con corpus de frecuencia del español. Informar cobertura, variedad, año, tamaño, unidad de frecuencia y tratamiento de nombres propios o formas flexionadas."},
  {step:"04 · Representación vectorial",detail:"Elegir y versionar embeddings entrenados en corpus adecuados al español. Comparar, si es posible, modelos generales y corpus regionales; registrar dimensión, ventana, algoritmo y OOV."},
  {step:"05 · Métricas por participante",detail:"Calcular medias/medianas de frecuencia, diversidad, similitud semántica intra-lista y secuencial, clustering, switching y medidas temporales; ponderar la dependencia de longitud de lista."},
  {step:"06 · Estadística",detail:"Describir distribución y datos faltantes; modelos lineales/generalizados o mixtos según estructura; ajustar covariables justificadas; informar tamaños de efecto e intervalos de confianza."},
  {step:"07 · Discriminación",detail:"ROC/AUC y validación cruzada anidada si se construyen modelos predictivos. Separar entrenamiento y prueba por participante; evitar fuga de datos y sobreajuste."},
  {step:"08 · Reproducibilidad",detail:"Guardar diccionario, scripts, versiones, decisiones de limpieza, semillas, plan analítico y registro de exclusiones. Publicar datos solo con consentimiento y desidentificación suficiente."}
 ],
 analysis:[
  {name:"Descriptivos",detail:"Media/DE o mediana/rango intercuartílico; distribución por grupo; histogramas y valores extremos; reportar n y datos faltantes."},
  {name:"Comparación entre grupos",detail:"ANOVA/ANCOVA solo si se cumplen supuestos y diseño; alternativas robustas o modelos generalizados según distribución. Para recuentos, considerar Poisson o binomial negativa si hay sobredispersión."},
  {name:"Educación y edad",detail:"Modelar covariables e interacciones preespecificadas (grupo × educación; grupo × edad) sin convertir asociaciones en causalidad ni sobreajustar."},
  {name:"Medidas repetidas",detail:"Modelos mixtos para respuestas o intervalos anidados en participante; incluir estructura de dependencia y efectos aleatorios apropiados."},
  {name:"Discriminación",detail:"ROC/AUC con IC, sensibilidad/especificidad en umbrales predefinidos y validación externa cuando sea posible. No seleccionar puntos de corte y reportar rendimiento en la misma muestra sin corrección."},
  {name:"Robustez",detail:"Análisis de sensibilidad a corpus, lematización, OOV, longitud de lista, exclusiones, subgrupos educativos y elección de modelo vectorial."}
 ],
 safeguards:[
  "Los embeddings capturan regularidades de un corpus; no representan directamente el conocimiento semántico de una persona ni su organización cerebral.",
  "Similitud coseno depende del modelo, corpus, frecuencia y cobertura; no debe interpretarse como una medida neurobiológica directa.",
  "La cantidad de respuestas afecta estabilidad de promedios y métricas vectoriales; reportar fiabilidad y sensibilidad a longitud de lista.",
  "No interpretar diferencias entre grupos como causalidad ni como biomarcador individual sin validación independiente.",
  "Definir protocolo ético, consentimiento, protección de datos y acceso restringido a audio/transcripciones."
 ],
 references:[
  ["Corvalán et al. — Normas de regresión para Buenos Aires: RAVLT, TMT, dígitos y fluencia verbal (2026)","https://pubmed.ncbi.nlm.nih.gov/42109160/"],
  ["Troyer et al. — Clustering and switching on verbal fluency tests (1997)","https://pubmed.ncbi.nlm.nih.gov/9150507/"],
  ["A Systematic Review of Available Normative Data on Neuropsychological Tests for Spanish Speakers (2025)","https://pmc.ncbi.nlm.nih.gov/articles/PMC12302697/"]
 ]
};
