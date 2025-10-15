import re
import textstat
from nltk.corpus import wordnet

def simplify_text(text: str, max_sentence_len: int = 25, readability_threshold: float = 60.0) -> str:
    """
    Simplifies text by:
      1. Splitting long sentences.
      2. Replacing complex words with simpler synonyms.
      3. Targeting a Flesch Reading Ease above `readability_threshold`.
    """
    sentences = re.split(r'(?<=[.!?]) +', text)
    simplified_sentences = []

    for sentence in sentences:
        if len(sentence.split()) > max_sentence_len:
            sentence = break_long_sentence(sentence)
        sentence = replace_with_simple_words(sentence)
        simplified_sentences.append(sentence)

    simplified_text = " ".join(simplified_sentences)

    if textstat.flesch_reading_ease(simplified_text) < readability_threshold:
        simplified_text = rephrase_simple(simplified_text)

    return simplified_text


def break_long_sentence(sentence: str) -> str:
    words = sentence.split()
    mid = len(words) // 2
    return " ".join(words[:mid]) + ". " + " ".join(words[mid:])


def replace_with_simple_words(sentence: str) -> str:
    def simple_synonym(word):
        syns = wordnet.synsets(word)
        if syns:
            lemmas = [l.name().replace('_', ' ') for l in syns[0].lemmas()]
            return lemmas[0] if lemmas else word
        return word

    return " ".join(simple_synonym(w) for w in sentence.split())


def rephrase_simple(text: str) -> str:
    text = text.replace("utilize", "use").replace("commence", "start").replace("endeavor", "try")
    return text
