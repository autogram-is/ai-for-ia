# AI for IA Playground

A hairy, tangled pile of experimental code to demonstrate various approaches to document classification.

Given a giant pile of Reddit posts tagged with flair text, this project demonstrates various ways of categorizing and classifying those posts using various AI tools: Natural Language Processing, Machine Learning, and LLMs. Currently, four approaches are implemented:

1. Train a simple word-based classifier
2. Generate vector embeddings and match posts to "proximate" topics
3. Generate vector embeddings and search for clusters of similar posts
4. Describe the desired categories in an LLM prompt, and ask it to categorize each post

No claim is made that this code is good, just that it's servicable. Our goal is a rough comparison of output quality, the resource demands of each approach, and the approachability of each technique for technically adept users who aren't actual ML/AI specialists.

No, seriously. It's bad code.
