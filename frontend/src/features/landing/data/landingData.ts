import type {
  CapillaInfoLanding,
  ActividadNinez,
  ActividadJuventud,
  ComunidadAdultos,
  TradicionParroquial,
  FormacionVocacional,
  SacramentoInfo,
  MinisterioCoroInfo,
} from '../types';

/**
 * 6 CAPILLAS DE NUESTRA PARROQUIA
 * Con horarios exactos, patronos, orden de encuentro y vida pastoral.
 * Resaltando nuestra comunidad viva y la comunión entre templos.
 */
export const CAPILLAS_LANDING: CapillaInfoLanding[] = [
  {
    id: 1,
    nombre: 'Parroquia Jesús Obrero',
    esCentral: true,
    patrono: 'San José Obrero',
    zona: 'Sede Central',
    direccion: 'Plaza Principal Jesús Obrero, Av. 16 de Julio',
    // Primera Comunión: Misa antes que el encuentro (09:20 a 10:10 puntual, 10:11 a 11:10 misa, 11:11 a 13:00 encuentro)
    misaComunion: '10:11 – 11:10 (Santa Misa)',
    encuentroComunion: '11:11 – 13:00 (Encuentro formativo)',
    horarioPuntualComunion: '09:20 – 10:10 (Llegada puntual y acogida)',
    // Confirmación: Encuentro antes que misa (15:40 a 16:10 puntual, 16:11 a 18:10 encuentro, 18:11 a 19:00 misa)
    misaConfirmacion: '18:11 – 19:00 (Santa Misa vespertina)',
    encuentroConfirmacion: '16:11 – 18:10 (Encuentro formativo juvenil)',
    horarioPuntualConfirmacion: '15:40 – 16:10 (Puntual antes del encuentro)',
    ordenEncuentro: 'encuentro_primero', // Para confirmación es encuentro primero
    descripcion:
      'Corazón y templo principal de nuestra comunidad parroquial. Un espacio de encuentro fraterno, dignidad y oración donde convergen las familias, niños de catequesis y movimientos juveniles en cada celebración litúrgica.',
    carisma: 'Dignidad del trabajador, fraternidad evangélica y servicio misionero a la comunidad.',
    imagenUrl: '/fondo_login_5.webp',
    imagenPlaceholderTexto: 'Fotografía oficial: Fachada principal y Altar del Templo Jesús Obrero',
  },
  {
    id: 2,
    nombre: 'Capilla Santa Teresa',
    esCentral: false,
    patrono: 'Santa Teresa de Jesús',
    zona: 'Comunidad Santa Teresa',
    direccion: 'Calle Principal Santa Teresa',
    // Misa antes que el encuentro en ambos
    misaComunion: '10:11 – 11:10 (Santa Misa dominical)',
    encuentroComunion: '11:11 – 13:00 (Encuentro catequético)',
    horarioPuntualComunion: '09:40 – 10:10 (Puntual antes de misa)',
    misaConfirmacion: '10:11 – 11:10 (Santa Misa comunitaria)',
    encuentroConfirmacion: '11:11 – 13:00 (Encuentro de confirmandos)',
    horarioPuntualConfirmacion: '09:40 – 10:10 (Puntual antes de misa)',
    ordenEncuentro: 'misa_primero',
    descripcion:
      'Comunidad viva caracterizada por su entusiasmo juvenil, espíritu de oración teresiana y el acompañamiento cálido y cercano a los niños de Primera Comunión y Confirmación.',
    carisma: 'Vida de oración profunda, acogida fraterna y compromiso solidario con las familias.',
    imagenUrl: 'https://images.unsplash.com/photo-1548625361-195fe578749a?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Capilla Santa Teresa y comunidad reunida en el templo',
  },
  {
    id: 3,
    nombre: 'Capilla Señor de la Santa Cruz',
    esCentral: false,
    patrono: 'La Santa Cruz del Señor',
    zona: 'Comunidad Santa Cruz',
    direccion: 'Avenida Cívica',
    // Misa antes que el encuentro en ambos
    misaComunion: '08:11 – 09:10 (Santa Misa matutina)',
    encuentroComunion: '09:11 – 11:00 (Encuentro formativo)',
    horarioPuntualComunion: '07:40 – 08:10 (Puntual antes de misa)',
    misaConfirmacion: '08:11 – 09:10 (Santa Misa matutina)',
    encuentroConfirmacion: '09:11 – 11:00 (Encuentro de jóvenes)',
    horarioPuntualConfirmacion: '07:40 – 08:10 (Puntual antes de misa)',
    ordenEncuentro: 'misa_primero',
    descripcion:
      'Reúne a familias madrugadoras y trabajadoras sobre la tradicional Avenida Cívica, quienes comienzan su domingo celebrando la Santa Eucaristía en un ambiente de profunda devoción a la Santa Cruz.',
    carisma: 'Fe incansable, espíritu de sacrificio y devoción comunitaria en la Santa Misa matutina.',
    imagenUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Altar del Señor de la Santa Cruz con fieles en eucaristía',
  },
  {
    id: 4,
    nombre: 'Capilla San Pablo',
    esCentral: false,
    patrono: 'San Pablo Apóstol',
    zona: 'Comunidad San Pablo',
    direccion: 'Calle 2, San Pablo',
    // Misa antes que el encuentro en ambos
    misaComunion: '08:11 – 09:10 (Santa Misa dominical)',
    encuentroComunion: '09:11 – 11:00 (Encuentro catequético)',
    horarioPuntualComunion: '07:40 – 08:10 (Puntual antes de misa)',
    misaConfirmacion: '08:11 – 09:10 (Santa Misa dominical)',
    encuentroConfirmacion: '09:11 – 11:00 (Encuentro juvenil)',
    horarioPuntualConfirmacion: '07:40 – 08:10 (Puntual antes de misa)',
    ordenEncuentro: 'misa_primero',
    descripcion:
      'Inspirada en el gran apóstol de las naciones, es una capilla dinámica y misionera con catequistas entregados a formar a niños y jóvenes en el Evangelio vivo y la participación litúrgica.',
    carisma: 'Celo apostólico, testimonio del Evangelio y animación comunitaria constante.',
    imagenUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Capilla San Pablo durante la bendición de niños y catequistas',
  },
  {
    id: 5,
    nombre: 'Capilla Santa María Magdalena',
    esCentral: false,
    patrono: 'Santa María Magdalena',
    zona: 'Comunidad San Juan',
    direccion: 'Calle Magisterio',
    // Casos de encuentro antes que misa para ambos (09:00 a 09:40 puntual, 09:41 a 11:40 encuentro, 11:41 a 12:30 misa)
    misaComunion: '11:41 – 12:30 (Santa Misa de clausura)',
    encuentroComunion: '09:41 – 11:40 (Encuentro formativo de niños)',
    horarioPuntualComunion: '09:00 – 09:40 (Puntual antes del encuentro)',
    misaConfirmacion: '11:41 – 12:30 (Santa Misa comunitaria)',
    encuentroConfirmacion: '09:41 – 11:40 (Encuentro de confirmación)',
    horarioPuntualConfirmacion: '09:00 – 09:40 (Puntual antes del encuentro)',
    ordenEncuentro: 'encuentro_primero',
    descripcion:
      'Una comunidad fraterna donde los catecúmenos inician la mañana con sus talleres de reflexión bíblica y dinámicas vivenciales, culminando en la celebración gozosa de la Santa Eucaristía.',
    carisma: 'Testimonio de la Resurrección, pedagogía participativa y alegría del discipulado.',
    imagenUrl: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Encuentro formativo y misa en la Capilla Santa María Magdalena',
  },
  {
    id: 6,
    nombre: 'Capilla San Martín de Porres',
    esCentral: false,
    patrono: 'San Martín de Porres',
    zona: 'Comunidad Villa Esperanza',
    direccion: 'Calle 4, Villa Esperanza',
    // Misa antes que el encuentro en ambos
    misaComunion: '08:11 – 09:10 (Santa Misa dominical)',
    encuentroComunion: '09:11 – 11:00 (Catequesis de niños)',
    horarioPuntualComunion: '07:40 – 08:10 (Puntual antes de misa)',
    misaConfirmacion: '08:11 – 09:10 (Santa Misa dominical)',
    encuentroConfirmacion: '09:11 – 11:00 (Encuentro juvenil)',
    horarioPuntualConfirmacion: '07:40 – 08:10 (Puntual antes de misa)',
    ordenEncuentro: 'misa_primero',
    descripcion:
      'Guiada por la humildad y la caridad de San Martín de Porres, destaca por su espíritu solidario, el compromiso de sus familias y el amor fraterno en cada una de sus actividades pastorales.',
    carisma: 'Humildad de corazón, servicio a los más sencillos y unión fraterna de las familias.',
    imagenUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Comunidad y altar de la Capilla San Martín de Porres',
  },
];

/**
 * ACTIVIDADES DE PRIMERA COMUNIÓN & GRUPO KAIROS
 */
export const ACTIVIDADES_NINEZ: ActividadNinez[] = [
  {
    id: 'festiparabolas',
    titulo: 'FestiParábolas',
    subtitulo: 'El Evangelio actuado y vivido por el corazón de los niños',
    temporada: 'Celebración Anual · Primera Comunión',
    participantes: 'Niños de 1er y 2do año de Primera Comunión',
    descripcion:
      'Una de las actividades más emotivas y esperadas del año en nuestra iglesia. Los niños de catequesis se organizan por grupos para dramatizar, relatar y actuar las hermosas parábolas de Jesús (el Buen Samaritano, el Hijo Pródigo, el Sembrador y la Oveja Perdida). Con vestuarios elaborados por ellos mismos, música y escenografía, el Evangelio cobra vida en el escenario parroquial frente a sus familias.',
    detalles: [
      'Dramatización en vivo de las parábolas bíblicas ante la asamblea parroquial',
      'Desarrollo de talentos artísticos, expresión oral y trabajo en equipo',
      'Integración viva entre los niños de las 6 capillas filiales',
      'Acompañamiento creativo de catequistas y padres de familia',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Niños de catequesis caracterizados actuando en el FestiParábolas',
    icono: '🎭',
    etiqueta: 'Teatro y Fe',
  },
  {
    id: 'campamento-urbano',
    titulo: 'Campamento Urbano',
    subtitulo: 'Experiencia vivencial intensiva antes de recibir a Jesús en la Eucaristía',
    temporada: 'Una vez al año · Previo al Sacramento',
    participantes: 'Niños a punto de comulgar + Jóvenes de Confirmación y Comunidad Juvenil',
    descripcion:
      'Jornada completa y transformadora para los niños que están a punto de culminar su camino formativo y recibir por primera vez el Cuerpo de Cristo. En este campamento se repasa todo lo aprendido no como teoría, sino como vivencia práctica mediante juegos gigantes, dinámicas de perdón, oración del corazón y fogata simbólica. La actividad es planificada, guiada y animada con devoción por los jóvenes de 1er y 2do año de Confirmación junto a la Comunidad Juvenil.',
    detalles: [
      'Monitoreado y liderado por jóvenes de Confirmación y la Comunidad Juvenil',
      'Dinámicas experienciales de reconciliación, perdón y fraternidad',
      'Consolidación vivencial de los dos años de camino catequético',
      'Fogata simbólica, cantos de alabanza y vigilia eucarística de niños',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Niños y jóvenes monitores compartiendo juegos en el Campamento Urbano',
    icono: '⛺',
    etiqueta: 'Vivencia Eucarística',
  },
  {
    id: 'bailes-kermeses',
    titulo: 'Bailes y Danzas en las Kermeses',
    subtitulo: 'Alegría, cultura y agradecimiento de los niños en la fiesta comunitaria',
    temporada: 'Fechas de Kermeses Parroquiales',
    participantes: 'Catecúmenos de Comunión y sus familias',
    descripcion:
      'Los niños de Primera Comunión participan con gozo en las tradicionales kermeses de la iglesia, preparando coreografías y danzas folclóricas tradicionales que llenan de color el patio parroquial. Es una fiesta de acción de gracias donde los más pequeños comparten su alegría con toda la comunidad de fieles.',
    detalles: [
      'Presentación de danzas tradicionales y alabanzas con coreografía',
      'Fortalecimiento de la autoestima, hermandad y sentido de pertenencia eclesial',
      'Unión entre catequistas, niños y padres en ensayos y vestimentas',
      'Participación activa en el sostenimiento solidario de la parroquia',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Danzas folclóricas de niños de Primera Comunión en la kermés',
    icono: '💃',
    etiqueta: 'Arte y Tradición',
  },
  {
    id: 'kairos',
    titulo: 'Grupo Kairos',
    subtitulo: 'El tiempo de gracia para niños y adolescentes rumbo a la Confirmación',
    temporada: 'Encuentros Continuos · Todo el Año',
    participantes: 'Adolescentes en etapa de transición hacia la Confirmación',
    descripcion:
      'Un grupo muy especial y querido dentro de nuestra vida comunitaria. Reúne a niños y adolescentes que ya recibieron su Primera Comunión y participan activamente en las actividades de la iglesia, manteniéndose firmes en su crecimiento espiritual mientras esperan alcanzar la edad requerida para dar el paso a la Confirmación. En Kairos cultivan la amistad cristiana, liderazgo juvenil y amor por el servicio litúrgico.',
    detalles: [
      'Espacio puente entre la Primera Comunión y la catequesis de Confirmación',
      'Dinámicas juveniles, cine-foro con valores, juegos formativos y oración',
      'Participación activa en la liturgia, procesiones y festividades de la iglesia',
      'Compañerismo sano en una etapa clave de crecimiento humano y espiritual',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Adolescentes del Grupo Kairos en encuentro fraterno y dinámicas',
    icono: '⏳',
    etiqueta: 'Juventud en Espera Activa',
  },
];

/**
 * ACTIVIDADES DE CONFIRMACIÓN & COMUNIDAD JUVENIL (POST-CONFIRMACIÓN)
 */
export const ACTIVIDADES_JUVENTUD: ActividadJuventud[] = [
  {
    id: 'eje',
    titulo: 'E.J.E.',
    tipo: 'confirmacion',
    subtitulo: 'Encuentro de Jóvenes en el Espíritu',
    temporada: 'A mitad de camino en la Confirmación',
    lema: '"El Espíritu del Señor está sobre mí"',
    descripcion:
      'Un hito fundamental en la vivencia de la Confirmación. E.J.E. es un retiro experiencial de fin de semana donde los confirmandos descubren la presencia viva del Espíritu Santo a través de juegos de impacto, testimonios reales de fe, sociodramas y momentos de introspección profunda. Los jóvenes sanan heridas, encuentran sentido de trascendencia y reavivan su entusiasmo por seguir a Jesús.',
    caracteristicas: [
      'Retiro vivencial con juegos, reflexiones profundas y testimonios',
      'Experiencia del Espíritu Santo como amigo, guía y protector',
      'Desarrollo de madurez emocional y proyecto de vida cristiano',
      'Fortalecimiento de lazos de hermandad entre los grupos de confirmación',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Jóvenes en asamblea de alabanza y reflexión en el retiro E.J.E.',
    icono: '🕊️',
    etiquetas: ['#EJE', '#EspírituSanto', '#RetiroJuvenil', '#ConfirmaciónViva'],
  },
  {
    id: 'sicar',
    titulo: 'SICAR',
    tipo: 'confirmacion',
    subtitulo: 'El encuentro en el pozo que transforma el corazón',
    temporada: 'Hacia el final del servicio de Confirmación',
    lema: '"Dame de esa agua viva para que no tenga más sed"',
    descripcion:
      'Encuentro cumbre que se realiza casi al finalizar su servicio y preparación en Confirmación. Inspirado en el pasaje de la samaritana junto al pozo de Sicar, este retiro combina actividades divertidas y de integración con momentos de intensa reflexión personal, reconciliación y discernimiento maduro. Los jóvenes asumen su confirmación no como un trámite, sino como una misión para toda la vida.',
    caracteristicas: [
      'Experiencias vivenciales de impacto y dinámicas divertidas',
      'Profunda reflexión sobre la vocación, el perdón y el compromiso de fe',
      'Adoración eucarística con velas y acompañamiento espiritual cercano',
      'Consagración de la juventud al servicio de Dios y la comunidad',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Adoración y momentos de profunda espiritualidad en el retiro SICAR',
    icono: '💧',
    etiquetas: ['#SICAR', '#AguaViva', '#Discernimiento', '#ConfirmadosEnCristo'],
  },
  {
    id: 'apoyo-actividades',
    titulo: 'Servicio y Misión Juvenil',
    tipo: 'confirmacion',
    subtitulo: 'Los jóvenes de Confirmación al servicio de la Iglesia',
    temporada: 'Permanente durante el proceso de Confirmación',
    lema: '"El que no vive para servir, no sirve para vivir"',
    descripcion:
      'En nuestra parroquia la Confirmación se demuestra con obras. Los jóvenes de 1er y 2do año participan activamente como apoyo en las actividades de los más pequeños (Campamentos Urbanos de Primera Comunión), en el servicio litúrgico de las capillas y en las grandes obras solidarias de la comunidad.',
    caracteristicas: [
      'Liderazgo y animación en el Campamento Urbano de Primera Comunión',
      'Monitores solidarios en las Colonias de Verano',
      'Acogida, orden y servicio litúrgico dominical en las 6 capillas',
      'Participación entusiasta en campañas de ayuda y solidaridad parroquial',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Jóvenes de confirmación sirviendo y animando actividades infantiles',
    icono: '🤝',
    etiquetas: ['#MisiónJuvenil', '#ServicioActivo', '#AmorAlPrójimo'],
  },
  {
    id: 'comunidad-juvenil',
    titulo: 'Comunidad Juvenil',
    tipo: 'comunidad_juvenil',
    subtitulo: 'Perseverancia, amistad y servicio post-confirmación',
    temporada: 'Comunidad Permanente · Jóvenes Confirmados',
    lema: '"Jóvenes que perseveran en la fe y la amistad verdadera"',
    descripcion:
      'Nuestra hermosa comunidad formada por aquellos jóvenes que ya recibieron el sacramento de la Confirmación y han elegido voluntariamente seguir caminando juntos. La Comunidad Juvenil es el motor alegre de la parroquia: apoyan en cada evento litúrgico, organizan actividades pastorales y viven la fe en un clima de amistad sana, apoyo mutuo y fraternidad.',
    caracteristicas: [
      'Espacio de perseverancia y crecimiento espiritual tras la Confirmación',
      'Colaboración directa en las liturgias, retiros y celebraciones centrales',
      'Formación continua en liderazgo pastoral y valores evangélicos',
      'Un hogar de amigos que se cuidan, se escuchan y crecen juntos en Cristo',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Grupo de la Comunidad Juvenil compartiendo cantos y amistad',
    icono: '🌟',
    etiquetas: ['#ComunidadJuvenil', '#PostConfirmación', '#JóvenesEnCristo', '#FamiliaParroquial'],
  },
  {
    id: 'campamento-juvenil',
    titulo: 'Campamento Juvenil Anual',
    tipo: 'comunidad_juvenil',
    subtitulo: 'Aventura, celebración y fraternidad en la naturaleza',
    temporada: 'Una vez al año · Exclusivo de la Comunidad Juvenil',
    lema: '"Celebrando la vida, la constancia y la fe compartida"',
    descripcion:
      'Una vez al año, los jóvenes de la Comunidad Juvenil se trasladan a un campamento especial para desconectarse de la rutina y celebrar su perseverancia en la iglesia. Viven días de aventura, fogatas de hermandad, dinámicas de liderazgo, desafíos grupales y oración bajo las estrellas, reconociendo el esfuerzo y entrega de cada joven en el servicio parroquial.',
    caracteristicas: [
      'Reconocimiento al compromiso y participación continua de los jóvenes',
      'Actividades de aventura al aire libre, trabajo en equipo y fogata de comunión',
      'Momentos de diálogo íntimo, gratitud y renovación de promesas comunitarias',
      'Celebración eucarística juvenil en medio de la naturaleza',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Fogata y carpas del Campamento Juvenil bajo las estrellas',
    icono: '🔥',
    etiquetas: ['#CampamentoJuvenil', '#AventuraEnDios', '#FogataDeFe', '#Hermandad'],
  },
  {
    id: 'fraternidad-juvenil',
    titulo: 'Encuentros Fraternos y Fiestas de Tradición',
    tipo: 'fraternidad',
    subtitulo: 'Sana diversión, risas y hermandad en cada época del año',
    temporada: 'A lo largo de todo el año (Navidad, San Juan, Carnavales, etc.)',
    lema: '"La alegría del Señor es nuestra fuerza"',
    descripcion:
      'En la iglesia también sabemos divertirnos con pureza de corazón. La Comunidad Juvenil vive momentos memorables de esparcimiento fraterno: desde el tradicional intercambio de regalos en Navidad, el concurso y fiesta de disfraces en Carnavales o Halloween, hasta la fogata con noche de panchos en San Juan. Espacios que consolidan amistades verdaderas para toda la vida.',
    caracteristicas: [
      'Noche de fogata y panchos compartidos en las vísperas de San Juan',
      'Concurso creativo de disfraces en carnavales y festividades',
      'Intercambio de regalos, villancicos y cena navideña comunitaria',
      'Tardes de juegos de mesa, cine juvenil y dinámicas de integración',
    ],
    imagenUrl: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Jóvenes compartiendo risas y noche de convivencia fraterna',
    icono: '🎉',
    etiquetas: ['#SanJuanConPanchos', '#NavidadFraterna', '#DisfracesCreativos', '#AmistadSana'],
  },
];

/**
 * COMUNIDADES DE VIDA: JÓVENES ADULTOS & ADULTOS MAYORES
 */
export const COMUNIDADES_ADULTOS: ComunidadAdultos[] = [
  {
    id: 'jovenes-adultos',
    nombre: 'Comunidad de Jóvenes Adultos',
    rangoEdad: 'Mayores de 25 años en adelante',
    frecuencia: 'Encuentros quincenales y mensuales',
    mision: 'Integrar la fe cristiana en la vida profesional, familiar y laboral.',
    descripcion:
      'Un espacio cálido y formativo pensado para profesionales, trabajadores y jóvenes mayores de 25 años que continúan activamente comprometidos con su fe. A través de tertulias, análisis evangélico de los desafíos del mundo actual, jornadas de discernimiento y oración, fortalecen su testimonio cristiano en sus respectivos ambientes de trabajo y sociedad.',
    actividades: [
      'Tertulias éticas sobre fe, trabajo, sociedad y vocación matrimonial',
      'Círculos de oración, lectura bíblica orante (Lectio Divina) y reconciliación',
      'Proyectos de voluntariado y apoyo pastoral a las capillas filiales',
      'Convivencias de fin de semana y retiros de silencio para profesionales',
    ],
    icono: '💼',
    imagenUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Jóvenes adultos en mesa de diálogo y reflexión evangélica',
  },
  {
    id: 'adultos-mayores',
    nombre: 'Comunidad de Adultos Mayores',
    rangoEdad: 'Personas de la tercera edad y abuelitos de la parroquia',
    frecuencia: 'Reuniones semanales y eucaristías dedicadas',
    mision: 'Ser manantial de sabiduría, oración constante y memoria viva de la comunidad.',
    descripcion:
      'Nuestros adultos mayores son el tesoro de oración y la memoria histórica de nuestra parroquia. Esta comunidad les ofrece un espacio de cariño, compañía, cuidado de la salud física y espiritual, donde rezan el Santo Rosario, comparten anécdotas de vida, realizan talleres de manualidades y reciben el abrazo agradecido de toda la familia eclesial.',
    actividades: [
      'Rezo diario y semanal del Santo Rosario por las intenciones del mundo',
      'Talleres de estimulación de la memoria, dinámicas suaves y manualidades',
      'Tardes de té, chocolatadas fraternas y tertulias de anécdotas históricas',
      'Acompañamiento espiritual y visitas a los hermanos con salud delicada',
    ],
    icono: '👵👴',
    imagenUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Adultos mayores compartiendo sonrisas y momentos de devoción',
  },
];

/**
 * GRANDES TRADICIONES & ACTIVIDADES GENERALES DE LA IGLESIA
 */
export const TRADICIONES_PARROQUIALES: TradicionParroquial[] = [
  {
    id: 'colonias-verano',
    nombre: 'Colonias de Verano "Mis Felices Vacaciones"',
    fecha: 'A partir del 25 de Diciembre · Duración de 4 a 5 días',
    destinatarios: 'Niños de escasos recursos y familias de la comunidad',
    descripcion:
      'Una de las obras más nobles, queridas e históricas de nuestra parroquia. Justo al comenzar la Navidad, desde el 25 de diciembre durante 4 a 5 días intensivos, abrimos nuestras puertas a cientos de niños de escasos recursos para brindarles unas vacaciones llenas de amor, desayuno y almuerzo nutritivo, talleres de arte, teatro, paseos y juegos. Los monitores que cuidan con ternura a los niños son los jóvenes de 1er y 2do año de Confirmación junto a la Comunidad Juvenil.',
    destacados: [
      'Inicia el 25 de diciembre y dura 4 a 5 días de fiesta comunitaria',
      'Alimentación nutritiva diaria y refrigerios para todos los niños inscritos',
      'Monitoreo activo por jóvenes de Confirmación y Comunidad Juvenil',
      'Talleres artísticos, títeres, música y valores cristianos solidarios',
    ],
    icono: '☀️',
    imagenUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Patio parroquial lleno de niños en juegos y talleres en las Colonias',
    etiqueta: 'Obra Social Insigne',
  },
  {
    id: 'jesucristo-superstar',
    nombre: 'Obra Teatral "Jesucristo SuperStar"',
    fecha: 'Temporada Cuaresmal y Semana Santa',
    destinatarios: 'Abierto a niños, adolescentes, jóvenes y adultos de la iglesia',
    descripcion:
      'Impresionante producción musical y teatral donde participan feligreses de todas las edades que deseen actuar, cantar o apoyar en escenografía. Pequeños, adolescentes, jóvenes y adultos recrean la Pasión, Muerte y Resurrección de Jesús con un mensaje profundo de redención, esperanza y arte cristiano que conmueve a toda la comunidad.',
    destacados: [
      'Convocatoria abierta para actuar sin importar la edad',
      'Música en vivo, canto coral, coreografías y vestuario de época',
      'Presentaciones públicas gratuitas en el templo y auditorios parroquiales',
      'Evangelización viva a través del arte dramático y la emoción',
    ],
    icono: '🎭',
    imagenUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Puesta en escena de la obra teatral con actores de la comunidad',
    etiqueta: 'Arte y Evangelización',
  },
  {
    id: 'kermeses-solidarias',
    nombre: 'Grandes Kermeses Parroquiales',
    fecha: 'Fiesta Patronal de Mayo y Aniversario Parroquial',
    destinatarios: 'Toda la familia parroquial y vecinos de las 6 capillas',
    descripcion:
      'El evento gastronómico y solidario por excelencia de nuestra iglesia. Se organiza con el trabajo voluntario de las 6 capillas para recaudar fondos que hacen posible el mantenimiento de los templos, comedores solidarios y medicinas para hermanos enfermos. Con platos tradicionales preparados con amor, tómbolas, juegos y los bailes de los niños de Primera Comunión.',
    destacados: [
      'Unión fraterna y coordinada de las 6 capillas filiales',
      'Variada gastronomía tradicional y repostería artesanal preparada por las familias',
      'Bailes y danzas presentadas por niños de Primera Comunión',
      'Fondos 100% transparentes destinados a obras sociales e infraestructura eclesial',
    ],
    icono: '🍲',
    imagenUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Familias disfrutando en las mesas de la gran kermés parroquial',
    etiqueta: 'Solidaridad y Familia',
  },
  {
    id: 'oraciones-hakuna',
    nombre: 'Oraciones al Estilo Hakuna',
    fecha: 'Fechas Especiales Convocadas Durante el Año (No rutinarias)',
    destinatarios: 'Jóvenes, adolescentes y fieles de todas las capillas',
    descripcion:
      'Encuentros de adoración eucarística con un estilo fresco, profundo y vibrante. Con el Santísimo Sacramento expuesto en el centro, velas encendidas, música contemporánea de adoración y momentos de silencio sobrecogedor. No siguen una rutina fija de domingo; se convocan en fechas especiales convirtiéndose en oasis de paz y renovación del alma.',
    destacados: [
      'Adoración eucarística cara a cara con Jesús Sacramentado',
      'Cantos de adoración contemporánea acompañados de guitarras acústicas',
      'Ambiente tenue iluminado por cientos de velas en el templo',
      'Confesiones disponibles y momentos de recogimiento íntimo',
    ],
    icono: '🕯️',
    imagenUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Custodia eucarística iluminada con velas y jóvenes en adoración Hakuna',
    etiqueta: 'Adoración y Alabanza',
  },
  {
    id: 'viajes-copacabana',
    nombre: 'Peregrinaciones al Santuario de Copacabana',
    fecha: 'Fechas y Épocas Marianas Especiales',
    destinatarios: 'Familias, jóvenes y grupos pastorales de la parroquia',
    descripcion:
      'Tradicionales viajes comunitarios hacia las orillas del Lago Sagrado y los pies de la Mamita de Copacabana. En caravana fraterna, los fieles viajan para orar, agradecer las bendiciones recibidas, renovar promesas familiares y estrechar lazos entre los miembros de las 6 capillas.',
    destacados: [
      'Peregrinación guiada con momentos de rezo del rosario y cantos en el trayecto',
      'Santa Eucaristía en la Basílica de Nuestra Señora de Copacabana',
      'Subida al Calvario en oración y bendición de objetos de fe',
      'Convivencia fraterna y almuerzo comunitario a orillas del lago',
    ],
    icono: '⛵',
    imagenUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Fieles parroquiales en peregrinación a los pies de la Virgen de Copacabana',
    etiqueta: 'Devoción Mariana',
  },
  {
    id: 'romeria-juvenil',
    nombre: 'Romería Juvenil',
    fecha: 'Jornada Anual de la Juventud',
    destinatarios: 'Comunidad Juvenil y jóvenes de Confirmación',
    descripcion:
      'Una alegre y colorida marcha o caminata de fe organizada por la Comunidad Juvenil. Con pancartas, cantos, bombos y entusiasmo cristiano, los jóvenes caminan juntos celebrando su presencia viva, constante y comprometida en el corazón de la iglesia.',
    destacados: [
      'Marcha festiva que visibiliza la alegría y esperanza de la juventud católica',
      'Pancartas con frases del Papa y mensajes bíblicos de aliento',
      'Estaciones de canto, dinámicas y oración en las calles de la comunidad',
      'Culmina con una eucaristía de acción de gracias y merienda compartida',
    ],
    icono: '🚶‍♂️',
    imagenUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Jóvenes en alegre marcha con estandartes y guitarras en la Romería',
    etiqueta: 'Testimonio Público',
  },
  {
    id: 'misa-pascua',
    nombre: 'Solemne Vigilia y Misa Pascual de 3 Horas',
    fecha: 'Sábado Santo por la Noche · Pascua de Resurrección',
    destinatarios: 'Toda la asamblea de las 6 capillas unidas',
    descripcion:
      'La celebración madre de todas las vigilias cristianas. Una misa solemne y especial de 3 horas de duración donde se enciende el Fuego Nuevo en el exterior del templo, se bendice el Cirio Pascual, se entona el Pregón de Pascua en la oscuridad y se proclama con júbilo que ¡Cristo ha resucitado verdaderamente! Los cantos triunfales, el toque de campanas y la renovación de las promesas bautismales llenan de gozo el templo.',
    destacados: [
      'Bendición del Fuego Nuevo en la noche y encendido del Cirio Pascual',
      'Liturgia de la Palabra con las 7 lecturas bíblicas de la salvación',
      'Bendición del Agua Bautismal y aspersión a todos los presentes',
      '3 horas de vivencia solemne con coro, órgano y campanadas de resurrección',
    ],
    icono: '🔥',
    imagenUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: El Fuego Nuevo y el Cirio Pascual en la solemne Vigilia de Resurrección',
    etiqueta: 'Fiesta Central de la Fe',
  },
];

/**
 * FORMACIONES A UN NIVEL MAYOR: VOCACIONES CONSAGRADAS Y SACERDOTALES
 */
export const VOCACIONES_MAYOR: FormacionVocacional[] = [
  {
    id: 'misioneros-cristo-pastor',
    titulo: 'Misioneros de Cristo Pastor',
    destino: 'Chile (Seminario y Casa de Formación Sacerdotal)',
    vocacion: 'Formación hacia el Sacerdocio Ministerial',
    destinatarios: 'Jóvenes de nuestra comunidad con inquietud sacerdotal',
    nombreHermandad: 'En el proceso formativo son llamados afectuosamente "Hermanos"',
    descripcion:
      'Una vocación sublime que nace en el seno de nuestra comunidad. Jóvenes generosos que sienten la llamada de Dios a entregar su vida al pastoreo de las almas viajan a Chile para cursar estudios filosóficos, teológicos y vivir en comunidad sacerdotal. Durante su camino formativo son conocidos como "hermanos", preparándose con rigor espiritual y entrega fraterna para ser los futuros sacerdotes y padres espirituales de la Iglesia.',
    etapas: [
      'Discernimiento vocacional acompañado por el párroco y directores espirituales',
      'Traslado y residencia formativa en Chile con la comunidad de formadores',
      'Etapa discipular como "Hermanos": oración, estudios teológicos y vida comunitaria',
      'Ordenación sacerdotal para el servicio de los más humildes',
    ],
    icono: '✝️',
    imagenUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Hermanos seminaristas en oración y estudio teológico',
  },
  {
    id: 'salesianas-misioneras',
    titulo: 'Salesianas Misioneras',
    destino: 'Cochabamba (Noviciado y Casa Religiosa)',
    vocacion: 'Vida Consagrada Femenina y Misión Religiosa',
    destinatarios: 'Jovencitas de nuestra comunidad llamadas a la vida consagrada',
    nombreHermandad: 'Hermanas Religiosas y Monjas Misioneras',
    descripcion:
      'Jovencitas de nuestra parroquia que han sentido en su corazón la llamada radical a consagrarse como esposas de Cristo y madres espirituales de la niñez y la juventud. Viajan a Cochabamba para integrarse a la casa de formación de las Salesianas Misioneras, dedicando años de preparación espiritual, votos de pobreza, castidad y obediencia, y preparándose para servir en misiones educativas y caritativas.',
    etapas: [
      'Proceso de aspirantado y acompañamiento vocacional en la parroquia',
      'Partida a Cochabamba para las etapas de postulantado y noviciado',
      'Profusión de votos religiosos temporales y perpetuos',
      'Misión pastoral educando niños, consolando a necesitados y orando por la Iglesia',
    ],
    icono: '🌸',
    imagenUrl: 'https://images.unsplash.com/photo-1548625361-195fe578749a?auto=format&fit=crop&w=1000&q=80',
    imagenPlaceholderTexto: 'Fotografía: Hermanas consagradas en labor misionera y comunitaria',
  },
];

/**
 * MINISTERIO DE CORO PARROQUIAL
 */
export const MINISTERIO_CORO: MinisterioCoroInfo = {
  nombre: 'Ministerio de Coro e Instrumentos Litúrgicos',
  lema: '"Cantar es orar dos veces" — San Agustín',
  descripcion:
    'Grupo pastoral que reúne a todas aquellas personas interesadas en la música, la ejecución de instrumentos (guitarras, teclados, bajo, percusión, instrumentos de viento) y el canto litúrgico. A través de sus armonías y voces, animan las celebraciones de cada domingo, solemnidades, vigilias de adoración y fiestas patronales, ayudando a la asamblea a elevar el corazón hacia Dios.',
  integrantes: 'Abierto a niños con aptitud, jóvenes y adultos entusiastas del canto y la música',
  ensayos: 'Sábados por la tarde en el Templo Central Jesús Obrero y capillas filiales',
  instrumentos: ['Guitarras acústicas y electroacústicas', 'Teclados y sintetizadores', 'Instrumentos autóctonos y de viento', 'Cajón peruano y percusión litúrgica', 'Voces corales (sopranos, contraltos, tenores, bajos)'],
  imagenUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
  imagenPlaceholderTexto: 'Fotografía: Coro parroquial con instrumentos afinando alabanzas en el altar',
};

/**
 * SACRAMENTOS QUE SE CELEBRAN EN NUESTRA PARROQUIA
 */
export const SACRAMENTOS_INFO: SacramentoInfo[] = [
  {
    id: 'bautismo',
    nombre: 'Santo Bautismo',
    destinatarios: 'Bebés, niños y catecúmenos en preparación',
    duracion: 'Charlas Pre-Bautismales para Padres y Padrinos',
    descripcion:
      'La puerta de entrada a la vida de la Iglesia y a la gracia divina. Por el agua y el Espíritu Santo somos lavados del pecado original y constituidos hijos amados de Dios e integrantes de la familia eclesial.',
    requisitos: [
      'Certificado de Nacimiento oficial del menor',
      'Fotocopias de cédula de identidad de padres y padrinos',
      'Padrinos con sacramento de Confirmación',
      'Asistencia a las charlas prebautismales formativas',
    ],
    icono: '💧',
  },
  {
    id: 'primera-comunion',
    nombre: 'Primera Comunión (Eucaristía)',
    destinatarios: 'Niñas y niños desde los 9 años cumplidos',
    duracion: '2 Años de Formación Catequética y Litúrgica',
    descripcion:
      'El sacramento donde los niños reciben por primera vez el Cuerpo y la Sangre de Jesús, fuente y culmen de toda la vida cristiana. Dos años de alegre catequesis, FestiParábolas y Campamento Urbano.',
    requisitos: [
      'Fe de Bautismo original del niño/a',
      'Cédula de Identidad del niño y de los padres',
      'Participación activa en los encuentros dominicales y Santa Misa',
      'Asistencia de los padres a los talleres bimestrales de familia',
    ],
    icono: '🍞',
  },
  {
    id: 'confirmacion',
    nombre: 'Confirmación en el Espíritu',
    destinatarios: 'Adolescentes y jóvenes desde los 14 años',
    duracion: '2 Años de Crecimiento Espiritual y Servicio',
    descripcion:
      'Plenitud de la gracia bautismal que imprime carácter y derrama los dones del Espíritu Santo. Los jóvenes se convierten en testigos valientes de Cristo con experiencias vivenciales como E.J.E. y SICAR.',
    requisitos: [
      'Certificado de Bautismo y Primera Comunión',
      'Cédula de Identidad del joven',
      'Padrino o madrina con vida cristiana activa y confirmado',
      'Participación en los retiros E.J.E., SICAR y servicio parroquial',
    ],
    icono: '🕊️',
  },
  {
    id: 'matrimonio',
    nombre: 'Santo Matrimonio',
    destinatarios: 'Parejas que desean consagrar su amor ante el altar de Dios',
    duracion: 'Cursillo Prematrimonial y Acompañamiento Pastoral',
    descripcion:
      'Alianza sagrada donde un hombre y una mujer se unen en un pacto de amor indisoluble, fidelidad y apertura generosa a la vida, bendecidos por la presencia de Cristo que habita en su hogar.',
    requisitos: [
      'Certificados actualizados de Bautismo y Confirmación de los novios',
      'Certificado de Soltería eclesiástica',
      'Participación obligatoria en el cursillo prematrimonial',
      'Entrevista matrimonial canónica con el sacerdote',
    ],
    icono: '💍',
  },
  {
    id: 'confesion',
    nombre: 'Confesión y Reconciliación',
    destinatarios: 'Todo fiel cristiano que busca el perdón de sus pecados',
    duracion: 'Atención durante las Misas dominicales y en Despacho Parroquial',
    descripcion:
      'El sacramento de la infinita misericordia divina. Cristo, a través del sacerdote, perdona nuestras faltas, sana el corazón y nos devuelve la paz interior para volver a empezar con gracia renovada.',
    requisitos: [
      'Examen de conciencia sincero',
      'Dolor de los pecados y arrepentimiento',
      'Propósito firme de enmienda',
      'Decir los pecados al sacerdote y cumplir la penitencia de amor',
    ],
    icono: '🙏',
  },
];

/**
 * CIFRAS DESTACADAS DE NUESTRA PARROQUIA
 */
export const CIFRAS_DESTACADAS = [
  { valor: '6', etiqueta: 'Capillas Hermanas', detalle: 'Unidas en una sola familia parroquial' },
  { valor: '26', etiqueta: 'Grupos de Catequesis', detalle: 'Acompañados por catequistas laicos' },
  { valor: '+1000', etiqueta: 'Fieles y Familias', detalle: 'Que celebran y crecen domingo a domingo' },
  { valor: '50+', etiqueta: 'Años de Misión', detalle: 'Sembrando fe, caridad y esperanza viva' },
];
