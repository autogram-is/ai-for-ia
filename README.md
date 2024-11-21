# AI for IA Playground

A hairy, tangled pile of experimental code to demonstrate various approaches to document classification.

Given a giant pile of Reddit posts tagged with flair text, this project demonstrates various ways of categorizing and classifying those posts using various AI tools: Natural Language Processing, Machine Learning, and LLMs. Currently, four approaches are implemented:

1. Train a simple word-based classifier
2. Generate vector embeddings and match posts to "proximate" topics
3. Generate vector embeddings and search for clusters of similar posts
4. Describe the desired categories in an LLM prompt, and ask it to categorize each post

No claim is made that this code is good, just that it's servicable. Our goal is a rough comparison of output quality, the resource demands of each approach, and the approachability of each technique for technically adept users who aren't actual ML/AI specialists.

No, seriously. It's bad code.

## Setup

The project looks for several local environment variables when accessing AI API providers. `env.ANTHROPIC_API_KEY`, `env.GOOGLE_API_KEY`, and `env.OPENAI_API_KEY` will all be respected. If they aren't set, AI models from those providers won't be usable in the tests.

If you're using [Ollama](https://ollama.com) on a separate machine, changing `env.OLLAMA_HOST` will get things wired up.

Finally, data is stored in a Postgres database. `env.POSTGRES_URL` can be set to control the server used; if you want to spin something up with Docker, a `docker-compose.yaml` file has been included. If no server is set, this project will fall back to [PGLite](https://pglite.dev), a sqlite-like implementation of Postgres that stores its data on the local filesystem. It's slower but will get you there.

## Included Scripts

- `db:setup`

### Natural Language Processing

- `nlp:wordcloud` takes all the posts in a given category and splats them into a single text file; these are used to populate [an ObservableHQ wordcloud](https://observablehq.com/d/80ede3c81f0c2854).

### Vector embeddings

- `vector:embed`
- `vector:locate`
- `vector:docsearch`
- `vector:cluster`
- `vector:project`
