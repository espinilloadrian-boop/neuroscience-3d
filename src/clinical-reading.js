// Lectura multimodal para los escenarios clínicos. Son hipótesis de trabajo, no reglas de localización.
export const clinicalReading = {
 ad: [
  ["Hallazgo de imagen","Atrofia temporomedial, cambios temporoparietales o carga vascular en FLAIR."],
  ["Hipótesis anatómico-funcional","Posible compromiso de circuitos temporomediales y redes de memoria episódica; la enfermedad vascular puede contribuir o modificar el perfil."],
  ["Qué contrastar en neuropsicología","Aprendizaje a través de ensayos, recuerdo diferido, beneficio de claves, reconocimiento, intrusiones, orientación y autonomía instrumental."],
  ["Qué no permite concluir","La atrofia hipocampal aislada no confirma Alzheimer, no determina estadio ni explica por sí sola el rendimiento individual."]
 ],
 tle: [
  ["Hallazgo de imagen","Asimetría o alteración de señal/arquitectura hipocampal, lesión temporal u otra anomalía en RM dedicada."],
  ["Hipótesis anatómico-funcional","Posible alteración del circuito temporolímbico; lateralidad y extensión pueden modular el perfil mnésico y lingüístico."],
  ["Qué contrastar en neuropsicología","Memoria verbal y visuoespacial, aprendizaje, denominación, lenguaje, funciones ejecutivas y lateralización; integrar semiología y EEG."],
  ["Qué no permite concluir","Una anomalía estructural no identifica por sí sola la zona de inicio ictal; una RM normal no excluye epilepsia."]
 ],
 stroke: [
  ["Hallazgo de imagen","Lesión aguda o crónica en un territorio vascular, con posible afectación cortical, subcortical o de sustancia blanca."],
  ["Hipótesis anatómico-funcional","La repercusión depende de topografía, volumen, desconexión de tractos, diasquisis, reserva y reorganización."],
  ["Qué contrastar en neuropsicología","Lenguaje, negligencia, praxis, atención, velocidad, memoria y funciones ejecutivas, seleccionados por clínica y territorio."],
  ["Qué no permite concluir","La topografía no predice de forma exacta el desempeño; el perfil debe reevaluarse durante la evolución y recuperación."]
 ],
 tbi: [
  ["Hallazgo de imagen","Contusiones, microhemorragias, lesión axonal o ausencia de hallazgos estructurales visibles."],
  ["Hipótesis anatómico-funcional","Puede existir afectación focal o distribuida y desconexión de redes; los síntomas también pueden estar modulados por factores no estructurales."],
  ["Qué contrastar en neuropsicología","Atención sostenida, velocidad, memoria de trabajo, aprendizaje, flexibilidad, inhibición, regulación emocional y funcionamiento cotidiano."],
  ["Qué no permite concluir","Una imagen convencional normal no descarta síntomas persistentes; DTI/tractografía no constituye un detector individual validado ni prueba causal."]
 ],
 ndd: [
  ["Hallazgo de imagen","Con frecuencia no hay un hallazgo específico; pueden detectarse anomalías estructurales si existe indicación neurológica."],
  ["Hipótesis anatómico-funcional","Los modelos de redes describen diferencias promedio heterogéneas, con amplio solapamiento entre personas."],
  ["Qué contrastar en neuropsicología","Historia evolutiva, lenguaje, atención, aprendizaje, funciones ejecutivas, comunicación social y conducta adaptativa en distintos contextos."],
  ["Qué no permite concluir","La RM, fMRI o DTI no confirma ni descarta por sí sola TEA, TDAH o un trastorno específico del aprendizaje."]
 ]

 ,
 vci: [
  ["Hallazgo de imagen","Infartos estratégicos o múltiples, lagunas, hiperintensidades de sustancia blanca y microhemorragias en SWI/GRE."],
  ["Hipótesis anatómico-funcional","Posible desconexión frontosubcortical, tálamo-cortical o de redes de asociación; ponderar localización, carga lesional y reserva cognitiva."],
  ["Qué contrastar en neuropsicología","Velocidad de procesamiento, atención, funciones ejecutivas, memoria, lenguaje, visuoconstrucción y cambio funcional respecto del nivel previo."],
  ["Qué no permite concluir","La carga de hiperintensidades no establece por sí sola demencia vascular ni causalidad. Considerar copatología neurodegenerativa y factores sistémicos."]
 ],
 bvftd: [
  ["Hallazgo de imagen","Atrofia frontal y temporal anterior, a menudo asimétrica; FDG-PET puede mostrar hipometabolismo frontotemporal en casos seleccionados."],
  ["Hipótesis anatómico-funcional","Compromiso de redes de saliencia, cognición social y control frontoinsular; las conexiones temporofrontales pueden contribuir al fenotipo."],
  ["Qué contrastar en neuropsicología","Cambio longitudinal de personalidad, empatía, inhibición, flexibilidad, conducta alimentaria, cognición social, lenguaje y autonomía; incluir informante."],
  ["Qué no permite concluir","Un perfil ejecutivo o conductual aislado y una imagen inespecífica no confirman bvFTD. El diagnóstico diferencial psiquiátrico y neurológico es central."]
 ],
 "pd-cognition": [
  ["Hallazgo de imagen","La RM convencional suele ser inespecífica; DAT-SPECT puede apoyar una pregunta dopaminérgica seleccionada, pero no estadifica cognición."],
  ["Hipótesis anatómico-funcional","Los circuitos frontoestriatales y frontoparietales pueden relacionarse con enlentecimiento, atención y funciones ejecutivas; algunos fenotipos comprometen redes posteriores."],
  ["Qué contrastar en neuropsicología","Atención, velocidad, flexibilidad, fluencia verbal, memoria de recuperación y visuoespacialidad; documentar estado ON/OFF, sueño, ánimo y demandas motoras."],
  ["Qué no permite concluir","No atribuir lentitud motora a déficit cognitivo sin controlar la respuesta. Distinguir deterioro leve y mayor por impacto en autonomía."]
 ]
};
