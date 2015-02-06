Schrödinger's Game of Life
==========================

Abstract
--------

John Conway's Game of Life cellular automaton meets Schrödinger's Cat:
cells may be **Alive**, or **Dead**, or **Possibly-Alive-Possibly-Dead**.

Description
-----------

Recall that in the Game of Life, cells may be **Alive** (which we will depict
as `#`) or **Dead** (which we will depict as `.`).

A cell that is **Alive** remains **Alive** if 2 or 3 of its neighbours are
**Alive**; otherwise it becomes **Dead**.

A cell that is **Dead** becomes **Alive** if exactly 2 of its neighbours are
**Alive**, otherwise it remains **Dead**.

("Neighbours" in this sense means a Moore neighbourhood: the 8 surrounding
cells, both cardinals and diagonals.)

To this, we add a third cell type, **Possibly-Alive-Possibly-Dead**.  (For
brevity, we will also call this type **Cat**.)  We will depict it as `?`.

If a cell is **Cat** we must consider both possibilities; what would its next
state be if it was **Alive**, and what would its next state be if it was
**Dead**?  If the answer to both of these questions is the same, then that is
the outcome for that cell on the next state; but cells which have different
outcomes under those two conditions themselves become **Cat**.

In fact, this is just a sort of non-deterministic-ification operation
applied to the base cellular automaton, and such an operation could probably
be applied to any cellular automaton.

We could certainly implement this in a brute-force, check-all-the-possibilities
fashion.  But observe that in a CA with only two states, adding nondeterminism
like this is not any different from simply adding a third state, and figuring
out the rules for the new set of states.  It should be entirely possible to
derive a sort of "closed form" of the nondeterministic behaviour, in terms of
deterministic rules — not unlike the [powerset construction][] which turns an
NFA into a DFA — and that is what we shall attempt here.

I think it goes like this: instead of considering only the number of **Alive**
neighbours, we must now consider two counts: the minimum number of **Alive**
neighbours, and the maximum number of **Alive** neighbours.  (Call these
*min-alive* and *max-alive* for brevity.)

*   Each neighbouring `#` cell counts as min-alive 1 and max-alive 1.
*   Each neighbouring `.` cell counts as min-alive 0 and max-alive 0.
*   Each neighbouring `?` cell counts as min-alive 0 and max-alive 1.

And for each cell, we simply sum these up to achieve these two counts.

As an example, the middle cell in the following diagram has min-alive 1 and
max-alive 6:

    ???
    ?x?
    #..

Now, using these two counts, the new rules are:

*   A cell which is **Alive**:
    
    *   remains **Alive** if its min-alive is 2 or 3 and its max-alive is 2 or 3.
    *   becomes **Dead** if its min-alive is 4 or greater, or its max-alive is 1
        or fewer.
    *   otherwise becomes **Cat**.
    
*   A cell which is **Dead**:
    
    *   becomes **Alive** if its min-alive is 3 and its max-alive is 3.
    *   remains **Dead** if its min-alive is 4 or greater, or its max-alive is 2
        or fewer.
    *   otherwise becomes **Cat**.
    
*   A cell which is **Cat**:
    
    *   becomes **Alive** if its min-alive is 3 and its max-alive is 3.
    *   becomes **Dead** if its min-alive is 4 or greater, or its max-alive is 1
        or fewer.
    *   otherwise remains **Cat**.

Now that we have stated the new rules, we see they are not particularly
difficult to implement, so, that is just what we have done.  However,
this matter of there being two counts for each cell is a bit more than
[ALPACA][] can express, so the automaton has simply been implemented
from scratch in Python, in the file `script/slife` in this repository.

There is certainly *some* way to state the rules such that ALPACA could
accept them.  However, I have not worked it out, and I believe there is a
good chance that such an "even more closed form" would only serve to
overcomplicate the description.  I shall leave the deriving of it as an
exercise for the interested reader.

Anyway, now that we have an implementation, we can confirm that it meets
our expectations by giving it a few example configurations to test it.

Examples
--------

    -> Tests for functionality "Evolve Schroedinger's Life for 5 steps"

    -> Functionality "Evolve Schroedinger's Life for 5 steps"
    -> is implemented by shell command "./script/slife %(test-body-file)"

When a playfield consists solely of `.` and `#` cells, this cellular automaton
has precisely the same behaviour as John Conway's Game of Life.  For example,
here is a glider:

    | ............
    | ............
    | ............
    | .....##.....
    | ....#.#.....
    | ......#.....
    | ............
    | ............
    = ............|............|............|............|............
    = ............|............|............|............|............
    = ............|............|......#.....|......##....|......##....
    = .....##.....|.....###....|......##....|.....#.#....|.......##...
    = ......##....|.......#....|.....#.#....|.......#....|......#.....
    = .....#......|......#.....|............|............|............
    = ............|............|............|............|............
    = ............|............|............|............|............

But now we turn our attention to the newcomer, **Cat**.  The first thing to
note is that in cases where, in Conway's Life, the result is the same
regardless of whether the cell is **Dead** or **Alive**, the result will
continue to be the same when the cell is **Cat**.

One such example is a lone cell, with no neighbours.  Whether it be
**Dead** or **Alive**, on the next turn, it will always be **Dead**.

    | .....
    | .....
    | ..?..
    | .....
    | .....
    = .....|.....|.....|.....|.....
    = .....|.....|.....|.....|.....
    = .....|.....|.....|.....|.....
    = .....|.....|.....|.....|.....
    = .....|.....|.....|.....|.....

Another such example is the "self-healing block": if a 2x2 block is missing
a corner, *or* if that corner is present, the next configuration will always
be a full 2x2 block.

    | ......
    | ......
    | ..##..
    | ..#?..
    | ......
    | ......
    = ......|......|......|......|......
    = ......|......|......|......|......
    = ..##..|..##..|..##..|..##..|..##..
    = ..##..|..##..|..##..|..##..|..##..
    = ......|......|......|......|......
    = ......|......|......|......|......

This extends to a fuse that ends in a block: it survives having a **Cat** at
the end:

    | .........
    | ..##.....
    | ..#.#....
    | .....#...
    | ......#..
    | .......?.
    | .........
    = .........|.........|.........|.........|.........
    = ..##.....|..##.....|..##.....|..##.....|..##.....
    = ..#.#....|..#.#....|..#.?....|..#?.....|..##.....
    = .....#...|.....?...|.........|.........|.........
    = ......?..|.........|.........|.........|.........
    = .........|.........|.........|.........|.........
    = .........|.........|.........|.........|.........

Within this realm of predictability, some forms composed entirely of **Cat**s
behave remarkably similar to the same **Alive** forms.  For example, the 2x2
block is stable:

    | ......
    | ......
    | ..??..
    | ..??..
    | ......
    | ......
    = ......|......|......|......|......
    = ......|......|......|......|......
    = ..??..|..??..|..??..|..??..|..??..
    = ..??..|..??..|..??..|..??..|..??..
    = ......|......|......|......|......
    = ......|......|......|......|......

And the blinker behaves conventionally:

    | .......
    | .......
    | ...?...
    | ...?...
    | ...?...
    | .......
    | .......
    = .......|.......|.......|.......|.......
    = .......|.......|.......|.......|.......
    = .......|...?...|.......|...?...|.......
    = ..???..|...?...|..???..|...?...|..???..
    = .......|...?...|.......|...?...|.......
    = .......|.......|.......|.......|.......
    = .......|.......|.......|.......|.......

In general, though, non-determinism is non-determinism.  Adding `?`s to a
form adds uncertainty, and there are relatively few avenues in Life by which
uncertainty is reined in, as in the above examples.  Thus, uncertainty tends
to propagate throughout the form, and, indeed, beyond.

Here is what happens if we try something which we are only *mostly* sure is a
glider.

    | ............
    | ............
    | ............
    | .....##.....
    | ....#.?.....
    | ......#.....
    | ............
    | ............
    = ............|............|............|............|............
    = ............|............|............|............|......?.....
    = ............|............|......?.....|.....???....|.....???....
    = .....#?.....|.....???....|.....???....|.....???....|....?????...
    = ......#?....|.....???....|.....???....|....?????...|....?????...
    = .....?......|......?.....|.....???....|.....???....|....?????...
    = ............|............|............|......?.....|.....???....
    = ............|............|............|............|............

In fact, this is not very different from a form which we are *completely*
unsure if it's a glider:

    | ............
    | ............
    | ............
    | .....??.....
    | ....?.?.....
    | ......?.....
    | ............
    | ............
    = ............|............|............|............|............
    = ............|............|............|............|......?.....
    = ............|............|......?.....|.....???....|....????....
    = .....??.....|.....???....|....????....|....????....|...??????...
    = .....???....|....????....|....????....|...??????...|...??????...
    = .....?......|.....??.....|....????....|....????....|...??????...
    = ............|............|............|.....??.....|....????....
    = ............|............|............|............|............

Obviously, if either of these were to continue to run for more generations,
the entire space would continue to be filled up with **Cat**s, unboundedly.

One way to think about this is that our probably-a-glider actually represents
two forms (one of which is a glider, the other isn't,) and our 5-**Cat**
could-be-a-glider actually represents 2^5 = 32 different forms in
nondeterministic superposition.  In both cases, the **Cat**s that exist after
_n_ generations constitute a sort of "convex hull", or upper-bound
approximation, of where the "influence" of all these original forms could
possibly reach.

Discussion
----------

Er, and that's it, really.  I expect there are a few other forms which are
stable even though they're made of **Cat**s (an infinite barber pole probably
is.)  But the mathematics of it stop here, and if that's all you're interested
in, you can stop reading.  The rest of this document is purely opinion and
blather.

This cellular automaton is an original idea — I came up with it myself,
independently (the note "Design and implement a cellular automaton with a
non-deterministic state" has been sitting in my ideas file since at least 2009,
possibly 2007,) but I do not claim it is *novel* — in fact, I would be surprised
if it hasn't been looked into before.  I would not be surprised if it was
mentioned in an academic paper I haven't read, possibly in an unpublished
internal report (the kind that universities sometimes collect), possibly
before I was even born.  (I am mainly just making a distinction between
"original" and "novel" here because sometimes people confuse the two.)

Obviously, I'm taking a few liberties with the title.  Erwin Schrödinger
did not invent this Game of Life.  But that's not how it's supposed to be
read.  As an _homage_ to Schrödinger, it would be even better if it was an
automaton that incorporated the [wave function][] somehow.  I don't have any
good ideas on how to go about that, though, and the mathematics of it would
be a bit beyond me.  (If you have any similar ideas though, I strongly
encourage you to try them out!)

Two points of trivia:

One, I understand that there's a historical-orthographic theory that the shape
of the glyph `?` comes from a depiction of a cat's rear end, with its tail in
the air.  If this is true, it's not inappropriate for our use of it to depict
**Cat** here, then.

Two, a stalemate in Tic-Tac-Toe (a.k.a Noughts and Crosses) is sometimes called
a **Cat's Game**.  Being neither a **Win** nor a **Loss**, it also seems
appropriate here.

Now, to regard those two things as anything but coincidences would be stretching
things.  However, we may well ask why Schrödinger chose a cat for his thought
experiment in the first place, when a rabbit would have done just as well.
Or a dog.  Or a [slime mold][].  Or... but wait, I'm getting ahead of myself.

I was going to write a whole long screed about Schrödinger's Cat here, but
that sort of thing gets tiresome.  So maybe I'll just leave you with a bit
of terrible doggerel I wrote back in the mid-90's:

> We've all heard of Schrödinger's Cat,  
> That famous thought 'sperimentation.  
> But you don't suppose it's possible that  
> The *cat* made an observation?  

And here is "Schrödinger's Cat Extended Dance Mix":

Carrying a live cat and a quantum boobytrap, you walk into a room, in which is
a fellow experimenter and a table containing two open, empty boxes.

You give the items to your colleague, step out of the room, and close the
door.

A minute later you open it again and walk back in.  The boxes are closed
and there is no sign of the cat.

You check the environment carefully to ensure there are no hidden compartments
and that your colleague has not eaten the cat.

You open one of the boxes.

What are the possible outcomes?

Which of these outcomes involve the collapsing of a quantum superposition,
and which do not?

Why does the Copenhagen Interpretation tell us that predicting some of these
outcomes is mere odds-making, while other outcomes involve such exotic
concepts as being both dead and alive at the same time?

Is the wave function not just another mathematical model, like the parabola of
Newtonian physics or the curved spacetime of Einsteinian relativity?

Why should we try to make our notions of ontology and epistomology bend over
backwards for the sake of a mathematical model?

In conclusion, it's a [safe bet][] that [Dr. Quantum][] is [bunko][].

Happy "We need to talk"!  
Chris Pressey, Cat's Eye Technologies  
February 7, 2015  
Reading, England, UK

[powerset construction]: https://en.wikipedia.org/wiki/Powerset_construction
[ALPACA]: http://catseye.tc/node/ALPACA
[wave function]: http://en.wikipedia.org/wiki/Wave_function
[slime mold]: http://catseye.tc/node/Jaccia
[safe bet]: https://en.wikipedia.org/wiki/Probability_theory
[Dr. Quantum]: http://www.fredalanwolf.com/
[bunko]: http://rationalwiki.org/wiki/Quantum_woo
