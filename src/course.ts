export type Word = { ru: string; es: string; hint: string };
export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  note: string;
  words: Word[];
};
const w = (ru: string, es: string, hint: string): Word => ({ ru, es, hint });
export const lessons: Lesson[] = [
  {
    id: "letters",
    title: "Las primeras letras",
    subtitle: "Tu primer encuentro con el cirílico",
    icon: "А",
    note: "А, М, Т, О y К se parecen a letras latinas. Н suena como «n» y Р como una «r» vibrante. El acento indica la sílaba fuerte. Las pistas de lectura son aproximadas.",
    words: [
      w("ма́ма", "mamá", "má-ma"),
      w("кот", "gato", "kot"),
      w("там", "allí", "tam"),
      w("тут", "aquí", "tut"),
      w("но́та", "nota musical", "nó-ta"),
      w("рот", "boca", "rot"),
    ],
  },
  {
    id: "hello",
    title: "¡Hola, ruso!",
    subtitle: "Pequeñas palabras para empezar",
    icon: "☀",
    note: "Привет es un saludo informal para amigos y familia. Para una persona adulta que no conoces, usa Здравствуйте. En ruso, las vocales sin acento pueden cambiar de sonido.",
    words: [
      w("Приве́т!", "¡Hola!", "pri-viét"),
      w("Пока́!", "¡Chao!", "pa-ká"),
      w("Да", "Sí", "da"),
      w("Нет", "No", "niet"),
      w("Спаси́бо", "Gracias", "spa-sí-ba"),
      w("Пожа́луйста", "Por favor / de nada", "pa-zhá-lus-ta"),
    ],
  },
  {
    id: "me",
    title: "Esta soy yo",
    subtitle: "Tu nombre, tu edad, tu mundo",
    icon: "✦",
    note: "Меня зовут… significa «Me llamo…». Para decir tu edad: Мне двенадцать лет. No necesitas aprender toda la gramática hoy: empieza con estas pequeñas frases.",
    words: [
      w("Меня́ зову́т Ми́я.", "Me llamo Mía.", "mi-niá za-vút Mí-ya"),
      w("Мне двена́дцать лет.", "Tengo doce años.", "mnie dvi-ná-tsat liet"),
      w("Я из Ко́ста-Ри́ки.", "Soy de Costa Rica.", "ya iz Kós-ta Rí-ki"),
      w("Как тебя́ зову́т?", "¿Cómo te llamas?", "kak ti-biá za-vút"),
      w("О́чень прия́тно!", "¡Mucho gusto!", "ó-chin pri-yát-na"),
      w("Я учу́ ру́сский.", "Estoy aprendiendo ruso.", "ya u-chú rús-ki"),
    ],
  },
  {
    id: "family",
    title: "Mi familia",
    subtitle: "Palabras que nos acercan",
    icon: "♡",
    note: "Это significa «esto es» o «esta persona es». Puedes decir Это моя мама: «Esta es mi mamá». Мой acompaña palabras masculinas; моя, femeninas.",
    words: [
      w("ма́ма", "mamá", "má-ma"),
      w("па́па", "papá", "pá-pa"),
      w("сестра́", "hermana", "sis-trá"),
      w("брат", "hermano", "brat"),
      w("ба́бушка", "abuela", "bá-bush-ka"),
      w("де́душка", "abuelo", "dié-dush-ka"),
    ],
  },
  {
    id: "numbers",
    title: "Uno, dos, tres…",
    subtitle: "Vamos a contar hasta diez",
    icon: "123",
    note: "Cuenta despacio. Practica del uno al cinco y después del seis al diez. La letra ы no tiene un equivalente exacto en español: las pistas solo ayudan a empezar.",
    words: [
      w("оди́н", "uno", "a-dín"),
      w("два", "dos", "dva"),
      w("три", "tres", "tri"),
      w("четы́ре", "cuatro", "chi-tý-ri"),
      w("пять", "cinco", "piat"),
      w("шесть", "seis", "shest"),
      w("семь", "siete", "siem"),
      w("во́семь", "ocho", "vó-sim"),
      w("де́вять", "nueve", "dié-viat"),
      w("де́сять", "diez", "dié-siat"),
    ],
  },
  {
    id: "favorites",
    title: "Lo que me gusta",
    subtitle: "Cuenta un poquito más de ti",
    icon: "♫",
    note: "Мне нравится… significa «Me gusta…». Prueba: Мне нравится музыка. En una conversación real, estas frases son un buen punto de partida.",
    words: [
      w("му́зыка", "música", "mú-zy-ka"),
      w("кни́га", "libro", "kní-ga"),
      w("мо́ре", "mar", "mó-ri"),
      w("шокола́д", "chocolate", "sha-ka-lát"),
      w(
        "Мне нра́вится му́зыка.",
        "Me gusta la música.",
        "mnie nrá-vit-sa mú-zy-ka",
      ),
      w("Я люблю́ чита́ть.", "Me encanta leer.", "ya liu-bliú chi-tát"),
    ],
  },
];
export const cards = lessons.flatMap((l) =>
  l.words.map((word, i) => ({ id: `${l.id}-${i}`, lesson: l.id, ...word })),
);
