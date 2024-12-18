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

These scripts are how we ran our tests over and over as we iterated on our process and gathered our data. It's still dirty, but we'll be doing a bit of cleanup shortly.

- `db:setup`: Sets up a fresh Postgres database, imports the example Reddit posts, tags, and list of models used in testing.
- `test:ollama`: Checks to see whether Ollama is installed and the necessary AI models have been downloaded.

### Vector embeddings

- `vector:embed`: Generates vector embeddings for every post and label using multiple models
- `vector:locate`: Uses vector embeddings and simple distance calculations to find the "closest" label for each post
- `vector:docsearch`: Specialized version of `vector:locate` for the MixedBread and Nomic-Embed models
- `vector:cluster`: Uses kmeans or dbscan clustering to suggest new post categories
- `vector:project`: Generates 2D projections of high-dimensionality embeddings for visualization

### Prompted LLMs

- `prompt:categorize`: Uses a standardized system prompt to classify individual posts
- `prompt:describe-clusters`: Uses an LLM to generate descriptions of the clusters created by `vector:cluster`

### Dataviz/reporting

- `nlp:wordcloud` Generates data for the [ObservableHQ wordcloud visualization](https://observablehq.com/d/80ede3c81f0c2854)
- `report:cluster`: Generates JSON data files for the [Vega-Lite embedding visualization](https://vega.github.io/editor/#/url/vega-lite/N4IgJAzgxgFgpgWwIYgFwhgF0wBwqgegIDc4BzJAOjIEtMYBXAI0poHsDp5kTykBaADZ04JAKyUAVhDYA7EABoQmOoLhpQmOAA9MaEACYAIgAIcAJzaS4UFXJNsAZia26TiJnAAmXmrLIQiiBQbIJs5voA7jAiIAC+Sl5ImCiooAzmgvpYuPhE5kiR1HSMTAwQcOYhslo1lCEIBEgMmGxkBQj8NBBNNPyO4V1IBOZwjj3wSF49yH4EbC04LQSYELJw-FCC5VrmM9pMSH0AjgyVAJ5SMvIJGHA0ZFhoAGwADK9KkTRe9C-vSshzABrDTKc44dToKA0KpqeJKaqOB6gw5QIHtBayLz6ADEAEZngYDABmACCQSQ2m6oPa3wAwqFwlEYlogio0QywhF0NFYkpaV4API4JDQzDnNCvSgGJSCJCeQScpk8lnqJQqTBqJXckC81m3NRkOBY0FyhXa5l85SqOAWlWxW7EGhwSKgiCYSxAyHKAqyCAi0Y1eHKHR6NIgAY1ADKNAAXpC8cSlEjBFl0DiAGJZ+K3ANIBCBVAAbVAsnz3taZDIagAKmwcDQoEEKmpbKDxRD9Dg2H49MnnYJpmgiyB1kUNXCALq3Jh+bHoQ3G7FxSdKY0hXz+UHaUFIuCDrtsCCUV5sm1oWQMVPq8He05IGp0ZI0UgUqmFy+p24S8N7g-obtjzxM9NUhT9BBvTt0HvR8UhUV8lEpalUHA2561FOgf1AapfDseRwzzBB9Eras4DrBsmyUYgkG2SEpQATkdGizklSg8VuEIuXbc90HIxsgj-edRxdSgJzVMEoNHNgED8GjgwgONIVAQT9GgcJxMXE0UKvCCQFnfCPTOW5WlCFQcGHZSByEsS2VvfRwk3OT1R4kAa3PBJLP3ITQi8UTz2c0D9DpDJAz0DyIys-Qxz8wKArhdAowYKs4Hdbx4U8-8QDU0YQPikAoxCHLwpUqFpIQY1Vly70ACU4BwYQUviac4iAA/view)
- `report:movement`: Generates JSON data files for the [Vega-Lite old/new category movement visualizations](https://vega.github.io/editor/#/url/vega/N4IgJAzgxgFgpgWwIYgFwhgF0wBwqgegIDc4BzJAOjIEtMYBXAI0poHsDp5kTykSArJQBWENgDsQAGhAATONABONHJnaT0AYSSZybRQE8ABLCTiycI02MI28gDbSQAdxqz6aABwAGbzPg0ZFhoAGy+MmqY9nBoIACiAB40EGrmRphsRgAKimw4bBBwsiY6eoZGtqQIcOKYThCB4kj2EGgA2qBN1bEpZrJIirIA4kg4TsTNDDGoAIwy8koqahKxIzhGSBAbRjhwilA1mEgWRmwAZkZnDPb2RrJsyDSSAL5SnUjd6EybMTIT9lNYgdansnAsoMpVOpYgAJNjOdKZXpQADWAApgbpFKdsQAvPZsACUIGeAF15joUKgOiAutMQE8cAw6jIGIpHOgsLh8ERFEhnNQ6IwmAxCvsJLpapQoA8CEhmWwyHyEABaZJymgqs76NX8RRwM4QAjwJCyI2PcQENjMpmYAiVRCHAg4XL5QqyZ25BCqFVkH0AFjYKoQTxoIjELzetI+9ORKNaMjEbIOsUZzKcmD54gg2sUCHaoEwBl2sTONHsWKccASLti-UwDAQlCT+0sAEIALxGcTXRyvQvF+m5hDXFAyTaxGqyKs1xSxNoAchbBwXUgXR0UFkwC9JJKjRZL6GHo6cE-QdJntfQbTuOkbzetrak9fvG63u-7IAP9JdbGEcCgFkQDLOB7DNdoQCnJwLz+SYYlJT9v1LewdElJwQLA1pqUg8RpxkC8EP3QdYnsNg2BRBgxhkM4vVTcRbScFE4AMIFSjIfQWNggEFAguN6n0ICKCokAUKYUDWnJYCaFA8DsII8csLaEA+MTASnCEpxRPEkBCIHQ8QGOJU+F0dDpMwiD-kBRMjlRfjFEE0ZNKQMSWh0mQlWtHBrAgqD8JjNyQDyRTlMbJxkASMKkAimRwsiiLJLPJTLN+ZSbJROyHOErTXN0r9iPQQz9QoEzqLM2Skrg+o0oy9THJkbKJPc3JKO8uT-MkoKINimKorivqevihSLMq6ykFs1T7NqrLnO03KkKPfQRxQ08sJADSZGrK85DvJshIAfhfXbRlQbwSVyi90HCgA1EblMfFNsLjRqvyzHNFoLPL9MK4yUow8qQGSgKPJaljHuqjq8F40KEuCwG5vygyyCM4rfrK2HKoh4LYph4buJ0slPwukAcFI7AigAZTShM7uTaYlKegLMzMN68w++bgMWk8hvQCAcDG0ENtnWIjDReskDRBdrrghdCTabxSUoZKCBmXxCQAKjRXpcIGYZRgAakO6hRmJRCEePZbuc+lLNrna8FzF1clz5g5FB3Pc9KHTmLYM1bef52QbrxwWtraQ3kufHbm2dvYPyI-SzhQsnJFKmTgqQxNo4DjHTf0lS1uarzQfp8GJrqVBQD+no1JkfR5FtuQFGBWQnjIPcpJknpM8DqzArOQ04DL0AGjIJoORAb5ChJHPPbzLnIKF9A0VFyPksJAgACZCQNyODFOy2DCgM7Cf8o8nmaAAVZzon42mIJJtgydkSmxvjRnXuHNmzfLStg-rw3vyMB2Ls9tKQLiPlGIm9gngokvkwa+qlb7YTTHUSSTNswf2pB7Us38Bbzy2obZc7Yuw9huO7K2JEyIUWEjRB42DR6wPgSAJioNozdC4lMYKu8nAGBmFVF+NVJJ-WCoQgKiUaatmfqiLhCCJFpR4TfWR-CZEHHJmpeG+lSLkUouhWip96FXxSsw2IMEAZwU4XvEA8jRrjTupNQRaMIJvgHqItOAwtySJRNIr8biB4eKsd4zcvjqoRB8ZgVRdjp49GCfnTyrV6b3XgqXNAFcyqxCcWE6ugVBignQOCKcLc26V3QIDGufdChlxAPiXIK1eIGBoBYiAdTeHqJnktMceC-6R0afU7eDYmyEL8RYs8ykuGRIWrPb2Ns6xdN3r0+8JSfY9HkWM1KSiYkg0caEgKYhJrl3bmBKutNwlAVrjkhu0B8nmEKak4pt1zj9wqVUtgNTsKyDqRYt5NBmkrPNu0qZuTI6fO8HMps6TBkvLkKMuOrS57-O2n0ygbzgVh1usMt5vCflez+QvEAS8UXcTXpvEFzYvHDMaYfTFEzsVbTxSvOChKt6GyRRCt5FLoUkWgXzDwNdlCHFiDAfQNBcQSmaPUGAox6TN2OBIUVyi4AAE1kkdJ6FAZocAJYGFXLeBF5KTZyoABpKrhdANVEsEhaoyAAOUbGJRQaIjDavvAMtKhIt5WD6K4dwMAzUyzbukxVezjWquiBqrVTKD56oCVuQ1gacUmpDQuc1UhHWgtCR4k2lK2mXnrlmCwobZbyxVPG9VC5NXJvxVMYklsUi5CYgAdTcB4Amkli2KXeJ8EA0VyFfD6E4XN9JPXcrkA8JATwlVizoRfAxpkO482qq8Ymppm7mAAJLiHEDk7wlBPCeGPh2zi3aRJPDgAMPtZgLD8rgIEYI8wR1jr2ROvRU64Go1nZYjFMh9SkEUJPVAZxmiFD3fSGUpE5wRARrXM+jhP3numEPWAjpYhjUxG3e4Fpx2UiiS-amRTWExGeGSHqihX6YMPfqQCOjaEPsw0++wDD8MbXEDKeQSrKL1jg52pVxbYhdtw3xBdg6YBceDfSLt3xcJoBmAu0G8G1WxAPbhqFlj17Cbk+gBTNz33XNIXs7j6AQP6BnQc88-kF1lhuAAeWdnQGTpi8YnUoAAdgEAumt5E4ANq9UqwGJ1XOZnc6p6++m2CgaM9OEz3QCP+DYN+pVGQQtqDGLpxoor0DAAXNoXQ7FDCoCMAuVAhs6TJoXFkAomB8B5YK3S7izxtP2Cs2NGz3nKqzAI1FrB6AuVCb8h2qB4hX7UV0aAR9R7+v0bblAKBSXMxTEY8xjjbHShcf8-WxtQm9l8ZWx5tbbcutKtw3tvzta4ANagE15LI9UsgC3QAZjbm5pi+3NPpPqCJoEIXDNRYwDFnJQ8tunfO6AHzUmIhkQrCoLjKWx7pcSMkVIZBcv5YIQktcOQ8gFCKIjqrCL0nFdKykCrSPqtTFq21lZwNhKQJmnR6sQFcRPHkBFWYg2qMV35oPeFVIpL6JfdBE+IlqcADF2fqQLnEvDfCbEH3GLdBq+MF2TYh3+gDcA5t2AWzgdjy3jueY8Hs4HR2Av65ayAfU04F1M6HlD6ZCKGpAIXNEM4249rFp9eWrpLqVSeCMLl13iaw0e5foSIwesRbidkIJn1rqQ+eDbtL3Tb31P1GtwChF0uBM7Yu6PWIp0F0BCCBz4e2f0C59KpZ6zRZIeXbHlujFX3kDEbbYe3QCQgJExNMu1uLP8zUaOCRIXIuF01Hm6xzXS29mW+Uin+F947cdgdwaZ3KoVazFL5Y5r9mbsLpbxz3DF4F3NEaFX4vM+mxz4X07hce0L-blQAuZQBewFmYlHWq9BeN+AnPItUVZOWmxHI0BDQj3sNjRgLi5OfLTm3MPurqPlrhPk9m+kwNaLhBAJQAkLwqUg8mgCqOvBbiphtppkgQwCgWgSppgeUmgLgTILZrhkQSQf4vchQagDgdJvgSkogcgWaJQAYGQb3FgagFQVJDpkDibs4DAHQAxoFBXrZj5lurujIDKIoBuooAAEqmg0Cigf7TD+i-4KESBlitx7LfCojAwSboAADEMwIQ6868N2AAgppOQFBHstlJoB9vXGIRIRmHQNEG4aFugJ4SZAusQNJM4Nrkbi9MzHzPqLUH6pARthKOTEKtMDMDdmXmPOYTdlkdkVPM8EAA/view)
- `report:accuracy`: Displays a simple histogram of 'known' tags and proposed tags. This data is used for the [Vega-Lite Model Accuracy chart](https://vega.github.io/editor/#/url/vega-lite/N4IgJAzgxgFgpgWwIYgFwhgF0wBwqgegIDc4BzJAOjIEtMYBXAI0poHsDp5kTykBaADZ04JAKyUAVhDYA7EABoQmOoLhpQmOAA9MaEABE2UBgjizMAAgDCSLWTYAnGgC877WaksBBKCcdIUACelsQQlJYAKjRmiiBQbIJO+gDuMCIgAL5KACZ2KKigDI6C+li4+EQBKdR0jEwMEHCOCRbmmJQJCARwdnIEjmxNsgBmcII5A3AjEATwSDmzyDSyBGwMuBsECGw54-yB-oFBnRDEWUrwNGRYaAAsAAwPSik0OfRoAGxPSq0j1xoQExAgBrMiDBiyHL6ADEAEZPgAmREAZm8cSQ2hoEEB4Le1kSyXQaQyShUUBBBKSjlS6S0cTxOQA8jhAnQgmgHpREUpBEgmOMqUSQCT6WTVHAhTTiXT1NkQGoyOZoYUFfzBYTpSLZXEVJg1FLaRl5cQaHAUoCIJhBiD1OhrUhZBBWY52hdlDo9KqRnJMABlVx2uEopT-QSldAwgBiMay8uQjhBgMwQRwdpAODYKz0SgggbQcKe8pdSAQONQAG1QLJS+nMGwyGQ1FHSzRBBzc+M4FAvZpU+nM9m4v9xos0BWQCNW+2QABdeVMFYqhXkZVZWdKcwJHIrMiA7SAkcTfQIFYbOA4sn9-QARwYjr17lIcWgSDUgJczTYaCngiaV7TfQIBvRw9EyeUOW9M1j3QQ5imOXVr3QO8HzoJ91FzKA3ztUBP0GH833-EAcjYZZZAAWUxNAxAecClDYVkoHZQFWh3FQ5EBEsEH0etG2bacOxAYg3wYO0uQAThNESxO5eUIBgJBANVPV33QcjdnGSwW1PGdQ2g5cpx0wSUyUkBZFIlY33dBJqWTCV9EibsYFkGg7wwyd9J4pyXLcxDTPM08a1KeV60SFQcHHUAj2XHY9lKAD0ycHcgt1ey1I04KFCizzYL8eDglS-V018I4CuybLRxPOxYAvQrVJASjMBqnFyo8yr0GaQZHEvZQ0pAABRRwuparK2pgkBAvPHqVPTcizy0CAoiQW15Fa6L9ASK06vTAkrUsFZLCMcMkG69dwKAA/view)
