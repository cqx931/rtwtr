# rtwtr : reading through writing through reading ...

# Notes: 

Text preparation workflow goes like this:

1. Plain text a & b files (which may have some inline html) are prepared from a word-processed essay (in this case).
2. The texts are pre-processed (I do this in BBEdit but this could quite easily be scripted or incorporated into webapp preprocessing, down the line) so that it is marked up with break-marking tags which target the results we want from a form of git's word-diff command. First, we run a replace-all grep that makes punctuation matchable:
	* `([“‘”’\;,:\)\(\?\.\!-]) -> _\1_` (there's surely a better formulation)
3. Then we _manually_ add optional `<cb/>, <tb/>, <pb/>` and, mandatory for multi-screen/section pieces, `<sb/>` tags.
4. Finally, I _manually_ mark any sequences that cannot be automatically parsed into corresponding **units** with `<ub></ub>` tag pairs.
5. The marked up texts are now in a\_file.text and b\_file.text, so we run this command on them (see below for sample output). Note that quotation marks around the regex are needed and it is a *space* charcter after the caret.
	```
	git diff --no-index --word-diff-regex="[^ _]+" --word-diff=porcelain a_file.txt b_file.txt > ab_worddiff.txt
	```
6. The a and b files can now be laid out in spans by parsing this ab\_worddiff.txt output in the webapp.
	

#break-marking tags

**some definitions:**

**shared span** = a run of one or more matching 'words' (as defined by word-diff) that is shared in the a\_file and b\_file. The rendered positions of shared spans in the a\_file become potential **anchors** or registration points for the units from the b\_file when they are faded in. **units** are sequences of spans that are either marked as equivalent in different **sections** of the files ***(there must be an equal number of units in each a\_file and b\_file section)*** or defined by `<tb/>` level tags or punctuatiion (see below). That is:

If no units are marked explicitly, then units are defined by <tb/> tags.

`_,_ or _;_ or _:_ and/or <cb/> = "comma" or "clause" break.` Allows for this to be matched by word-diff and thus to rebase the forward looking diff algorithm. This is removed on rendering with no effect on html. (Anything either side of this tag is in the same `<p></p>`.) Used 'inline' with "\_" either side: "\_<cb/>\_"

`_._ or _?_ or _!_ or <tb/> = "thought" break.` As above. It tag, then on its own line. Used for conventional sentences. By default, defines **units** for sections which have an equal number of sentences/thoughts.

`<pb/> = "paragraph" break.` As above, but on its own line in a source file with no delimiters. Simply renders a new `<p></p>` (or equivalent) in the html.

`<ub></ub> A tag pair that overrides unit definition` That is, the visualization "units" for a screen or section. Needs to be a tag pair so as to be able to enclose (exceptionally) more than one <cb/> or <pb/> and or </tb> and their shared spans. Currently coded as `_<ub>_` and `_</ub>_`.

`<sb/> = "screen" or "section" break.` On its own line in the source file. Marks generation and separate rendering of a new screen.

#rtwtr git word diff

**git word-diff using "_" delimiter:**

`git diff --no-index --word-diff-regex="[^ _]+" --word-diff=porcelain a_file.txt b_file.txt > ab_worddiff.txt`

**Output from run on page 1 for parsing:**

```
diff --git a/a_file.txt b/b_file.txt
index fad65cb..86cf44b 100644
--- a/a_file.txt
+++ b/b_file.txt
@@ -1,41 +1,27 @@
 This 
-“_writing through_”_ of Vilém Flusser_’_s _‘_The Future of Writing_,__’_ reconfiguring it so as to become John Cayley_’_s _‘_The Future of Language_,__’
+essay
  will not consider 
+the
  problems concerning
-any possible future for
  the 
-teaching or philosophizing
+future
  of 
-an
+teaching the
  art of 
-language
+writing
  in the face of the growing importance of 
-non_-_ or anti_-_linguistic
+nonliterate
  messages in our surroundings_,_ although those problems 
-have already
+will
  become 
-significant
+ever more important both
  in the so_-_called developed countries 
+and in societies where illiteracy is still widespread
 _._
~
 <ub>
~
 Instead_,_ it proposes to consider a tendency that underlies those problems_:_ namely_,_ the tendency 
-to deny or distrust the fundamental linearity of language _(
+away from linear codes such
  as 
-perceptible phenomenon_)
+writing
  and toward 
-multi
+two
 _-_dimensional codes such as photographs_,_ films_,
-TV_,_ screen_-_based graphic design in the service of social and socialized media_,
 _ and 
-,_ generally
+TV
 _,_ a 
-conception of art and aesthetics
+tendency
  that
-is dominated by visuality_,_ by so_-_called _“_fine_”_ as _“_visual_”_ or _“_plastic_”_ art even as and when this world of art embraces the conceptualism or _“_post_-_medium condition_”_ which could_,_ in principle if not in practice_,_ be extended to the arts of language_._
~
-This distrust and denial
  may be observed
-everywhere
  if one glances even superficially at the codified world that surrounds us_.
-Literature is $50bn behind art_._
~
-The MoMAs in every province and metropolis are stuffed to their gills with hipsters_,_ gleeful families and young _“_artists_”_ while fewer and fewer deserted book malls provide desultory subterranean spaces for retiree reading groups_.
 _
~
 </ub>
~
 The
-“
  future
-”
  of 
-language_,_ or rather
+writing
 _,_ of 
-those gestures
+that gesture
  which 
-align
+aligns
  symbols to produce 
-our shared_,_ collective_,_ readable utterances
+texts
 _,_ must be seen against the background of 
-a long_-_standing
+that
  tendency
-to distrust their alignment
 _._
~
 <sb/>
```

<br>

To Install:

$ npm install

<br>

To Run:

open index.html in a browser (using a local server is advisable)
