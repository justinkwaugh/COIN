import FactionIDs from './factionIds';
import CardTypes from './cardTypes';

const romans = FactionIDs.ROMANS;
const arverni = FactionIDs.ARVERNI;
const aedui = FactionIDs.AEDUI;
const belgae = FactionIDs.BELGAE;

const EventCardDefinitions = [
    {
        id: 1,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, arverni, aedui, belgae],
        title: 'Cicero'
    },
    {
        id: 2,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, arverni, aedui, belgae],
        title: 'Legiones XIIII et XV'
    },
    {
        id: 3,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, arverni, aedui, belgae],
        title: 'Pompey'
    },
    {
        id: 4,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, arverni, belgae, aedui],
        title: 'Circumvallation'
    },
    {
        id: 5,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, arverni, belgae, aedui],
        title: 'Gallia Togata'
    },
    {
        id: 6,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, arverni, belgae, aedui],
        title: 'Marcus Antonius'
    },
    {
        id: 7,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, aedui, arverni, belgae],
        title: 'Alaudae'
    },
    {
        id: 8,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, aedui, arverni, belgae],
        title: 'Baggage Trains'
    },
    {
        id: 9,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, aedui, arverni, belgae],
        title: 'Mons Cevenna'
    },
    {
        id: 10,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, aedui, belgae, arverni],
        title: 'Ballistae'
    },
    {
        id: 11,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, aedui, belgae, arverni],
        title: 'Numidians'
    },
    {
        id: 12,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, aedui, belgae, arverni],
        title: 'Titus Labienus'
    },
    {
        id: 13,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, belgae, arverni, aedui],
        title: 'Balearic Slingers'
    },
    {
        id: 14,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, belgae, arverni, aedui],
        title: 'Clodius Pulcher'
    },
    {
        id: 15,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, belgae, arverni, aedui],
        title: 'Legio X'
    },
    {
        id: 16,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, belgae, aedui, arverni],
        title: 'Ambacti'
    },
    {
        id: 17,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, belgae, aedui, arverni],
        title: 'Germanic Chieftains'
    },
    {
        id: 18,
        type: CardTypes.EVENT,
        initiativeOrder: [romans, belgae, aedui, arverni],
        title: 'Rhenus Bridge'
    },
    {
        id: 19,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, romans, aedui, belgae],
        title: 'Lucterius'
    },
    {
        id: 20,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, romans, aedui, belgae],
        title: 'Optimates'
    },
    {
        id: 21,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, romans, aedui, belgae],
        title: 'The Province'
    },
    {
        id: 22,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, romans, belgae, aedui],
        title: 'Hostages'
    },
    {
        id: 23,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, romans, belgae, aedui],
        title: 'Sacking'
    },
    {
        id: 24,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, romans, belgae, aedui],
        title: 'Sappers'
    },
    {
        id: 25,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, aedui, romans, belgae],
        title: 'Aquitani'
    },
    {
        id: 26,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, aedui, romans, belgae],
        title: 'Gobannitio'
    },
    {
        id: 27,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, aedui, romans, belgae],
        title: 'Massed Gallic Archers'
    },
    {
        id: 28,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, aedui, belgae, romans],
        title: 'Oppida'
    },
    {
        id: 29,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, aedui, belgae, romans],
        title: 'Suebi Mobilize'
    },
    {
        id: 30,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, aedui, belgae, romans],
        title: 'Vercingetorix\'s Elite'
    },
    {
        id: 31,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, belgae, romans, aedui],
        title: 'Cotuatus & Conconnetodumnus'
    },
    {
        id: 32,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, belgae, romans, aedui],
        title: 'Forced Marches'
    },
    {
        id: 33,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, belgae, romans, aedui],
        title: 'Lost Eagle'
    },
    {
        id: 34,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, belgae, aedui, romans],
        title: 'Acco'
    },
    {
        id: 35,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, belgae, aedui, romans],
        title: 'Gallic Shouts'
    },
    {
        id: 36,
        type: CardTypes.EVENT,
        initiativeOrder: [arverni, belgae, aedui, romans],
        title: 'Morasses'
    },
    {
        id: 37,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, romans, arverni, belgae],
        title: 'Boii'
    },
    {
        id: 38,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, romans, arverni, belgae],
        title: 'Diviciacus'
    },
    {
        id: 39,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, romans, arverni, belgae],
        title: 'River Commerce'
    },
    {
        id: 40,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, romans, belgae, arverni],
        title: 'Alpine Tribes'
    },
    {
        id: 41,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, romans, belgae, arverni],
        title: 'Avaricum'
    },
    {
        id: 42,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, romans, belgae, arverni],
        title: 'Roman Wine'
    },
    {
        id: 43,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, arverni, romans, belgae],
        title: 'Convictolitavis'
    },
    {
        id: 44,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, arverni, romans, belgae],
        title: 'Dumnorix Loyalists'
    },
    {
        id: 45,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, arverni, romans, belgae],
        title: 'Litaviccus'
    },
    {
        id: 46,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, arverni, belgae, romans],
        title: 'Celtic Rites'
    },
    {
        id: 47,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, arverni, belgae, romans],
        title: 'Chieftains\' Council'
    },
    {
        id: 48,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, arverni, belgae, romans],
        title: 'Druids'
    },
    {
        id: 49,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, belgae, romans, arverni],
        title: 'Drought'
    },
    {
        id: 50,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, belgae, romans, arverni],
        title: 'Shifting Loyalties'
    },
    {
        id: 51,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, belgae, romans, arverni],
        title: 'Surus'
    },
    {
        id: 52,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, belgae, arverni, romans],
        title: 'Assembly of Gaul'
    },
    {
        id: 53,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, belgae, arverni, romans],
        title: 'Consuetudine'
    },
    {
        id: 54,
        type: CardTypes.EVENT,
        initiativeOrder: [aedui, belgae, arverni, romans],
        title: 'Joined Ranks'
    },
    {
        id: 55,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, romans, arverni, aedui],
        title: 'Commius'
    },
    {
        id: 56,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, romans, arverni, aedui],
        title: 'Flight of Ambiorix'
    },
    {
        id: 57,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, romans, arverni, aedui],
        title: 'Land of Mist and Mystery'
    },
    {
        id: 58,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, romans, aedui, arverni],
        title: 'Aduatuca'
    },
    {
        id: 59,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, romans, aedui, arverni],
        title: 'Germanic Horse'
    },
    {
        id: 60,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, romans, aedui, arverni],
        title: 'Indutiomarus'
    },
    {
        id: 61,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, arverni, romans, aedui],
        title: 'Catuvolcus'
    },
    {
        id: 62,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, arverni, romans, aedui],
        title: 'War Fleet'
    },
    {
        id: 63,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, arverni, romans, aedui],
        title: 'Winter Campaign'
    },
    {
        id: 64,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, arverni, aedui, romans],
        title: 'Correus'
    },
    {
        id: 65,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, arverni, aedui, romans],
        title: 'German Allegiances'
    },
    {
        id: 66,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, arverni, aedui, romans],
        title: 'Migration'
    },
    {
        id: 67,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, aedui, romans, arverni],
        title: 'Arduenna'
    },
    {
        id: 68,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, aedui, romans, arverni],
        title: 'Remi Influence'
    },
    {
        id: 69,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, aedui, romans, arverni],
        title: 'Segni & Condrusi'
    },
    {
        id: 70,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, aedui, arverni, romans],
        title: 'Camulogenus'
    },
    {
        id: 71,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, aedui, arverni, romans],
        title: 'Colony'
    },
    {
        id: 72,
        type: CardTypes.EVENT,
        initiativeOrder: [belgae, aedui, arverni, romans],
        title: 'Impetuosity'
    }
];

export default EventCardDefinitions;