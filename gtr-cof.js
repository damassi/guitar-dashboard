///<reference path="node_modules/@types/d3/index.d.ts" />
var music;
(function (music) {
    music.noteBases = [
        { id: 0, index: 0, name: 'C' },
        { id: 1, index: 2, name: 'D' },
        { id: 2, index: 4, name: 'E' },
        { id: 3, index: 5, name: 'F' },
        { id: 4, index: 7, name: 'G' },
        { id: 5, index: 9, name: 'A' },
        { id: 6, index: 11, name: 'B' }
    ];
    var noteLabels = [
        { offset: 0, label: '' },
        { offset: 1, label: '♯' },
        { offset: 2, label: '♯♯' },
        { offset: -1, label: '♭' },
        { offset: -2, label: '♭♭' },
    ];
    music.modes = [
        { name: 'Lydian', index: 3 },
        { name: 'Major / Ionian', index: 0 },
        { name: 'Mixolydian', index: 4 },
        { name: 'Dorian', index: 1 },
        { name: 'N Minor / Aeolian', index: 5 },
        { name: 'Phrygian', index: 2 },
        { name: 'Locrian', index: 6 },
    ];
    var scaleTones = [2, 2, 1, 2, 2, 2, 1];
    music.tuning = [
        4,
        9,
        2,
        7,
        11,
        4,
    ];
    var romanNumeral = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
    (function (ChordType) {
        ChordType[ChordType["Major"] = 0] = "Major";
        ChordType[ChordType["Minor"] = 1] = "Minor";
        ChordType[ChordType["Diminished"] = 2] = "Diminished";
    })(music.ChordType || (music.ChordType = {}));
    var ChordType = music.ChordType;
    ;
    ;
    function generateScale(noteBase, index, mode) {
        var scale = [];
        var currentIndex = index;
        var currentNoteBase = noteBase;
        var _loop_1 = function(i) {
            var offset = currentIndex - currentNoteBase.index;
            if (Math.abs(offset) > 2) {
                offset = (currentIndex < currentNoteBase.index)
                    ? (currentIndex + 12) - currentNoteBase.index
                    : currentIndex - (currentNoteBase.index + 12);
            }
            // lookup noteLabel with offset
            var noteLabel = noteLabels.filter(function (n) { return n.offset == offset; })[0];
            // add new ScaleNote to scale
            scale.push({
                index: currentIndex,
                degree: i,
                noteName: currentNoteBase.name + noteLabel.label,
                noteBase: currentNoteBase,
                canSelect: Math.abs(offset) < 2,
                chord: null
            });
            var interval_1 = scaleTones[(mode.index + i) % 7];
            currentIndex = (currentIndex + interval_1) % 12;
            currentNoteBase = music.noteBases[(currentNoteBase.id + 1) % 7];
        };
        for (var i = 0; i < 7; i++) {
            _loop_1(i);
        }
        var scalePlusChord = [];
        for (var _i = 0, scale_1 = scale; _i < scale_1.length; _i++) {
            var note = scale_1[_i];
            scalePlusChord.push({
                index: note.index,
                degree: note.degree,
                noteName: note.noteName,
                noteBase: note.noteBase,
                canSelect: note.canSelect,
                chord: generateChord(scale, note)
            });
        }
        return scalePlusChord;
    }
    music.generateScale = generateScale;
    function generateChord(scale, root) {
        var triad = [
            root.index,
            scale[(root.degree + 2) % 7].index,
            scale[(root.degree + 4) % 7].index
        ];
        var chordType = getChordType(triad);
        var roman = romanNumeral[root.degree];
        if (chordType === ChordType.Major) {
            roman = roman.toLocaleUpperCase();
        }
        if (chordType === ChordType.Diminished) {
            roman = roman + "°";
        }
        return {
            romanNumeral: roman,
            triad: triad,
            type: chordType
        };
    }
    function appendTriad(scale, chord) {
        for (var _i = 0, scale_2 = scale; _i < scale_2.length; _i++) {
            var note = scale_2[_i];
            for (var i = 0; i < 3; i++) {
                if (note.index === chord.triad[i]) {
                    note.chordNote = i;
                }
            }
        }
        return scale;
    }
    music.appendTriad = appendTriad;
    function fifths() {
        var indexes = [];
        var current = 0;
        for (var i = 0; i < 12; i++) {
            indexes.push(current);
            current = (current + 7) % 12;
        }
        return indexes;
    }
    music.fifths = fifths;
    function getChordType(triad) {
        // check for diminished
        if (interval(triad[0], triad[2]) === 6)
            return ChordType.Diminished;
        // check for minor
        if (interval(triad[0], triad[1]) === 3)
            return ChordType.Minor;
        // must be Major
        return ChordType.Major;
    }
    function interval(a, b) {
        return (a <= b) ? b - a : (b + 12) - a;
    }
})(music || (music = {}));
var state;
(function (state) {
    var listeners = [];
    var currentMode = music.modes[1];
    var currentNoteBase = music.noteBases[0];
    var currentIndex = 0;
    function addListener(listener) {
        listeners.push(listener);
    }
    state.addListener = addListener;
    function changeTonic(newNoteBase, index) {
        currentNoteBase = newNoteBase;
        currentIndex = index;
        updateListeners();
    }
    state.changeTonic = changeTonic;
    function changeMode(newMode) {
        currentMode = newMode;
        updateListeners();
    }
    state.changeMode = changeMode;
    function changeChord(chord) {
        updateListeners(chord);
    }
    state.changeChord = changeChord;
    function updateListeners(chord) {
        var scale = music.generateScale(currentNoteBase, currentIndex, currentMode);
        if (chord) {
            scale = music.appendTriad(scale, chord);
        }
        var stateChange = {
            mode: currentMode,
            noteBase: currentNoteBase,
            index: currentIndex,
            scale2: scale
        };
        for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
            var listener = listeners_1[_i];
            listener(stateChange);
        }
    }
})(state || (state = {}));
var cof;
(function (cof_1) {
    var noteSegments = null;
    var noteText = null;
    var degreeSegments = null;
    var degreeText = null;
    var chordSegments = null;
    var chordNotes = null;
    var indexer = function (x) { return x.index + ""; };
    function init() {
        var pad = 30;
        var svg = d3.select("#cof");
        var chordRadius = 220;
        var noteRadius = 200;
        var degreeRadius = 135;
        var innerRadius = 90;
        var cof = svg
            .append("g")
            .attr("transform", "translate(" + (noteRadius + pad) + ", " + (noteRadius + pad) + ")");
        var segments = generateSegments(12);
        var noteArc = d3.svg.arc()
            .innerRadius(degreeRadius)
            .outerRadius(noteRadius);
        var degreeArc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(degreeRadius);
        var chordArc = d3.svg.arc()
            .innerRadius(noteRadius)
            .outerRadius(chordRadius);
        noteSegments = cof.append("g").selectAll("path")
            .data(segments, indexer)
            .enter()
            .append("path")
            .attr("d", noteArc)
            .attr("class", "note-segment")
            .on("click", handleNoteClick);
        noteText = cof.append("g").selectAll("text")
            .data(segments)
            .enter()
            .append("text")
            .attr("x", function (x) { return noteArc.centroid(x)[0]; })
            .attr("y", function (x) { return noteArc.centroid(x)[1] + 11; })
            .text("")
            .attr("class", "note-segment-text");
        degreeSegments = cof.append("g").selectAll("path")
            .data(segments, indexer)
            .enter()
            .append("path")
            .attr("d", degreeArc)
            .attr("class", "degree-segment");
        degreeText = cof.append("g").selectAll("text")
            .data(segments, indexer)
            .enter()
            .append("text")
            .attr("x", function (x) { return degreeArc.centroid(x)[0]; })
            .attr("y", function (x) { return degreeArc.centroid(x)[1] + 8; })
            .text("")
            .attr("class", "degree-segment-text");
        chordSegments = cof.append("g").selectAll("path")
            .data(segments, indexer)
            .enter()
            .append("path")
            .attr("d", chordArc)
            .attr("class", "chord-segment")
            .on("click", handleChordClick);
        chordNotes = cof.append("g").selectAll("circle")
            .data(segments, indexer)
            .enter()
            .append("circle")
            .style("pointer-events", "none")
            .attr("r", 15)
            .attr("cx", function (x) { return chordArc.centroid(x)[0]; })
            .attr("cy", function (x) { return chordArc.centroid(x)[1]; })
            .attr("class", "chord-segment-note");
        state.addListener(update);
    }
    cof_1.init = init;
    function update(stateChange) {
        var data = [];
        for (var _i = 0, _a = stateChange.scale2; _i < _a.length; _i++) {
            var n = _a[_i];
            data.push({
                startAngle: 0,
                endAngle: 0,
                scaleNote: n,
                index: n.index
            });
        }
        noteSegments
            .data(data, indexer)
            .attr("class", function (d, i) { return "note-segment " + ((i === 0) ? "note-segment-tonic" : "note-segment-scale"); })
            .exit()
            .attr("class", "note-segment");
        noteText
            .data(data, indexer)
            .text(function (d) { return d.scaleNote.noteName; })
            .exit()
            .text("");
        degreeSegments
            .data(data, indexer)
            .attr("class", "degree-segment-selected")
            .exit()
            .attr("class", "degree-segment");
        degreeText
            .data(data, indexer)
            .text(function (d, i) { return d.scaleNote.chord.romanNumeral; })
            .exit()
            .text("");
        chordSegments
            .data(data, indexer)
            .attr("class", function (d, i) { return getChordSegmentClass(d.scaleNote); })
            .exit()
            .attr("class", "chord-segment");
        chordNotes
            .data(data, indexer)
            .attr("class", function (d, i) { return getChordNoteClass(d.scaleNote); })
            .exit()
            .attr("class", "chord-segment-note");
    }
    cof_1.update = update;
    function getChordSegmentClass(note) {
        if (note.chord.type === music.ChordType.Diminished)
            return "chord-segment-dim";
        if (note.chord.type === music.ChordType.Minor)
            return "chord-segment-minor";
        if (note.chord.type === music.ChordType.Major)
            return "chord-segment-major";
        throw "Unexpected ChordType";
    }
    function getChordNoteClass(note) {
        if (note.chordNote === undefined)
            return "chord-segment-note";
        if (note.chordNote === 0)
            return "chord-segment-note-root";
        if (note.chordNote === 1)
            return "chord-segment-note-third";
        return "chord-segment-note-fifth";
    }
    function generateSegments(count) {
        var fifths = music.fifths();
        var items = [];
        var angle = (Math.PI * (2 / count));
        for (var i = 0; i < count; i++) {
            var itemAngle = (angle * i) - (angle / 2);
            items.push({
                startAngle: itemAngle,
                endAngle: itemAngle + angle,
                scaleNote: null,
                index: fifths[i]
            });
        }
        return items;
    }
    function handleNoteClick(segment, i) {
        if (segment.scaleNote.canSelect) {
            state.changeTonic(segment.scaleNote.noteBase, segment.scaleNote.index);
        }
    }
    function handleChordClick(segment, i) {
        state.changeChord(segment.scaleNote.chord);
    }
})(cof || (cof = {}));
var tonics;
(function (tonics_1) {
    var buttons = null;
    ;
    function init() {
        var pad = 5;
        var buttonHeight = 25;
        var svg = d3.select("#modes");
        var tonics = svg.append("g");
        var bg = function (noteBase) {
            return [
                { noteBase: noteBase, label: noteBase.name + "♭", index: noteBase.index == 0 ? 11 : noteBase.index - 1 },
                { noteBase: noteBase, label: noteBase.name + "", index: noteBase.index },
                { noteBase: noteBase, label: noteBase.name + "♯", index: (noteBase.index + 1) % 12 }
            ];
        };
        var gs = tonics.selectAll("g")
            .data(music.noteBases)
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(0, " + (i * (buttonHeight + pad) + pad) + ")"; })
            .selectAll("g")
            .data(function (d) { return bg(d); }, indexer)
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(" + (i * 55) + ", 0)"; });
        buttons = gs
            .append("rect")
            .attr("x", pad)
            .attr("y", 0)
            .attr("strokeWidth", 2)
            .attr("width", 40)
            .attr("height", 25)
            .attr("class", "tonic-button")
            .on("click", handleButtonClick);
        gs
            .append("text")
            .attr("x", pad + 10)
            .attr("y", 17)
            .text(function (x) { return x.label; })
            .attr("class", "tonic-text");
        state.addListener(listener);
    }
    tonics_1.init = init;
    function handleButtonClick(d, i) {
        state.changeTonic(d.noteBase, d.index);
    }
    function listener(state) {
        var tonic = state.scale2[0];
        var ds = [{
                noteBase: state.noteBase,
                label: tonic.noteName,
                index: tonic.index
            }];
        buttons
            .data(ds, indexer)
            .attr("class", "tonic-button tonic-button-selected")
            .exit()
            .attr("class", "tonic-button");
    }
    function indexer(d) {
        return d.label;
    }
})(tonics || (tonics = {}));
var modes;
(function (modes_1) {
    var buttons = null;
    function init() {
        var pad = 5;
        var buttonHeight = 25;
        var svg = d3.select("#modes");
        var modes = svg
            .append("g")
            .attr("transform", "translate(0, 250)");
        var gs = modes.selectAll("g")
            .data(music.modes, function (m) { return m.index.toString(); })
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(0, " + (i * (buttonHeight + pad) + pad) + ")"; });
        buttons = gs
            .append("rect")
            .attr("x", pad)
            .attr("y", 0)
            .attr("strokeWidth", 2)
            .attr("width", 150)
            .attr("height", 25)
            .attr("class", "mode-button")
            .on("click", handleButtonClick);
        gs
            .append("text")
            .attr("x", pad + 10)
            .attr("y", 17)
            .text(function (x) { return x.name; })
            .attr("class", "mode-text");
        state.addListener(update);
    }
    modes_1.init = init;
    function handleButtonClick(mode, i) {
        state.changeMode(mode);
    }
    function update(stateChange) {
        var modes = [stateChange.mode];
        buttons
            .data(modes, function (m) { return m.index.toString(); })
            .attr("class", "mode-button mode-button-selected")
            .exit()
            .attr("class", "mode-button");
    }
})(modes || (modes = {}));
var gtr;
(function (gtr_1) {
    var notes = null;
    var numberOfFrets = 16;
    var noteColours = [
        "yellow",
        "white",
        "white",
        "white",
        "white",
        "white",
        "white"
    ];
    function indexer(stringNote) {
        return stringNote.index + "_" + stringNote.octave;
    }
    function init() {
        var stringGap = 40;
        var fretGap = 70;
        var fretWidth = 5;
        var noteRadius = 15;
        var pad = 50;
        var fretData = getFretData(numberOfFrets);
        var dots = [
            [3, 3],
            [5, 3],
            [7, 3],
            [9, 3],
            [12, 2],
            [12, 4],
            [15, 3]
        ];
        var svg = d3.select("#gtr");
        var gtr = svg.append("g");
        // frets
        gtr.append("g").selectAll("rect")
            .data(fretData)
            .enter()
            .append("rect")
            .attr("x", function (d, i) { return (i + 1) * fretGap + pad - fretWidth; })
            .attr("y", pad + stringGap / 2 - fretWidth)
            .attr("width", fretWidth)
            .attr("height", stringGap * 5 + (fretWidth * 2))
            .attr("fill", function (d, i) { return i === 0 ? "black" : "none"; })
            .attr("stroke", "grey")
            .attr("stroke-width", 1);
        // dots
        gtr.append("g").selectAll("circle")
            .data(dots)
            .enter()
            .append("circle")
            .attr("r", noteRadius)
            .attr("cx", function (d) { return d[0] * fretGap + pad + (fretGap / 2); })
            .attr("cy", function (d) { return (d[1] + 1) * stringGap + 12; })
            .attr("fill", "lightgrey")
            .attr("stroke", "none");
        var strings = gtr.append("g").selectAll("g")
            .data(music.tuning.reverse(), function (n) { return n + ""; })
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(0, " + ((i * stringGap) + pad) + ")"; });
        // string lines
        strings
            .append("line")
            .attr("x1", pad + fretGap)
            .attr("y1", stringGap / 2)
            .attr("x2", pad + (fretGap * numberOfFrets) + 20)
            .attr("y2", stringGap / 2)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        notes = strings
            .selectAll("circle")
            .data(function (d) { return allNotesFrom(d, numberOfFrets); }, indexer)
            .enter()
            .append("circle")
            .attr("r", noteRadius)
            .attr("cy", stringGap / 2)
            .attr("cx", function (d, i) { return i * fretGap + pad + 30; })
            .attr("fill", "none")
            .attr("stroke", "none");
        state.addListener(update);
    }
    gtr_1.init = init;
    function update(stateChange) {
        var fill = function (d, i) {
            return noteColours[i % 7];
        };
        var stroke = function (d, i) {
            var note = d.scaleNote;
            if (note.chordNote === undefined) {
                return "grey";
            }
            if (note.chordNote === 0) {
                return "red";
            }
            if (note.chordNote === 1) {
                return "green";
            }
            return "blue";
        };
        var strokeWidth = function (d, i) {
            var note = d.scaleNote;
            if (note.chordNote === undefined) {
                return 2;
            }
            return 5;
        };
        notes
            .data(repeatTo(stateChange.scale2, numberOfFrets), indexer)
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .exit()
            .attr("fill", "none")
            .attr("stroke", "none");
    }
    function allNotesFrom(index, numberOfNotes) {
        var items = [];
        for (var i = 0; i < numberOfNotes; i++) {
            items.push({
                octave: Math.floor((i + 1) / 12),
                index: (i + index) % 12,
                scaleNote: null
            });
        }
        return items;
    }
    function getFretData(numberOfFrets) {
        var data = [];
        for (var i = 0; i < numberOfFrets; i++) {
            data.push(i);
        }
        return data;
    }
    function repeatTo(scale, count) {
        var result = [];
        for (var i = 0; i < count; i++) {
            var note = scale[i % scale.length];
            result.push({
                octave: Math.floor((i + 1) / 8),
                index: note.index,
                scaleNote: note
            });
        }
        return result;
    }
})(gtr || (gtr = {}));
tonics.init();
modes.init();
cof.init();
gtr.init();
state.changeTonic(music.noteBases[0], 0);
//# sourceMappingURL=gtr-cof.js.map