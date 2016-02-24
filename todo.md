# ToDo

## Features

- display stats: number of cards: reviewing + new = all
- support multiple collections:
  per directory, url `/:collection/:path`, server/client js, css?,
  config for parameters.
- support card input through forms (partly figured out)
- ui: add mouse control, use scroll wheel

## Algorithm

- probably really good: let update value depend on `dt`
- calculate `b` and `c` (const?) update action from min/max parameter
- tweak above min/max parameter: `ĥ(60s) = 1d`, `ĥ(7d) = 60s` doesn't seem good
- tweak initial `b` value: maybe around `0`?

## Collections

- japanese sentences: think about how to do furigana
- <del>kanji: stroke order</del>
- <del>audio reading using open-jtalk</del>
- <del>japanese sentences: creation tool using tatoeba</del> not worth it, data is in bad shape
  http://downloads.tatoeba.org/exports/sentences.tar.bz2
  http://www.edrdg.org/wiki/index.php?title=Tanaka_Corpus&oldid=613
  http://downloads.tatoeba.org/exports/jpn_indices.tar.bz2


