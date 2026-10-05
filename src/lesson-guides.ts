export type LessonGuide = { goal: string; sections: { title: string; text: string }[]; dialogue: [string, string, string][]; task: string; example: string; translation: string };
export const guides: Record<string, LessonGuide> = {
  "letters": {
    "goal": "Reconocer tus primeras letras rusas y leer palabras cortas.",
    "sections": [
      {
        "title": "Un alfabeto nuevo",
        "text": "El ruso usa el alfabeto cirílico. Tiene 33 letras, pero hoy aprendemos solo algunas: А = a, М = m, Т = t, К = k, У = u. La О con acento suena como «o». Lee despacio: ма-ма → мама."
      },
      {
        "title": "Letras que pueden confundirte",
        "text": "Н tiene forma de H, pero suena como «n». Р tiene forma de P, pero suena como una «r» vibrante. Prueba: н-о-т-а → нота; р-о-т → рот. No necesitas memorizar el alfabeto entero para empezar."
      },
      {
        "title": "La sílaba fuerte",
        "text": "La rayita de ма́ма indica el acento: MA-ma. Normalmente esa rayita no se escribe en los mensajes. En una palabra de una sola sílaba, como кот, no hace falta. Algunas vocales sin acento cambian de sonido; las pistas escritas son aproximadas."
      }
    ],
    "dialogue": [
      [
        "Familia",
        "Ма́ма тут?",
        "¿Mamá está aquí?"
      ],
      [
        "Mía",
        "Ма́ма там.",
        "Mamá está allí."
      ],
      [
        "Familia",
        "Кот тут?",
        "¿El gato está aquí?"
      ],
      [
        "Mía",
        "Кот тут!",
        "¡El gato está aquí!"
      ]
    ],
    "task": "Lee мама y кот en voz alta. Después escribe «aquí» y «allí» con el teclado ruso.",
    "example": "тут · там",
    "translation": "aquí · allí"
  },
  "hello": {
    "goal": "Saludar, despedirte y dar las gracias a tu familia en ruso.",
    "sections": [
      {
        "title": "¡Hola y chao!",
        "text": "Привет significa «hola». Es informal: úsalo con amigos y familia. Пока significa «chao» o «hasta luego» entre personas cercanas. El signo de exclamación expresa entusiasmo, igual que en español."
      },
      {
        "title": "Sí y no",
        "text": "Да significa «sí» y Нет significa «no». La н de Нет es suave antes de е: las pistas de lectura ayudan a empezar, pero no representan todos los sonidos con exactitud."
      },
      {
        "title": "Palabras amables",
        "text": "Спасибо significa «gracias». Пожалуйста puede ser «por favor» o «de nada». Si alguien te dice Спасибо, responde Пожалуйста. Para saludar a una persona adulta que no conoces se usa Здравствуйте; puedes aprender esa palabra más adelante."
      }
    ],
    "dialogue": [
      [
        "Familia",
        "Приве́т, Ми́я!",
        "¡Hola, Mía!"
      ],
      [
        "Mía",
        "Приве́т! Спаси́бо!",
        "¡Hola! ¡Gracias!"
      ],
      [
        "Familia",
        "Пожа́луйста.",
        "De nada."
      ],
      [
        "Mía",
        "Пока́!",
        "¡Chao!"
      ]
    ],
    "task": "Prepara un mensaje de tres palabras: saluda, da las gracias y despídete.",
    "example": "Приве́т! Спаси́бо! Пока́!",
    "translation": "¡Hola! ¡Gracias! ¡Chao!"
  },
  "me": {
    "goal": "Decir cómo te llamas, cuántos años tienes y de dónde eres.",
    "sections": [
      {
        "title": "Tu nombre",
        "text": "Меня зовут… significa «Me llamo…». Añade tu nombre: Меня зовут Мия. Para preguntar a otra persona, di Как тебя зовут? Practica la frase completa; la gramática puede esperar."
      },
      {
        "title": "Tu edad",
        "text": "«Tengo doce años» se dice Мне двенадцать лет. La estructura es diferente del español. Aprende esta expresión como una pieza completa, sin traducir cada palabra por separado."
      },
      {
        "title": "Tu país",
        "text": "Я significa «yo». Я из Коста-Рики significa «Soy de Costa Rica»: no hace falta añadir una palabra para «soy». Я учу русский significa «Estoy aprendiendo ruso». Очень приятно significa «Mucho gusto»."
      }
    ],
    "dialogue": [
      [
        "Familia",
        "Как тебя́ зову́т?",
        "¿Cómo te llamas?"
      ],
      [
        "Mía",
        "Меня́ зову́т Ми́я.",
        "Me llamo Mía."
      ],
      [
        "Mía",
        "Мне двена́дцать лет. Я из Ко́ста-Ри́ки.",
        "Tengo doce años. Soy de Costa Rica."
      ],
      [
        "Familia",
        "О́чень прия́тно!",
        "¡Mucho gusto!"
      ]
    ],
    "task": "Preséntate con dos frases: tu nombre y que estás aprendiendo ruso.",
    "example": "Меня́ зову́т Ми́я. Я учу́ ру́сский.",
    "translation": "Me llamo Mía. Estoy aprendiendo ruso."
  },
  "family": {
    "goal": "Reconocer seis palabras de familia y presentar a alguien cercano.",
    "sections": [
      {
        "title": "Tu familia",
        "text": "Мама y папа se parecen a «mamá» y «papá», pero en ruso la sílaba fuerte es la primera: ма́ма, па́па. Брат es «hermano», сестра es «hermana», бабушка es «abuela» y дедушка es «abuelo»."
      },
      {
        "title": "Presentar a una persona",
        "text": "Это significa «esto es» o «esta persona es». Puedes decir Это моя мама: «Esta es mi mamá». No necesitas una palabra separada para «es». Para tu papá: Это мой папа."
      },
      {
        "title": "Мой y моя",
        "text": "Usa мой con брат, папа y дедушка; моя con мама, сестра y бабушка. Aunque папа y дедушка terminan en а, se refieren a un hombre y llevan мой. Aprende estas combinaciones con ejemplos."
      }
    ],
    "dialogue": [
      [
        "Mía",
        "Э́то моя́ ма́ма.",
        "Esta es mi mamá."
      ],
      [
        "Mía",
        "Э́то мой па́па.",
        "Este es mi papá."
      ],
      [
        "Familia",
        "А э́то кто?",
        "¿Y quién es esta persona?"
      ],
      [
        "Mía",
        "Э́то моя́ ба́бушка.",
        "Esta es mi abuela."
      ]
    ],
    "task": "Piensa en una foto familiar y presenta a dos personas. No hace falta subir la foto.",
    "example": "Э́то моя́ ма́ма. Э́то мой брат.",
    "translation": "Esta es mi mamá. Este es mi hermano."
  },
  "numbers": {
    "goal": "Contar del uno al diez y reconocer los números en ruso.",
    "sections": [
      {
        "title": "Del uno al cinco",
        "text": "Empieza con один, два, три, четыре, пять. Lee cada palabra, mira su significado y repítela. Cuenta cinco objetos a tu alrededor. No hace falta leer rápido."
      },
      {
        "title": "Del seis al diez",
        "text": "Continúa con шесть, семь, восемь, девять, десять. La letra ь es el signo suave: no es una vocal ni se pronuncia como una sílaba nueva. Indica que la consonante anterior es suave."
      },
      {
        "title": "Un pequeño reto",
        "text": "Cuenta del uno al diez mirando las tarjetas; después intenta hacerlo sin mirar. También puedes contar de tres a uno. Si olvidas una palabra, consulta la tarjeta y sigue: equivocarse es parte de aprender."
      }
    ],
    "dialogue": [
      [
        "Familia",
        "Оди́н, два, три…",
        "Uno, dos, tres…"
      ],
      [
        "Mía",
        "Четы́ре, пять!",
        "¡Cuatro, cinco!"
      ],
      [
        "Familia",
        "Шесть, семь, во́семь…",
        "Seis, siete, ocho…"
      ],
      [
        "Mía",
        "Де́вять, де́сять!",
        "¡Nueve, diez!"
      ]
    ],
    "task": "Cuenta diez pasos u objetos. Después escribe en ruso los números 1, 5 y 10.",
    "example": "оди́н · пять · де́сять",
    "translation": "uno · cinco · diez"
  },
  "favorites": {
    "goal": "Contar qué te gusta y preparar un mensaje sencillo en ruso.",
    "sections": [
      {
        "title": "Palabras de tu mundo",
        "text": "Музыка es «música», книга es «libro», море es «mar» y шоколад es «chocolate». Empieza con la palabra que más te interesa: aprender algo de tu propio mundo ayuda a recordarlo."
      },
      {
        "title": "Me gusta…",
        "text": "Мне нравится… significa «Me gusta…». Prueba: Мне нравится музыка; Мне нравится море; Мне нравится шоколад. Hoy hablamos de una sola cosa; las formas plurales se aprenderán más adelante."
      },
      {
        "title": "Una actividad que te encanta",
        "text": "Я люблю читать significa «Me encanta leer». Читать es «leer», una acción. Puedes unirlo a tu presentación: Привет! Меня зовут Мия. Я люблю читать. Ya estás contando algo real sobre ti."
      }
    ],
    "dialogue": [
      [
        "Familia",
        "Что тебе́ нра́вится?",
        "¿Qué te gusta?"
      ],
      [
        "Mía",
        "Мне нра́вится му́зыка.",
        "Me gusta la música."
      ],
      [
        "Familia",
        "А мо́ре?",
        "¿Y el mar?"
      ],
      [
        "Mía",
        "Да! Мне нра́вится мо́ре.",
        "¡Sí! Me gusta el mar!"
      ]
    ],
    "task": "Prepara un mensaje con un saludo, tu nombre y algo que te gusta. Puedes escribirlo en una nota y compartirlo con tu familia.",
    "example": "Приве́т! Меня́ зову́т Ми́я. Мне нра́вится му́зыка.",
    "translation": "¡Hola! Me llamo Mía. Me gusta la música."
  }
};
