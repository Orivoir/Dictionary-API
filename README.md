# Dictionary API

- **GET** `/word/:corpus/:word` *(application/json)*

```ts
interface ResponseJson {

  /**
   * @var word - word use from url param should be only letter word
   */
  word: string;

  /**
   * @var corpus - lang use form url param should be a [country code alpha2](https://en.wikipedia.org/wiki/ISO_3166-2)
   */
  corpus: string;

  /**
   * @var definition word definition provide in corpus param lang
   */
  definition?: string;

  /**
   * @var synonyms a list of synonyms words from same corpus
   */
  synonyms?: {
    /**
     * @var word synonym word
     */
    word: string;
    /**
     * @var definition synonym definition
     */
    definition?: string;
    /**
     * @var example phrase example use synonym word provide in corpus param lang
     */
    example?: string;
  }[]

  [key: keyof "singular": "plural"]?: {
    gender: string;
    number: string;
    word: string;
  }

  etymology?: string;

  note?: string;

  phonetics?: {
    oxford_audio?: string;
    text: string;
  }[]
}
```