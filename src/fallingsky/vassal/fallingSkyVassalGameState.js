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
import SequenceOfPlay from '../../common/sequenceOfPlay';
import AeduiBot from '../bots/aedui/aeduiBot';
import ArverniBot from '../bots/arverni/arverniBot';
import RomanBot from '../bots/romanBot';
import BelgaeBot from '../bots/belgae/belgaeBot';
import GermanicBot from '../bots/germanic/germanicBot';
import HumanPlayer from 'fallingsky/player/humanPlayer';
import {CapabilityStates} from '../config/capabilities';

class FallingSkyVassalGameState extends FallingSkyGameState {
  constructor(json) {
    super();

    // utility variables
    var startIndex;
    var endIndex;
    var pieceName;
    var zone;
    var p;
    var z;

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

    var eligible = [];
    var ineligible = [];
    var passed = [];

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