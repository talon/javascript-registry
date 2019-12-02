# @talon/autocast

> absurdist podcast scripting

# Settings

```json
{
  "sources": "sources",
  "use": ["vice"],
  "order": 2,
  "parallel": 5,
  "hosts": ["Talon", "Cybele"]
}
```

> settings.json

## sources

Sources is a folder of folders with text files. How these are created is outside the scope of this project.

## use

Which sources to use. These will be combined together and used to generate the script content.

## order

The markov chain order

## parallel

How many of the source files to read at a time. this doesn't effect the script just how fast the sources are initally read into the chain.

## hosts

The script will randomly select from this array when assigning lines

# Usage

```js
npm run script
```
