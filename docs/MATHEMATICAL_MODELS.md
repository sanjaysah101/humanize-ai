# Mathematical Models Documentation

## 1. Markov Chain Implementation

### Overview

The system uses first-order Markov chains for natural language generation:

- State space: Individual words in the text
- Transition probabilities: Based on word co-occurrence
- Matrix representation: P(w_j|w_i) for words w_i, w_j

### Mathematical Foundation

P(w*n|w*{n-1}) = Count(w*{n-1}, w_n) / Count(w*{n-1})

## 2. Similarity Metrics

### Weighted Levenshtein Distance

Formula:
d(i,j) = min(
d(i-1,j) + w_del,
d(i,j-1) + w_ins,
d(i-1,j-1) + w_sub \* (s_i ≠ t_j)
)

### Semantic Similarity

Using Jaccard similarity coefficient:
J(A,B) = |A ∩ B| / |A ∪ B|
