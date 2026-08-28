/**
 * calendarUtils.ts — Utilidades para el Calendario Litúrgico Mensual y Eventos Parroquiales.
 */

export interface ParishEvent {
  id: string;
  day: number;
  month: number; // 0 = Ene, 11 = Dic
  year: number;
  title: string;
  type: 'solemnidad' | 'fiesta' | 'memoria' | 'parroquia' | 'sacramento';
  liturgicalColor: 'verde' | 'morado' | 'blanco' | 'rojo' | 'rosa';
  colorHex: string;
  description: string;
  time?: string;
}

export interface DayLiturgicalInfo {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  seasonId: 'ordinario' | 'cuaresma' | 'pentecostes' | 'pascua';
  seasonName: string;
  colorHex: string;
  colorName: string;
  events: ParishEvent[];
}

// ── Lista de Eventos y Solemnidades del Año Parroquial 2026 ─────────────────

export const PARISH_EVENTS_2026: ParishEvent[] = [
  // Enero
  { id: 'e1', day: 1, month: 0, year: 2026, title: 'Santa María, Madre de Dios', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Solemnidad de la Maternidad Divina y Jornada de la Paz', time: '10:00 AM' },
  { id: 'e2', day: 6, month: 0, year: 2026, title: 'Epifanía del Señor', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Manifestación de Jesús a los Reyes Magos', time: '10:00 AM' },
  { id: 'e3', day: 11, month: 0, year: 2026, title: 'Bautismo del Señor', type: 'fiesta', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Fin del Tiempo de Navidad e inicio del Tiempo Ordinario' },

  // Febrero
  { id: 'e4', day: 2, month: 1, year: 2026, title: 'Presentación del Señor (Candelaria)', type: 'fiesta', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Bendición de velas y cirios' },
  { id: 'e5', day: 18, month: 1, year: 2026, title: 'Miércoles de Ceniza', type: 'solemnidad', liturgicalColor: 'morado', colorHex: '#4A2040', description: 'Inicio de la Cuaresma · Imposición de cenizas y ayuno', time: '07:00 AM / 07:00 PM' },

  // Marzo
  { id: 'e6', day: 19, month: 2, year: 2026, title: 'San José, Esposo de la Virgen', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Patrono universal de la Iglesia y de los trabajadores' },
  { id: 'e7', day: 25, month: 2, year: 2026, title: 'La Anunciación del Señor', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Encarnación del Hijo de Dios en el seno de María' },
  { id: 'e8', day: 29, month: 2, year: 2026, title: 'Domingo de Ramos', type: 'solemnidad', liturgicalColor: 'rojo', colorHex: '#721C24', description: 'Inicio de la Semana Santa · Bendición de palmas y procesión', time: '08:00 AM' },

  // Abril
  { id: 'e9', day: 2, month: 3, year: 2026, title: 'Jueves Santo · Cena del Señor', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Institución de la Eucaristía, Sacerdocio y Lavatorio de pies', time: '07:00 PM' },
  { id: 'e10', day: 3, month: 3, year: 2026, title: 'Viernes Santo · Pasión del Señor', type: 'solemnidad', liturgicalColor: 'rojo', colorHex: '#721C24', description: 'Vía Crucis, Pasión de Cristo y Adoración de la Cruz', time: '03:00 PM' },
  { id: 'e11', day: 4, month: 3, year: 2026, title: 'Sábado Santo · Solemne Vigilia Pascual', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#D4AF37', description: 'Bendición del Fuego Nuevo, Cirio Pascual y Resurrección', time: '09:00 PM' },
  { id: 'e12', day: 5, month: 3, year: 2026, title: '¡Domingo de Pascua de Resurrección!', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#D4AF37', description: '¡Cristo ha resucitado verdaderamente! Misa solemne de Pascua', time: '10:00 AM' },

  // Mayo
  { id: 'e13', day: 1, month: 4, year: 2026, title: 'San José Obrero · FIESTA PATRONAL', type: 'parroquia', liturgicalColor: 'blanco', colorHex: '#C5A059', description: 'Fiesta Patronal de nuestra Parroquia Jesús Obrero', time: '10:30 AM' },
  { id: 'e14', day: 24, month: 4, year: 2026, title: 'Solemnidad de Pentecostés', type: 'solemnidad', liturgicalColor: 'rojo', colorHex: '#721C24', description: 'Venida del Espíritu Santo y vigilia juvenil parroquial', time: '07:00 PM' },
  { id: 'e15', day: 31, month: 4, year: 2026, title: 'La Santísima Trinidad', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Misterio de Dios Padre, Hijo y Espíritu Santo' },

  // Junio
  { id: 'e16', day: 7, month: 5, year: 2026, title: 'Solemnidad de Corpus Christi', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#C5A059', description: 'Procesión solemne con el Santísimo Sacramento por las calles', time: '09:00 AM' },
  { id: 'e17', day: 12, month: 5, year: 2026, title: 'Sagrado Corazón de Jesús', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Consagración de las familias al Corazón de Cristo' },
  { id: 'e18', day: 29, month: 5, year: 2026, title: 'San Pedro y San Pablo, Apóstoles', type: 'solemnidad', liturgicalColor: 'rojo', colorHex: '#721C24', description: 'Columnas de la Iglesia y Día del Papa' },

  // Julio
  { id: 'e19', day: 16, month: 6, year: 2026, title: 'Virgen del Carmen', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Reina y Patrona de Bolivia' },
  { id: 'e20', day: 25, month: 6, year: 2026, title: 'Santiago Apóstol', type: 'fiesta', liturgicalColor: 'rojo', colorHex: '#721C24', description: 'Patrono de España y de la Diócesis' },

  // Agosto
  { id: 'e21', day: 6, month: 7, year: 2026, title: 'Transfiguración del Señor', type: 'fiesta', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Manifestación de la gloria divina en el monte Tabor' },
  { id: 'e22', day: 15, month: 7, year: 2026, title: 'Asunción de la Virgen María', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Glorificación de María en cuerpo y alma al cielo' },
  { id: 'e23', day: 27, month: 7, year: 2026, title: 'Santa Mónica', type: 'memoria', liturgicalColor: 'blanco', colorHex: '#1E4D38', description: 'Ejemplo de oración de las madres por sus hijos' },

  // Septiembre
  { id: 'e24', day: 8, month: 8, year: 2026, title: 'Natividad de la Virgen María', type: 'fiesta', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Nacimiento de la Madre del Salvador' },
  { id: 'e25', day: 14, month: 8, year: 2026, title: 'Exaltación de la Santa Cruz', type: 'fiesta', liturgicalColor: 'rojo', colorHex: '#721C24', description: 'Veneración del árbol sagrado de la salvación' },
  { id: 'e26', day: 29, month: 8, year: 2026, title: 'Santos Arcángeles: Miguel, Gabriel y Rafael', type: 'fiesta', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Custodios celestiales y mensajeros de Dios' },

  // Octubre
  { id: 'e27', day: 4, month: 9, year: 2026, title: 'San Francisco de Asís', type: 'memoria', liturgicalColor: 'blanco', colorHex: '#1E4D38', description: 'Amor a la creación y a los pobres' },
  { id: 'e28', day: 18, month: 9, year: 2026, title: 'Señor de los Milagros', type: 'parroquia', liturgicalColor: 'morado', colorHex: '#4A2040', description: 'Misa y procesión devocional', time: '04:00 PM' },
  { id: 'e29', day: 25, month: 9, year: 2026, title: 'Misas de Primeras Comuniones', type: 'sacramento', liturgicalColor: 'blanco', colorHex: '#C5A059', description: 'Celebración sacramental de los niños de catequesis', time: '09:00 AM / 11:00 AM' },

  // Noviembre
  { id: 'e30', day: 1, month: 10, year: 2026, title: 'Todos los Santos', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Comunión de todos los bienaventurados en el cielo' },
  { id: 'e31', day: 2, month: 10, year: 2026, title: 'Conmemoración de los Fieles Difuntos', type: 'solemnidad', liturgicalColor: 'morado', colorHex: '#4A2040', description: 'Oración por el descanso eterno de nuestros hermanos' },
  { id: 'e32', day: 22, month: 10, year: 2026, title: 'JESUCRISTO, REY DEL UNIVERSO', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#C5A059', description: 'Clausura solemne del Año Litúrgico', time: '10:00 AM' },
  { id: 'e33', day: 29, month: 10, year: 2026, title: 'I Domingo de Adviento', type: 'solemnidad', liturgicalColor: 'morado', colorHex: '#4A2040', description: 'Inicio del Nuevo Año Litúrgico 2026-2027 y encendido de la 1ª vela' },

  // Diciembre
  { id: 'e34', day: 8, month: 11, year: 2026, title: 'Inmaculada Concepción de la Virgen María', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#916B1E', description: 'Preservada pura de todo pecado' },
  { id: 'e35', day: 24, month: 11, year: 2026, title: 'Nochebuena · Misa de Gallo', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#D4AF37', description: 'Vigilia del Nacimiento de Jesús', time: '09:00 PM' },
  { id: 'e36', day: 25, month: 11, year: 2026, title: '¡LA NATIVIDAD DE NUESTRO SEÑOR JESUCRISTO!', type: 'solemnidad', liturgicalColor: 'blanco', colorHex: '#D4AF37', description: 'Navidad · El Verbo se hizo carne y habitó entre nosotros', time: '10:00 AM' }
];

/**
 * Obtiene el color litúrgico dominante de un día según el mes y día del año 2026.
 */
export function getDayLiturgicalColor(year: number, month: number, day: number): {
  seasonId: 'ordinario' | 'cuaresma' | 'pentecostes' | 'pascua';
  seasonName: string;
  colorHex: string;
  colorName: string;
} {
  // Verificar si hay una fiesta/solemnidad específica con color propio
  const event = PARISH_EVENTS_2026.find(e => e.month === month && e.day === day && e.year === year);
  if (event) {
    if (event.liturgicalColor === 'rojo') {
      return { seasonId: 'pentecostes', seasonName: event.title, colorHex: '#721C24', colorName: 'Rojo Pasión / Espíritu' };
    }
    if (event.liturgicalColor === 'morado') {
      return { seasonId: 'cuaresma', seasonName: event.title, colorHex: '#4A2040', colorName: 'Morado Penitencial' };
    }
    if (event.liturgicalColor === 'blanco') {
      return { seasonId: 'pascua', seasonName: event.title, colorHex: '#916B1E', colorName: 'Blanco y Oro Solemne' };
    }
  }

  // Estaciones por defecto según el calendario litúrgico 2026
  // Ene 1 - Ene 11: Navidad
  if (month === 0 && day <= 11) {
    return { seasonId: 'pascua', seasonName: 'Tiempo de Navidad', colorHex: '#916B1E', colorName: 'Blanco / Oro' };
  }
  // Ene 12 - Feb 17: Tiempo Ordinario I
  if ((month === 0 && day >= 12) || (month === 1 && day < 18)) {
    return { seasonId: 'ordinario', seasonName: 'Tiempo Ordinario', colorHex: '#1E4D38', colorName: 'Verde Sacro' };
  }
  // Feb 18 - Mar 28: Cuaresma
  if ((month === 1 && day >= 18) || (month === 2 && day <= 28)) {
    return { seasonId: 'cuaresma', seasonName: 'Tiempo de Cuaresma', colorHex: '#4A2040', colorName: 'Morado Penitencial' };
  }
  // Mar 29 - Abr 4: Semana Santa
  if ((month === 2 && day >= 29) || (month === 3 && day <= 4)) {
    return { seasonId: 'pentecostes', seasonName: 'Semana Santa', colorHex: '#721C24', colorName: 'Rojo Pasión' };
  }
  // Abr 5 - May 24: Tiempo Pascual
  if ((month === 3 && day >= 5) || (month === 4 && day <= 24)) {
    return { seasonId: 'pascua', seasonName: 'Tiempo Pascual', colorHex: '#916B1E', colorName: 'Blanco y Oro de Pascua' };
  }
  // May 25 - Nov 28: Tiempo Ordinario II
  if ((month === 4 && day >= 25) || (month >= 5 && month <= 9) || (month === 10 && day <= 28)) {
    return { seasonId: 'ordinario', seasonName: 'Tiempo Ordinario', colorHex: '#1E4D38', colorName: 'Verde Sacro' };
  }
  // Nov 29 - Dic 24: Adviento
  if ((month === 10 && day >= 29) || (month === 11 && day <= 24)) {
    return { seasonId: 'cuaresma', seasonName: 'Tiempo de Adviento', colorHex: '#4A2040', colorName: 'Morado de Adviento' };
  }
  // Dic 25 - Dic 31: Navidad
  return { seasonId: 'pascua', seasonName: 'Tiempo de Navidad', colorHex: '#916B1E', colorName: 'Blanco / Oro' };
}

/**
 * Genera la cuadrícula de días para un mes dado.
 */
export function generateMonthDays(year: number, month: number): DayLiturgicalInfo[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 6 = Sábado
  const totalDays = lastDayOfMonth.getDate();

  const days: DayLiturgicalInfo[] = [];
  const today = new Date();

  // Días de relleno del mes anterior
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayNum);
    const lit = getDayLiturgicalColor(date.getFullYear(), date.getMonth(), date.getDate());
    const events = PARISH_EVENTS_2026.filter(e => e.year === date.getFullYear() && e.month === date.getMonth() && e.day === dayNum);

    days.push({
      date,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: false,
      ...lit,
      events
    });
  }

  // Días del mes actual
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const lit = getDayLiturgicalColor(year, month, day);
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const events = PARISH_EVENTS_2026.filter(e => e.year === year && e.month === month && e.day === day);

    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday,
      ...lit,
      events
    });
  }

  // Días de relleno del mes siguiente para completar cuadrícula de múltiplos de 7 (hasta 35 o 42)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);
    const lit = getDayLiturgicalColor(date.getFullYear(), date.getMonth(), date.getDate());
    const events = PARISH_EVENTS_2026.filter(e => e.year === date.getFullYear() && e.month === date.getMonth() && e.day === day);

    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: false,
      ...lit,
      events
    });
  }

  return days;
}

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
