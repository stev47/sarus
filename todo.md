# Features

- support multiple collections: rename `cards` to `[collection name]` and go
  from there? we probably only need one collection.
- support card input through forms (partly figured out)
- display stats: number of cards: reviewing + new = all
- where to save parameters? per collection?
- ui: add mouse control, use scroll wheel

# Algorithm

- probably really good: let update value depend on `dt`
- calculate `b` update constant from min/max parameter
- tweak above min/max parameter: `ĥ(60s) = 1d`, `ĥ(7d) = 60s` doesn't seem good
- tweak initial `b` value: maybe around `0`?

# Collections
- kanji: stroke order
- japanese sentences: think about how to do furigana


