---
title: Advanced coding (AI auto-code)
---

> Check out these links from the Garden: [AI auto-code](https://garden.causalmap.app/simple-ai-auto-code/) | [AI coding overview](https://garden.causalmap.app/ai-coding-overview/)

After Auto-code, what does the 'Revise codebook' step do?
y It reviews extracted factor labels and suggests a cleaner, more consistent codebook
It deletes all the links and resets the pipeline so you can start fresh with a different set of sources
It exports the current map to Excel format
It translates the factor labels into another language

The Recode step offers four kinds of recoding, in increasing order of cost and quality. Which four?
y Magnetic, using embedding (semantic) similarity, with no AI call
y AI factors, where the model relabels each unique factor label to its best codebook line
y AI links, where the model relabels each link from its cause, effect and quote
y Hard, re-coding the source text from scratch against the codebook
Manual mapping only, one label at a time using a drag-and-drop interface that lets you merge and rename each factor individually
Random assignment
hint There are four: Magnetic, AI factors, AI links and Hard, cheapest to most thorough.

What does the 'holistic first pass' ask the AI model to produce before it converts the result into ordinary links?
y A connected network diagram (Mermaid) of the causal claims
A spreadsheet of sources with one row per quote and columns for cause, effect and sentiment
A PDF report
hint Asking for a connected diagram first encourages joined-up causal reasoning.

With 'Filter on finish' enabled, what does the pipeline apply when it ends?
y Top factors by citation count, then top links by citation count
Nothing, the run just stops
It deletes the codebook and clears the recode area
It emails you the results and marks the project complete

Roughly how much text can you auto-code for about one credit?
y Around 30 pages
Around 3 pages
Around 300 pages
hint Costs vary by model, but very roughly about 30 pages per credit.

Why does Recode ask the AI to return the number of the best-matching codebook item rather than the label text?
y Fewer tokens are used and the result is more reliable
Numbers display more neatly on the map labels
The app cannot parse text returned from the AI
hint Returning index numbers reduces tokens and improves reliability.
