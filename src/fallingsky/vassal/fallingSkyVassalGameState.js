import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import ActionHistory from '../../common/actionHistory';
import TurnHistory from '../../common/turnHistory';
import GameState from '../../common/gameState';
import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState';
import Factions from '../config/factions';
import FactionIDs from '../config/factionIds';
import Tribes from '../config/tribes';
import Regions from '../config/regions';
import RegionIDs from '../config/regionIds';
import SequenceOfPlay from '../../common/sequenceOfPlay';
import AeduiBot from '../bots/aedui/aeduiBot';
import ArverniBot from '../bots/arverni/arverniBot';
import RomanBot from '../bots/romanBot';
import BelgaeBot from '../bots/belgae/belgaeBot';
import GermanicBot from '../bots/germanic/germanicBot';
import HumanPlayer from 'fallingsky/player/humanPlayer';
import {CapabilityStates} from '../config/capabilities';

import PlaceWarbands from '../actions/placeWarbands';
import PlaceAlliedTribe from '../actions/placeAlliedTribe';
import PlaceCitadel from '../actions/placeCitadel';
import PlaceLeader from '../actions/placeLeader';
import PlaceAuxilia from '../actions/placeAuxilia';
import PlaceFort from '../actions/placeFort';
import PlaceLegions from '../actions/placeLegions';
import RevealPieces from '../actions/revealPieces';

class FallingSkyVassalGameState extends FallingSkyGameState {
  constructor(json) {
    super();

    // utility variables

    let startIndex;
    let endIndex;
    let pieceName;
    let zone;
    let p;
    let z;

    // define regions

    this.vassalmap = {
      AED: {
        key: "AED",
        name: "Aedui",
        modname: "Celctica (Aedui)",
        ally: 1,
        citadel: 1,
        id: RegionIDs.AEDUI
      },
      ARV: {
        key: "ARV",
        name: "Arverni",
        modname: "Celtica (Arverni, Cadurci, Volcae)",
        ally: 3,
        citadel: 1,
        id: RegionIDs.ARVERNI
      },
      ATR: {
        key: "ATR",
        name: "Atrebates",
        modname: "Belcica (Atrebates, Bellovaci, Remi)",
        ally: 3,
        citadel: 0,
        id: RegionIDs.ATREBATES
      },
      BIT: {
        key: "BIT",
        name: "Bituriges",
        modname: "Celtica (Bituriges)",
        ally: 1,
        citadel: 1,
        id: RegionIDs.BITURIGES
      },
      CAT: {
        key: "CAT",
        name: "Britannia",
        modname: "Britannia",
        ally: 1,
        citadel: 0,
        id: RegionIDs.BRITANNIA
      },
      CAR: {
        key: "CAR",
        name: "Carnutes",
        modname: "Celtica (Aulerci, Carnutes)",
        ally: 2,
        citadel: 1,
        id: RegionIDs.CARNUTES
      },
      HEL: {
        key: "HEL",
        name: "Provincia",
        modname: "Provincia",
        ally: 1,
        citadel: 0,
        id: RegionIDs.PROVINCIA
      },
      MAN: {
        key: "MAN",
        name: "Mandubii",
        modname: "Celtica (Senones, Mandubii, Lingones)",
        ally: 3,
        citadel: 1,
        id: RegionIDs.MANDUBII
      },
      MOR: {
        key: "MOR",
        name: "Morini",
        modname: "Belgica (Morini, Menapii)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.MORINI
      },
      NER: {
        key: "NER",
        name: "Nervii",
        modname: "Belgica (Nervii)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.NERVII
      },
      PIC: {
        key: "PIC",
        name: "Pictones",
        modname: "Celctica (Pictones, Santones)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.PICTONES
      },
      SEQ: {
        key: "SEQ",
        name: "Sequani",
        modname: "Celtica (Sequani, Helvetii)",
        ally: 2,
        citadel: 1,
        id: RegionIDs.SEQUANI
      },
      SUG: {
        key: "SUG",
        name: "Sugambri",
        modname: "Germania (Sugambri, Suebi)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.SUGAMBRI
      },
      TRE: {
        key: "TRE",
        name: "Treveri",
        modname: "Celtica (Treveri)",
        ally: 1,
        citadel: 0,
        id: RegionIDs.TREVERI
      },
      UBI: {
        key: "UBI",
        name: "Ubii",
        modname: "Germania (Ubii, Suebi)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.UBII
      },
      VEN: {
        key: "VEN",
        name: "Veneti",
        modname: "Celtica (Veneti, Namnetes)",
        ally: 2,
        citadel: 0,
        id: RegionIDs.VENETI
      }
    };

    // the current action (state of the state machine)

    this.action = json.action;

    // set human players

    if (!json.npaedui)
      this.playersByFaction[FactionIDs.AEDUI] = new HumanPlayer({factionId: FactionIDs.AEDUI});
    if (!json.npaverni)
      this.playersByFaction[FactionIDs.ARVERNI] = new HumanPlayer({factionId: FactionIDs.ARVERNI});
    if (!json.npbelgic)
      this.playersByFaction[FactionIDs.BELGAE] = new HumanPlayer({factionId: FactionIDs.BELGAE});
    if (!json.nproman)
      this.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer({factionId: FactionIDs.ROMANS});
    
    // resources

    const eligible = [];
    const ineligible = [];
    const passed = [];

    for (z = 0; z < json.zones.length; z++) {
      zone = json.zones[z];
      for (p = 0; p < zone.pieces.length; p++) {
        pieceName = zone.pieces[p].name;

        // Aedui Resources
        if (pieceName.startsWith('Aedui Resources ('))
          this.aedui.resources(parseInt(zone.name));
        // Aedui Eligibility
        if (pieceName.startsWith('Aedui Eligibility')) {
          if (zone.name === 'Eligible Factions')
            eligible.push(FactionIDs.AEDUI);
          else if (zone.name === 'Pass')
            passed.push(FactionIDs.AEDUI);
          else
            ineligible.push(FactionIDs.AEDUI);
        }
        // Arverni Resources
        if (pieceName.startsWith('Averni Resources ('))
          this.arverni.resources(parseInt(zone.name));
        // Arverni Eligibility
        if (pieceName.startsWith('Averni Eligibility')) {
          if (zone.name === 'Eligible Factions')
            eligible.push(FactionIDs.ARVERNI);
          else if (zone.name === 'Pass')
            passed.push(FactionIDs.ARVERNI);
          else
            ineligible.push(FactionIDs.ARVERNI);
        }
        // Belgic Resources
        if (pieceName.startsWith('Belgic Resources ('))
          this.belgae.resources(parseInt(zone.name));
        // Belgic Eligibility
        if (pieceName.startsWith('Belgic Eligibility')) {
          if (zone.name === 'Eligible Factions')
            eligible.push(FactionIDs.BELGAE);
          else if (zone.name === 'Pass')
            passed.push(FactionIDs.BELGAE);
          else
            ineligible.push(FactionIDs.BELGAE);
        }
        // Roman Resources
        if (pieceName.startsWith('Roman Resources ('))
          this.romans.resources(parseInt(zone.name));
        // Roman Eligibility
        if (pieceName.startsWith('Roman Eligibility')) {
          if (zone.name === 'Eligible Factions')
            eligible.push(FactionIDs.ROMANS);
          else if (zone.name === 'Pass')
            passed.push(FactionIDs.ROMANS);
          else
            ineligible.push(FactionIDs.ROMANS);
        }
      }
    }

    this.sequenceOfPlay.eligibleFactions(eligible);
    this.sequenceOfPlay.ineligibleFactions(ineligible);
    this.sequenceOfPlay.passedFactions(passed);

    // go through regions to count pieces

    for (let key in this.vassalmap) {
      let vassalregion = this.vassalmap[key];
      for (z = 0; z < json.zones.length; z++) {
        zone = json.zones[z];
        if (zone.name === vassalregion.modname) {
          // init region
          let region = this.regionsById[vassalregion.id];
          let aedui = {
            warbands: 0,
            revealedwarbands: 0
          };
          
          // special case, citadel of Aedui

          // special case, citadel of Arverni

          for (p = 0; p < zone.pieces.length; p++) {
            let pieceName = zone.pieces[p].name;

            // Aedui Warbands
            if (pieceName === 'Aedui Warband')
              aedui.warbands++;
            if (pieceName === 'Aedui Warband Revealed') {
              aedui.warbands++;
              aedui.revealedwarbands++;
            }
          }

          // apply counts

          if (aedui.warbands > 0) PlaceWarbands.execute(this, { factionId: this.aedui.id, regionId: region.id, count: aedui.warbands});
          if (aedui.revealedwarbands > 0) RevealPieces.execute(this, { factionId: this.aedui.id, regionId: region.id, count: aedui.revealedwarbands});
        }
      }
    }

    // process offboard

    this.numberDiscards = 0;
    this.numberDeck = 0;

    for (p = 0; p < json.offboard.length; p++) {
      pieceName = json.offboard[p].name;

      if (pieceName.indexOf(' Capability **') > -1) {
        // TODO: Capabilities
        // var cardName = pieceName.substring(0, pieceName.indexOf(' **'));
        // var cardNumber = parseInt(pieceName.substring(0, 2));
        // var shadedCapability = pieceName.indexOf('** Shaded ') > -1;
        // var cap = {card: cardName, num: cardNumber, shaded: shadedCapability}; 
        // game.capabilities.push(cap);
        // console.log('Capability: ', cap);
      }

      // number of cards on the discard pile
      if (pieceName.indexOf(' Cards in Discard') > -1) {
        // record the number of cards in the discard pile
        startIndex = pieceName.indexOf('(') + 1;
        endIndex = pieceName.indexOf(' C');
        this.numberDiscards = parseInt(pieceName.substring(startIndex, endIndex));
      }

      // number of cards on the draw deck
      if (pieceName.indexOf(' Cards Remaining in Deck') > -1) {
        // record the number of cards in the discard pile
        startIndex = pieceName.indexOf('(') + 1;
        endIndex = pieceName.indexOf(' C');
        this.numberDeck = parseInt(pieceName.substring(startIndex, endIndex));
      }
    }

    // determine number of cards used (for scenario)
    
    this.totalCards = this.numberDiscards + this.numberDeck; // TODO: plus current + upcoming

    console.log('CARDS = ', this.totalCards);
  }

  toJSON() {
    return "{}";
  }

  // UTILITIES


}

export default FallingSkyVassalGameState;