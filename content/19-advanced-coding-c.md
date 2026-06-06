---
title: Advanced coding (AI auto-code)
---

> Check out these links from the Garden: [AI auto-code](https://garden.causalmap.app/simple-ai-auto-code/) | [AI coding overview](https://garden.causalmap.app/ai-coding-overview/)

After Auto-code, what does the 'Revise codebook' step do?
y It reviews the extracted factor labels and suggests a cleaner, more consistent set of labels (a codebook)
It deletes all the links
It exports the map to Excel
It translates the labels into another language

The Recode step can map raw labels onto the codebook in two ways. Which two?
y AI mapping, where the model matches each label to a codebook item
y Magnetic mapping, using embedding (semantic) similarity
Manual mapping only, one label at a time
Random assignment

What does the 'holistic first pass' ask the AI model to produce before it converts the result into ordinary links?
y A connected network diagram (Mermaid) of the causal claims
A spreadsheet of sources
A PDF report
hint Asking for a connected diagram first encourages joined-up causal reasoning.

With 'Filter on finish' enabled, what does the pipeline apply when it ends?
y Analysis filters such as top factors by citation followed by top links by citation
Nothing, the run just stops
It deletes the codebook
It emails you the results

Roughly how much text can you auto-code for about one credit?
y Around 30 pages
Around 3 pages
Around 300 pages
hint Costs vary by model, but very roughly about 30 pages per credit.

Why does Recode ask the AI to return the number of the best-matching codebook item rather than the label text?
y It uses fewer tokens and is more reliable
Numbers look neater on the map
The app cannot read words
hint Returning index numbers reduces tokens and improves reliability.
