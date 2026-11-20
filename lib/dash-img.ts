import { hero as heroRaw } from "./img-hero";
import { lesson } from "./img-lesson";
import { quote } from "./img-quote";

// В img-hero.ts при переносе в строку base64 попал один лишний символ «g» (позиция 6013),
// из-за чего WebP не декодировался. Убираем его здесь; при следующей замене файла картинки
// эту правку можно удалить.
const hero = heroRaw.slice(0, 6013) + heroRaw.slice(6014);

export const IMG = { hero, lesson, quote };
