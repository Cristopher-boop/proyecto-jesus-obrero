/**
 * liturgicalData.ts — Datos teológicos, bíblicos y visuales del Año Litúrgico Católico.
 * 
 * Contiene el ciclo sagrado completo:
 * Adviento -> Navidad -> Tiempo Ordinario I -> Cuaresma -> Semana Santa (Ramos, Jueves Santo,
 * Viernes Santo, Vigilia Pascual) -> Pascua -> Pentecostés -> Santísima Trinidad -> 
 * Corpus Christi -> Tiempo Ordinario II -> Cristo Rey del Universo.
 */

import { LiturgicalSeason } from '@/core/context/ThemeContext';

export interface HolyWeekEvent {
  dayName: string;
  dateApprox: string;
  color: string;
  colorName: string;
  themeId: LiturgicalSeason;
  symbol: string;
  title: string;
  significance: string;
  keyGospel: string;
}

export interface LiturgicalStation {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  approxDates: string;
  colorHex: string;
  colorSecondaryHex: string;
  colorName: string;
  themeId: LiturgicalSeason;
  icon: string;
  latinMotto: string;
  scriptureVerse: string;
  scriptureReference: string;
  theologicalSummary: string;
  symbols: Array<{
    name: string;
    icon: string;
    description: string;
  }>;
  keyHymn: {
    title: string;
    latinTitle: string;
    meaning: string;
  };
  pastoralFocus: string[];
  holyWeekDays?: HolyWeekEvent[];
  glowClass: string;
  badgeBg: string;
}

export const LITURGICAL_STATIONS: LiturgicalStation[] = [
  {
    id: 'adviento',
    order: 1,
    name: 'Adviento',
    subtitle: 'Tiempo de Espera, Esperanza y Preparación',
    approxDates: '4 semanas antes del 25 de Diciembre',
    colorHex: '#4A2040',
    colorSecondaryHex: '#C5A059',
    colorName: 'Morado de Espera (Rosa en Gaudete)',
    themeId: 'cuaresma',
    icon: '🕯️',
    latinMotto: 'Veni, Veni Emmanuel',
    scriptureVerse: 'Una voz clama en el desierto: Preparad el camino del Señor, enderezad sus sendas.',
    scriptureReference: 'Isaías 40, 3 / Marcos 1, 3',
    theologicalSummary: 'El Año Litúrgico comienza con el Adviento. Es un tiempo de preparación espiritual con una doble dimensión: recordar la primera venida del Hijo de Dios en la humildad de Belén y avivar la espera reverente de su segunda venida gloriosa (Parusía).',
    symbols: [
      { name: 'Corona de Adviento', icon: '🌿', description: 'Círculo de follaje verde que simboliza la eternidad de Dios y las 4 velas semanales (3 moradas y 1 rosada en domingo Gaudete).' },
      { name: 'La Luz Creciente', icon: '✨', description: 'Cada semana encendemos una vela para manifestar que la luz de Cristo vence progresivamente las tinieblas.' },
      { name: 'San Juan Bautista', icon: '📜', description: 'Voz que anuncia al Cordero de Dios y llama a la conversión del corazón.' },
    ],
    keyHymn: {
      title: 'Oh Ven, Oh Ven, Emmanuel',
      latinTitle: 'Veni, Veni, Emmanuel',
      meaning: 'Súplica ardiente de la Iglesia que clama la redención y salvación mesiánica.'
    },
    pastoralFocus: [
      'Oración en familia en torno a la Corona de Adviento.',
      'Obras de caridad y solidaridad con los más necesitados.',
      'Sacramento de la Reconciliación (Confesión) para recibir al Niño Dios con corazón puro.'
    ],
    glowClass: 'shadow-[0_0_35px_rgba(74,32,64,0.45)]',
    badgeBg: 'bg-[#4A2040]'
  },
  {
    id: 'navidad',
    order: 2,
    name: 'Navidad y Epifanía',
    subtitle: 'El Verbo se hizo Carne y Habitó entre Nosotros',
    approxDates: '25 de Diciembre al Bautismo del Señor (Enero)',
    colorHex: '#916B1E',
    colorSecondaryHex: '#D4AF37',
    colorName: 'Blanco Puro y Oro Radiante',
    themeId: 'pascua',
    icon: '🌟',
    latinMotto: 'Et Verbum Caro Factum Est',
    scriptureVerse: 'Porque nos ha nacido un niño, se nos ha concedido un hijo; la soberanía reposará sobre sus hombros.',
    scriptureReference: 'Isaías 9, 6 / Juan 1, 14',
    theologicalSummary: 'Celebramos el misterio inefable de la Encarnación: Dios asume nuestra naturaleza humana para redimirnos. La luz divina resplandece en la noche del mundo. Se extiende por la Octava de Navidad, la Epifanía (manifestación a los Reyes Magos) y el Bautismo del Señor.',
    symbols: [
      { name: 'El Pesebre / Nacimiento', icon: '👶', description: 'Inaugurado por San Francisco de Asís, recuerda la pobreza y ternura del Salvador recién nacido.' },
      { name: 'Estrella de Belén', icon: '⭐', description: 'Guía celestial que conduce a los sabios de oriente hacia la Luz Verdadera.' },
      { name: 'Oro, Incienso y Mirra', icon: '👑', description: 'Ofrendas que proclaman a Jesús como Rey (oro), Dios (incienso) y Redentor sufriente (mirra).' },
    ],
    keyHymn: {
      title: 'Gloria in Excelsis Deo',
      latinTitle: 'Cántico de los Ángeles en Belén',
      meaning: 'Alabanza celestial a Dios en las alturas y paz en la tierra a los hombres de buena voluntad.'
    },
    pastoralFocus: [
      'Celebración comunitaria de la Misa de Nochebuena / Misa de Gallo.',
      'Encuentro y reconciliación en los hogares ante el pesebre.',
      'Solidaridad con niños y familias en situación de vulnerabilidad.'
    ],
    glowClass: 'shadow-[0_0_35px_rgba(212,175,55,0.45)]',
    badgeBg: 'bg-[#916B1E]'
  },
  {
    id: 'ordinario-1',
    order: 3,
    name: 'Tiempo Ordinario (I)',
    subtitle: 'El Discipulado y la Vida Pública de Jesús',
    approxDates: 'Enero hasta Miércoles de Ceniza',
    colorHex: '#1E4D38',
    colorSecondaryHex: '#356F54',
    colorName: 'Verde Sacro (Esperanza y Crecimiento)',
    themeId: 'ordinario',
    icon: '🌿',
    latinMotto: 'Ambulamus in Novitate Vitae',
    scriptureVerse: 'El tiempo se ha cumplido y el Reino de Dios está cerca; convertíos y creed en el Evangelio.',
    scriptureReference: 'Marcos 1, 15',
    theologicalSummary: 'Tras el Bautismo del Señor, contemplamos las primeras enseñanzas, milagros y llamados al discipulado de Jesús a orillas del mar de Galilea. El color verde simboliza el crecimiento constante de la semilla del Reino en la vida cotidiana.',
    symbols: [
      { name: 'Espiga de Trigo', icon: '🌾', description: 'Símbolo del Evangelio que germina y da fruto abundante en la comunidad.' },
      { name: 'El Cayado del Pastor', icon: '🦯', description: 'Jesús como Buen Pastor que guía, protege y apacienta a su grey.' },
      { name: 'El Libro del Evangelio', icon: '📖', description: 'La Palabra proclamada domingo a domingo alimentando a los fieles.' },
    ],
    keyHymn: {
      title: 'Pueblo de Reyes',
      latinTitle: 'Populus Dei',
      meaning: 'Canto que reafirma la identidad bautismal de la Iglesia como pueblo sacerdotal y peregrino.'
    },
    pastoralFocus: [
      'Formación catequética dominical continua.',
      'Compromiso en la vida comunitaria y pastoral de las capillas filiales.',
      'Escucha atenta de la Palabra de Dios en la liturgia dominical.'
    ],
    glowClass: 'shadow-[0_0_35px_rgba(30,77,56,0.45)]',
    badgeBg: 'bg-[#1E4D38]'
  },
  {
    id: 'cuaresma',
    order: 4,
    name: 'Cuaresma',
    subtitle: 'Cuarenta Días de Conversión, Desierto y Gracia',
    approxDates: 'Desde Miércoles de Ceniza hasta Domingo de Ramos',
    colorHex: '#4A2040',
    colorSecondaryHex: '#733B66',
    colorName: 'Morado Penitencial y Ceniza',
    themeId: 'cuaresma',
    icon: '✝️',
    latinMotto: 'Memento, Homo, Quia Pulvis Es',
    scriptureVerse: 'Rasgad vuestro corazón y no vuestros vestidos; volved al Señor vuestro Dios, porque es clemente y compasivo.',
    scriptureReference: 'Joel 2, 13',
    theologicalSummary: 'Tiempo de gracia y conversión profunda que rememora los 40 días de Jesús en el desierto antes de su Pasión. La Iglesia nos invita a intensificar tres pilares: la Oración íntima con el Padre, el Ayuno que purifica el alma y la Limosna / Caridad que nos hermana con los pobres.',
    symbols: [
      { name: 'La Ceniza', icon: '🌫️', description: 'Imposición en la frente: "Polvo eres y al polvo volverás; conviértete y cree en el Evangelio".' },
      { name: 'La Cruz Desnuda', icon: '✝️', description: 'Recordatorio del sacrificio supremo y del camino del Calvario.' },
      { name: 'Vía Crucis', icon: '🚶‍♂️', description: 'Las 14 estaciones meditando los pasos de Jesús hacia la crucifixión.' },
    ],
    keyHymn: {
      title: 'Miserere Mei Deus / Perdona a tu Pueblo',
      latinTitle: 'Miserere (Salmo 50)',
      meaning: 'Súplica de perdón y purificación del corazón arrepentido.'
    },
    pastoralFocus: [
      'Práctica del Vía Crucis todos los viernes en el templo y capillas.',
      'Ayuno, abstinencia y campañas cuaresmales de solidaridad parroquial.',
      'Retiros de conversión para catecúmenos, jóvenes y padres de familia.'
    ],
    glowClass: 'shadow-[0_0_35px_rgba(74,32,64,0.5)]',
    badgeBg: 'bg-[#4A2040]',
    holyWeekDays: [
      {
        dayName: 'Domingo de Ramos',
        dateApprox: 'Inicio de la Semana Santa',
        color: '#721C24',
        colorName: 'Rojo Pasión',
        themeId: 'pentecostes',
        symbol: '🌿',
        title: 'Entrada Triunfal de Jesús en Jerusalén',
        significance: 'Bendición de las palmas y proclamación solemne de la Pasión de Cristo.',
        keyGospel: '¡Hosanna! ¡Bendito el que viene en nombre del Señor! (Mateo 21, 9)'
      },
      {
        dayName: 'Jueves Santo',
        dateApprox: 'Triduo Pascual - Misa de la Cena del Señor',
        color: '#916B1E',
        colorName: 'Blanco Eucarístico y Oro',
        themeId: 'pascua',
        symbol: '🍞🍷',
        title: 'Institución de la Eucaristía, el Sacerdocio y el Amor Fraterno',
        significance: 'Lavatorio de los pies, última cena y vigilia de adoración al Santísimo Monumento.',
        keyGospel: 'Haced esto en memoria mía... Os doy un mandamiento nuevo: que os améis los unos a los otros. (Juan 13, 34)'
      },
      {
        dayName: 'Viernes Santo',
        dateApprox: 'Triduo Pascual - Pasión y Muerte del Señor',
        color: '#721C24',
        colorName: 'Rojo Pasión y Luto Solemne',
        themeId: 'pentecostes',
        symbol: '✝️',
        title: 'Celebración de la Pasión y Adoración de la Santa Cruz',
        significance: 'Día de ayuno, silencio absoluto, liturgia de la Palabra, oración universal y veneración de la Cruz.',
        keyGospel: 'Todo está cumplido... E inclinando la cabeza, entregó el espíritu. (Juan 19, 30)'
      },
      {
        dayName: 'Sábado Santo / Vigilia Pascual',
        dateApprox: 'Noche Santa de la Resurrección',
        color: '#D4AF37',
        colorName: 'Blanco y Fuego Nuevo',
        themeId: 'pascua',
        symbol: '🔥🕊️',
        title: 'La Noche Santa: Fuego Nuevo, Pregón Pascual y Resurrección',
        significance: 'La madre de todas las vigilias: bendición del fuego, Cirio Pascual, bautismos y proclamación del Aleluya.',
        keyGospel: '¿Por qué buscáis entre los muertos al que vive? ¡No está aquí, ha resucitado! (Lucas 24, 5-6)'
      }
    ]
  },
  {
    id: 'pascua',
    order: 5,
    name: 'Tiempo Pascual',
    subtitle: '¡Cristo ha Resucitado! Cincuenta Días de Gozo Eterno',
    approxDates: 'Domingo de Resurrección hasta Pentecostés (50 días)',
    colorHex: '#916B1E',
    colorSecondaryHex: '#D4AF37',
    colorName: 'Blanco y Oro de Resurrección',
    themeId: 'pascua',
    icon: '🕊️',
    latinMotto: 'Surrexit Dominus Vere, Alleluia!',
    scriptureVerse: 'La muerte ha sido devorada en la victoria. ¿Dónde está, oh muerte, tu victoria? ¿Dónde está, oh sepulcro, tu aguijón?',
    scriptureReference: '1 Corintios 15, 54-55',
    theologicalSummary: 'Es el centro, corazón y cumbre de todo el Año Litúrgico. Durante 50 días ininterrumpidos celebramos la Resurrección gloriosa de Jesucristo y su triunfo definitivo sobre el pecado y la muerte. Concluye con la gloriosa Ascensión al Cielo y el envío del Espíritu Santo.',
    symbols: [
      { name: 'El Cirio Pascual', icon: '🕯️', description: 'Luz de Cristo Resucitado que ilumina al mundo: Alfa y Omega, principio y fin de los tiempos.' },
      { name: 'El Sepulcro Vacío', icon: '🌅', description: 'Testimonio de la Resurrección y promesa de nuestra propia inmortalidad.' },
      { name: 'El Cordero Pascual', icon: '🐑', description: 'Cristo inmolado que vive para siempre, victorioso sobre el mal.' },
    ],
    keyHymn: {
      title: 'Secuencia Pascual / Canto de Resurrección',
      latinTitle: 'Victimae Paschali Laudes',
      meaning: 'Himno lírico medieval proclamando el duelo a muerte entre la vida y la muerte, donde el Rey de la Vida reina vivo.'
    },
    pastoralFocus: [
      'Celebración de las Primeras Comuniones y Confirmaciones de los catecúmenos.',
      'Renovación solemne de las promesas bautismales con agua bendita.',
      'Fiesta patronal y testimonio de alegría pascual en todas las comunidades.'
    ],
    glowClass: 'shadow-[0_0_40px_rgba(212,175,55,0.55)]',
    badgeBg: 'bg-[#916B1E]'
  },
  {
    id: 'pentecostes',
    order: 6,
    name: 'Pentecostés',
    subtitle: 'La Efusión del Espíritu Santo y el Nacimiento de la Iglesia',
    approxDates: '50 días después de Pascua (Domingo)',
    colorHex: '#721C24',
    colorSecondaryHex: '#983640',
    colorName: 'Rojo Fuego del Espíritu Santo',
    themeId: 'pentecostes',
    icon: '🔥',
    latinMotto: 'Veni Sancte Spiritus',
    scriptureVerse: 'Se les aparecieron unas lenguas como de fuego que se repartieron y se posaron sobre cada uno de ellos; quedaron todos llenos del Espíritu Santo.',
    scriptureReference: 'Hechos de los Apóstoles 2, 3-4',
    theologicalSummary: 'Culminación de la Pascua. El Espíritu Santo prometido por Jesús desciende impetuosamente sobre María y los Apóstoles reunidos en el Cenáculo. Nace la Iglesia misionera, impulsada a proclamar el Evangelio a todas las naciones y lenguas con valentía.',
    symbols: [
      { name: 'Lenguas de Fuego', icon: '🔥', description: 'Símbolo del ardor misionero, la purificación y los 7 dones del Espíritu Santo.' },
      { name: 'La Paloma Blanca', icon: '🕊️', description: 'Paz divina, unción y presencia vivificante del Paráclito.' },
      { name: 'El Viento Impetuoso (Ruah)', icon: '💨', description: 'El soplo creador de Dios que renueva la faz de la tierra.' },
    ],
    keyHymn: {
      title: 'Ven Espíritu Creador',
      latinTitle: 'Veni Creator Spiritus',
      meaning: 'Invocación solemne al Espíritu Consolador pidiendo sus 7 sagrados dones.'
    },
    pastoralFocus: [
      'Vigilia solemne de Pentecostés con grupos juveniles (Kairós, Pastoral Juvenil).',
      'Envío apostólico de catequistas y agentes de pastoral.',
      'Oración por la unidad y el florecimiento de carismas en la parroquia.'
    ],
    glowClass: 'shadow-[0_0_35px_rgba(114,28,36,0.5)]',
    badgeBg: 'bg-[#721C24]'
  },
  {
    id: 'trinidad',
    order: 7,
    name: 'Santísima Trinidad',
    subtitle: 'Solemnidad de Dios Uno y Trino: Padre, Hijo y Espíritu Santo',
    approxDates: 'Primer Domingo después de Pentecostés',
    colorHex: '#916B1E',
    colorSecondaryHex: '#B58D38',
    colorName: 'Blanco Puro y Oro Solemne',
    themeId: 'pascua',
    icon: '☘️',
    latinMotto: 'In Nomine Patris, et Filii, et Spiritus Sancti',
    scriptureVerse: 'La gracia del Señor Jesucristo, el amor de Dios y la comunión del Espíritu Santo sean con todos vosotros.',
    scriptureReference: '2 Corintios 13, 13',
    theologicalSummary: 'Misterio central de la fe y de la vida cristiana: un solo Dios en tres Personas divinas perfectamente unidas en el Amor. El Padre que nos crea por amor, el Hijo que nos redime en la Cruz y el Espíritu Santo que nos santifica en la Iglesia.',
    symbols: [
      { name: 'Triquetra Sagrada', icon: '☘️', description: 'Tres arcos entrelazados que representan la perfecta unidad trinitaria sin principio ni fin.' },
      { name: 'El Ojo de la Providencia', icon: '👁️', description: 'El Padre Creador que vela con amor eterno por toda su creación.' },
      { name: 'Tres Círculos Entrelazados', icon: '⭕', description: 'Distinción de las tres personas y absoluta igualdad en la sustancia divina.' },
    ],
    keyHymn: {
      title: 'Santo, Santo, Santo',
      latinTitle: 'Sanctus, Sanctus, Sanctus',
      meaning: 'Trisagio angélico adorando la majestad infinita de la Trinidad Santa.'
    },
    pastoralFocus: [
      'Profundización catequética en el Credo y la identidad bautismal trinitaria.',
      'Vivir la comunión y la fraternidad en las familias como reflejo del amor de Dios.',
      'Santiguarse conscientemente: "En el nombre del Padre, y del Hijo, y del Espíritu Santo".'
    ],
    glowClass: 'shadow-[0_0_35px_rgba(181,141,56,0.45)]',
    badgeBg: 'bg-[#916B1E]'
  },
  {
    id: 'corpus-christi',
    order: 8,
    name: 'Corpus Christi',
    subtitle: 'Solemnidad del Santísimo Cuerpo y Sangre de Cristo',
    approxDates: 'Jueves / Domingo después de la Santísima Trinidad',
    colorHex: '#C5A059',
    colorSecondaryHex: '#916B1E',
    colorName: 'Oro Vivo y Blanco Eucarístico',
    themeId: 'pascua',
    icon: '✨',
    latinMotto: 'Ecce Panis Angelorum',
    scriptureVerse: 'Yo soy el pan vivo bajado del cielo. El que coma de este pan vivirá para siempre; y el pan que yo daré es mi carne para la vida del mundo.',
    scriptureReference: 'Juan 6, 51',
    theologicalSummary: 'Fiesta solemne donde la Iglesia rinde adoración pública y gozosa a la Presencia Real de Jesús en la Sagrada Eucaristía. La custodia dorada sale en procesión por las calles bendiciendo los altares, hogares y comunidades del pueblo de Dios.',
    symbols: [
      { name: 'La Custodia Radiante', icon: '🔆', description: 'Sol de oro con el viril transparente donde se expone y adora el Cuerpo de Cristo.' },
      { name: 'Trigo y Uvas', icon: '🍇🌾', description: 'Frutos de la tierra y del trabajo del hombre convertidos en el Cuerpo y la Sangre del Señor.' },
      { name: 'Alfombras de Flores y Aserrín', icon: '🌺', description: 'Homenaje popular y devoto para el paso solemne del Santísimo Sacramento.' },
    ],
    keyHymn: {
      title: 'Pange Lingua / Cantemos al Amor de los Amores',
      latinTitle: 'Tantum Ergo Sacramentum (Sto. Tomás de Aquino)',
      meaning: 'Himno eucarístico inmortal adorando el misterio del Altar y la Presencia Real.'
    },
    pastoralFocus: [
      'Procesión parroquial solemne de Corpus Christi por las calles de la comunidad.',
      'Horas santas y turnos de Adoración Eucarística nocturna.',
      'Recepción reverente de la Sagrada Comunión en estado de gracia.'
    ],
    glowClass: 'shadow-[0_0_45px_rgba(197,160,89,0.55)]',
    badgeBg: 'bg-[#C5A059]'
  },
  {
    id: 'ordinario-2',
    order: 9,
    name: 'Tiempo Ordinario (II)',
    subtitle: 'El Camino del Discipulado y el Reino en el Mundo',
    approxDates: 'Desde Pentecostés hasta Cristo Rey (Junio a Noviembre)',
    colorHex: '#1E4D38',
    colorSecondaryHex: '#143828',
    colorName: 'Verde Esperanza y Maduración Espiritual',
    themeId: 'ordinario',
    icon: '🌿',
    latinMotto: 'Fides Quae per Caritatem Operatur',
    scriptureVerse: 'Permaneced en mí, y yo en vosotros. Como el sarmiento no puede dar fruto por sí mismo si no permanece en la vid, así tampoco vosotros si no permanecéis en mí.',
    scriptureReference: 'Juan 15, 4',
    theologicalSummary: 'La etapa más extensa del año (hasta 34 semanas en total). Acompañamos a Jesús en su caminar hacia Jerusalén, profundizando en sus parábolas del Reino, sus exigencias evangélicas y el testimonio cristiano en el trabajo, la familia y la sociedad.',
    symbols: [
      { name: 'La Vid y los Sarmientos', icon: '🍇', description: 'Unión vital y constante con Cristo para dar frutos de santidad y justicia.' },
      { name: 'La Barca de Pedro', icon: '⛵', description: 'La Iglesia que navega en el mar de la historia guiada por el Espíritu.' },
      { name: 'La Lámpara Encendida', icon: '🪔', description: 'Vigilancia activa y testimonio luminoso de las buenas obras cristianas.' },
    ],
    keyHymn: {
      title: 'Tú Has Venido a la Orilla (Pescador de Hombres)',
      latinTitle: 'Vocatio Discipulorum',
      meaning: 'Canción vocacional de entrega al llamado de Jesús en la vida cotidiana.'
    },
    pastoralFocus: [
      'Fortalecimiento de la catequesis infantil, juvenil y de adultos.',
      'Misiones populares y visitas pastorales a las capillas filiales.',
      'Compromiso social cristiano y caridad activa en la parroquia.'
    ],
    glowClass: 'shadow-[0_0_35px_rgba(30,77,56,0.45)]',
    badgeBg: 'bg-[#1E4D38]'
  },
  {
    id: 'cristo-rey',
    order: 10,
    name: 'Cristo Rey del Universo',
    subtitle: 'Solemnidad de Jesucristo, Rey del Universo y Señor de la Historia',
    approxDates: 'Último Domingo del Tiempo Ordinario (Finales de Noviembre)',
    colorHex: '#C5A059',
    colorSecondaryHex: '#721C24',
    colorName: 'Blanco y Oro Imperial / Púrpura Regio',
    themeId: 'pascua',
    icon: '👑',
    latinMotto: 'Christus Vincit, Christus Regnat, Christus Imperat',
    scriptureVerse: 'Yo soy el Alfa y la Omega, el Principio y el Fin, el que es, el que era y el que ha de venir, el Todopoderoso.',
    scriptureReference: 'Apocalipsis 1, 8 / Juan 18, 37',
    theologicalSummary: 'Broche de oro y coronación de todo el Año Litúrgico. Proclama solemnemente que todo el cosmos, la historia humana y la eternidad convergen en Jesucristo: Rey cuyo trono es la Cruz, cuya corona es de espinas y amor, y cuyo Reino de verdad, justicia, paz y vida no tendrá fin.',
    symbols: [
      { name: 'Corona Imperial y Cetro', icon: '👑', description: 'Soberanía suprema de Cristo sobre todo principado terrenal y celestial.' },
      { name: 'Alfa y Omega (Α y Ω)', icon: '🔱', description: 'Cristo principio de la creación y meta final de toda la historia humana.' },
      { name: 'El Libro de la Vida', icon: '📜', description: 'Juicio final misericordioso donde seremos examinados en el amor.' },
    ],
    keyHymn: {
      title: '¡Christus Vincit, Christus Regnat, Christus Imperat!',
      latinTitle: 'Laudes Regiae',
      meaning: 'Himno triunfal aclamando a Cristo como Vencedor, Rey y Soberano del universo.'
    },
    pastoralFocus: [
      'Clausura del ciclo pastoral y acción de gracias por las bendiciones del año.',
      'Consagración de las familias y la parroquia al Sagrado Corazón de Jesús Rey.',
      'Preparación gozosa para dar inicio al nuevo ciclo con el Adviento.'
    ],
    glowClass: 'shadow-[0_0_45px_rgba(197,160,89,0.6)]',
    badgeBg: 'bg-[#C5A059]'
  }
];

export function getStationById(id: string): LiturgicalStation | undefined {
  return LITURGICAL_STATIONS.find(s => s.id === id);
}

/**
 * Calcula aproximadamente la estación litúrgica según una fecha.
 */
export function calculateCurrentStation(date: Date = new Date()): LiturgicalStation {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  const day = date.getDate();

  // Noviembre fin / Diciembre -> Adviento / Navidad
  if (month === 11) {
    if (day >= 25) return LITURGICAL_STATIONS.find(s => s.id === 'navidad')!;
    return LITURGICAL_STATIONS.find(s => s.id === 'adviento')!;
  }
  if (month === 0) {
    if (day <= 10) return LITURGICAL_STATIONS.find(s => s.id === 'navidad')!;
    return LITURGICAL_STATIONS.find(s => s.id === 'ordinario-1')!;
  }
  if (month === 1 || month === 2) {
    // Feb / Marzo -> Cuaresma
    return LITURGICAL_STATIONS.find(s => s.id === 'cuaresma')!;
  }
  if (month === 3 || month === 4) {
    // Abril / Mayo -> Pascua / Pentecostés
    return LITURGICAL_STATIONS.find(s => s.id === 'pascua')!;
  }
  if (month === 5) {
    // Junio -> Trinidad / Corpus Christi
    return LITURGICAL_STATIONS.find(s => s.id === 'corpus-christi')!;
  }
  if (month === 10 && day >= 20) {
    // Fin de Noviembre -> Cristo Rey
    return LITURGICAL_STATIONS.find(s => s.id === 'cristo-rey')!;
  }

  // Resto -> Tiempo Ordinario II
  return LITURGICAL_STATIONS.find(s => s.id === 'ordinario-2')!;
}
