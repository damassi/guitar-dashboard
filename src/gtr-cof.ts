///<reference path="../node_modules/@types/d3/index.d.ts" />

tonics.init();
modes.init(music.scaleFamily[0]);
chordInterval.init();
chordDiagram.init();
let chromatic = new cof.NoteCircle(d3.select("#chromatic"), music.chromatic(), "Chromatic");
let circleOfFifths = new cof.NoteCircle(d3.select("#cof"), music.fifths(), "Circle of Fifths");
gtr.init();
tuning.init();
scaleFamily.init();
state.init();
cookies.init();
