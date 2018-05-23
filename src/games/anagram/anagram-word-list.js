/* Taken from http://www.manythings.org/anagrams/anagrams16.html */

const sevenLetters = [
  {
    packers: 'repacks'
  },
  {
    repacks: 'packers'
  },
  {
    printer: 'reprint'
  },
  {
    reprint: 'printer'
  },
  {
    sellers: 'resells'
  },
  {
    resells: 'sellers'
  },
  {
    reverse: 'reserve'
  },
  {
    reserve: 'reverse'
  },
  {
    slipper: 'ripples'
  },
  {
    ripples: 'slipper'
  },
  {
    lasting: 'salting'
  },
  {
    salting: 'lasting'
  },
  {
    notices: 'section'
  },
  {
    section: 'notices'
  },
  {
    treason: 'senator'
  },
  {
    senator: 'treason'
  },
  {
    unseals: 'sensual'
  },
  {
    sensual: 'unseals'
  },
  {
    gunshot: 'shotgun'
  },
  {
    shotgun: 'gunshot'
  },
  {
    license: 'silence'
  },
  {
    silence: 'license'
  },
  {
    listing: 'silting'
  },
  {
    silting: 'listing'
  },
  {
    slivers: 'silvers'
  },
  {
    silvers: 'slivers'
  },
  {
    resists: 'sisters'
  },
  {
    sisters: 'resists'
  },
  {
    trainer: 'terrain'
  },
  {
    terrain: 'trainer'
  },
  {
    kitchen: 'thicken'
  },
  {
    thicken: 'kitchen'
  },
  {
    rethink: 'thinker'
  },
  {
    thinker: 'rethink'
  },
  {
    senator: 'treason'
  },
  {
    treason: 'senator'
  },
  {
    reviews: 'viewers'
  },
  {
    viewers: 'reviews'
  },
  {
    wordier: 'worried'
  },
  {
    worried: 'wordier'
  },
  {
    weather: 'wreathe'
  },
  {
    wreathe: 'weather'
  }
];

const eightLetters = [
  {
    teaching: 'cheating'
  },
  {
    cheating: 'teaching'
  },
  {
    backward: 'drawback'
  },
  {
    drawback: 'backward'
  },
  {
    'cheaters; teachers': 'hectares'
  },
  {
    hectares: 'cheaters; teachers'
  },
  {
    misprint: 'imprints'
  },
  {
    imprints: 'misprint'
  },
  {
    needless: 'lessened'
  },
  {
    lessened: 'needless'
  },
  {
    enlisted: 'listened'
  },
  {
    listened: 'enlisted'
  },
  {
    outlooks: 'lookouts'
  },
  {
    lookouts: 'outlooks'
  },
  {
    charming: 'marching'
  },
  {
    marching: 'charming'
  },
  {
    ultimate: 'mutilate'
  },
  {
    mutilate: 'ultimate'
  },
  {
    salesmen: 'nameless'
  },
  {
    nameless: 'salesmen'
  },
  {
    hangover: 'overhang'
  },
  {
    overhang: 'hangover'
  },
  {
    proteins: 'pointers'
  },
  {
    pointers: 'proteins'
  },
  {
    articles: 'recitals'
  },
  {
    recitals: 'articles'
  },
  {
    infringe: 'refining'
  },
  {
    refining: 'infringe'
  },
  {
    oriental: 'relation'
  },
  {
    relation: 'oriental'
  },
  {
    reversed: 'reserved'
  },
  {
    reserved: 'reversed'
  },
  {
    reserved: 'reversed'
  },
  {
    reversed: 'reserved'
  },
  {
    organist: 'roasting'
  },
  {
    roasting: 'organist'
  },
  {
    licensed: 'silenced'
  },
  {
    silenced: 'licensed'
  },
  {
    genitals: 'stealing'
  },
  {
    stealing: 'genitals'
  },
  {
    hustling: 'sunlight'
  },
  {
    sunlight: 'hustling'
  },
  {
    cheating: 'teaching'
  },
  {
    teaching: 'cheating'
  },
  {
    kitchens: 'thickens'
  },
  {
    thickens: 'kitchens'
  },
  {
    noteless: 'toneless'
  },
  {
    toneless: 'noteless'
  },
  {
    weathers: 'wreathes'
  },
  {
    wreathes: 'weathers'
  }
];

module.exports = [...sevenLetters, ...eightLetters];
