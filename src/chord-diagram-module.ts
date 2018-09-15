namespace chordDiagram {
  let jtab = (window as any).jtab
  let $ = (window as any).$

  export function init(): void {
    events.scaleChange.subscribe(updateChordDiagrams);
  }

  function updateChordDiagrams(scaleChanged: events.ScaleChangedEvent) {
    // let sortOrder = ['1', '5', 'M2', 'M6', 'M3', 'M7', 'A4'] //, 'm2', 'm6', 'm3', 'm7', '4']
    let sortOrder = ['1', 'M2', 'M3', '4', '5', 'M6' ,'M7']

    console.log(scaleChanged);


    let orderedNodes: music.Node[] = sortOrder.map(intervalName => {
      return scaleChanged.nodes.find(node => node.intervalName === intervalName)!
    })

    let notes = orderedNodes.map((node: music.Node, index: number) => {
      let isMinor = sortOrder[index].substr(0, 1) === 'M' && sortOrder[index] !== 'M7'
      let isAugmented = sortOrder[index].substr(0, 1) === 'A'
      let isDim = sortOrder[index] === 'M7'
      let note = node.scaleNote.note.label.replace('♭', 'b').replace('♯', '#')

      if (isMinor) {
        note += 'm'
      }

      if (isAugmented) {
        note += 'aug'
      }

      if (isDim) {
        note += 'dim'
      }

      return note
    })

    console.log(notes);


    jtab.render($('#tab'), notes.join(' '));
  }
}
