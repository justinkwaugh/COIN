import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import ActionHistory from '../../common/actionHistory';
import TurnHistory from '../../common/turnHistory';
import GameState from '../../common/gameState';
import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState';
import Factions from '../config/factions';
import FactionIDs from '../config/factionIds';
import Tribes from '../config/tribes';
import TribeIDs from '../config/tribeIds';
import Regions from '../config/regions';
import RegionIDs from '../config/regionIds';
import SequenceOfPlay from '../../common/sequenceOfPlay';
import AeduiBot from '../bots/aedui/aeduiBot';
import ArverniBot from '../bots/arverni/arverniBot';
import RomanBot from '../bots/romans/romanBot';
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

import DisperseTribe from '../actions/disperseTribe';
import SenateApprovalStates from '../config/senateApprovalStates';

import FallingSkyVassal from './fallingSkyVassal';

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

    this.vassal = new FallingSkyVassal();

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
          this.aedui.setResources(parseInt(zone.name));
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
          this.arverni.setResources(parseInt(zone.name));
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
          this.belgae.setResources(parseInt(zone.name));
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
          this.romans.setResources(parseInt(zone.name));
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

    for (let key in this.vassal.regions) {
      let vassalregion = this.vassal.regions[key];

      for (z = 0; z < json.zones.length; z++) {
        zone = json.zones[z];

        // is zone a Region?

        if (zone.name === vassalregion.modname) {
          // init region
          let region = this.regionsById[vassalregion.id];
          let aeduiCount = {
            warbands: 0,
            revealedwarbands: 0
          };
          let arverniCount = {
            warbands: 0,
            revealedwarbands: 0
          };
          let belgaeCount = {
            warbands: 0,
            revealedwarbands: 0
          };
          let germanicCount = {
            warbands: 0,
            revealedwarbands: 0
          };
          let romanCount = {
            auxilia: 0,
            revealedauxilia: 0,
            legion: 0
          };
          
          // special case, citadel of Aedui

          // special case, citadel of Arverni

          for (p = 0; p < zone.pieces.length; p++) {
            let pieceName = zone.pieces[p].name;
            let pieceX = zone.pieces[p].x;
            let pieceY = zone.pieces[p].y;

            // Aedui
            if (pieceName === 'Aedui Warband')
              aeduiCount.warbands++;
            if (pieceName === 'Aedui Warband Revealed') {
              aeduiCount.warbands++;
              aeduiCount.revealedwarbands++;
            }
            if (pieceName === 'Aedui Ally')
              PlaceAlliedTribe.execute(this, {factionId: this.aedui.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)});
  					if (pieceName == 'Aedui Citadel')
              PlaceCitadel.execute(this, {factionId: this.aedui.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)}, false);

            // Arverni
            if (pieceName == 'Vercingetorix' || pieceName == 'Arverni Successor') {
              PlaceLeader.execute(this, { factionId: this.arverni.id, regionId: region.id});
              if (pieceName == 'Arverni Successor') {
                const arverniLeader = region.getLeaderForFaction(this.arverni.id);
                arverniLeader.isSuccessor(true);
              }
            }
            if (pieceName === 'Arverni Warband')
              arverniCount.warbands++;
            if (pieceName === 'Arverni Warband Revealed') {
              arverniCount.warbands++;
              arverniCount.revealedwarbands++;
            }
            if (pieceName === 'Arverni Ally')
              PlaceAlliedTribe.execute(this, {factionId: this.arverni.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)});
  					if (pieceName == 'Averni Citadel')
              PlaceCitadel.execute(this, {factionId: this.arverni.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)}, false);

            // Belgae
            if (pieceName == 'Ambiorix' || pieceName == 'Belgic Successor') {
              PlaceLeader.execute(this, { factionId: this.belgae.id, regionId: region.id});
              if (pieceName == 'Belgic Successor') {
                const belgicLeader = region.getLeaderForFaction(this.belgae.id);
                belgicLeader.isSuccessor(true);
              }
            }
            if (pieceName === 'Belgic Warband')
              belgaeCount.warbands++;
            if (pieceName === 'Belgic Warband Revealed') {
              belgaeCount.warbands++;
              belgaeCount.revealedwarbands++;
            }
            if (pieceName === 'Belgic Ally')
              PlaceAlliedTribe.execute(this, {factionId: this.belgae.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)});
  					if (pieceName == 'Belgic Citadel')
              PlaceCitadel.execute(this, {factionId: this.belgae.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)}, false);

            // Germanic
            if (pieceName === 'Germanic Warband')
              germanicCount.warbands++;
            if (pieceName === 'Germanic Warband Revealed') {
              germanicCount.warbands++;
              germanicCount.revealedwarbands++;
            }
            if (pieceName === 'Germanic Ally')
              PlaceAlliedTribe.execute(this, {factionId: this.germanic.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)});

            // Roman
            if (pieceName == 'Caesar' || pieceName == 'Roman Successor') {
              PlaceLeader.execute(this, { factionId: this.romans.id, regionId: region.id});
              if (pieceName == 'Roman Successor') {
                const romanLeader = region.getLeaderForFaction(this.romans.id);
                romanLeader.isSuccessor(true);
              }
            }
            if (pieceName === 'Roman Auxilia')
              romanCount.auxilia++;
            if (pieceName === 'Roman Auxilia Revealed') {
              romanCount.auxilia++;
              romanCount.revealedauxilia++;
            }
            if (pieceName === 'Roman Legion')
              romanCount.legion++;
            if (pieceName === 'Roman Ally')
              PlaceAlliedTribe.execute(this, {factionId: this.romans.id, regionId: region.id, tribeId: this.vassal.tribeId(pieceX, pieceY)});
  					if (pieceName == 'Roman Fort')
              PlaceFort.execute(this, {factionId: this.romans.id, regionId: region.id});

            // TODO: dispersed tribe
            // TODO: gathering tribe
            // TODO: devastated
            // TODO: Colony added
          }

          // apply counts

          if (aeduiCount.warbands > 0) PlaceWarbands.execute(this, {factionId: this.aedui.id, regionId: region.id, count: aeduiCount.warbands});
          if (aeduiCount.revealedwarbands > 0) RevealPieces.execute(this, {factionId: this.aedui.id, regionId: region.id, count: aeduiCount.revealedwarbands});
          if (arverniCount.warbands > 0) PlaceWarbands.execute(this, {factionId: this.arverni.id, regionId: region.id, count: arverniCount.warbands});
          if (arverniCount.revealedwarbands > 0) RevealPieces.execute(this, {factionId: this.arverni.id, regionId: region.id, count: arverniCount.revealedwarbands});
          if (belgaeCount.warbands > 0) PlaceWarbands.execute(this, {factionId: this.belgae.id, regionId: region.id, count: belgaeCount.warbands});
          if (belgaeCount.revealedwarbands > 0) RevealPieces.execute(this, {factionId: this.belgae.id, regionId: region.id, count: belgaeCount.revealedwarbands});
          if (germanicCount.warbands > 0) PlaceWarbands.execute(this, {factionId: this.germanic.id, regionId: region.id, count: germanicCount.warbands});
          if (germanicCount.revealedwarbands > 0) RevealPieces.execute(this, {factionId: this.germanic.id, regionId: region.id, count: germanicCount.revealedwarbands});

          if (romanCount.auxilia > 0) PlaceAuxilia.execute(this, {factionId: this.romans.id, regionId: region.id, count: romanCount.auxilia});
          if (romanCount.revealedauxilia > 0) RevealPieces.execute(this, {factionId: this.romans.id, regionId: region.id, count: romanCount.revealedauxilia});
          if (romanCount.legion > 0) PlaceLegions.execute(this, {factionId: this.romans.id, regionId: region.id, count: romanCount.legion});
        }
      }
    }

    // process other zones

    let romanLegionsTrack = 0;
    let romanLegionsFallen = 0;
    for (z = 0; z < json.zones.length; z++) {
        zone = json.zones[z];
        console.log('OTHER ZONE: ' + zone.name);

        for (p = 0; p < zone.pieces.length; p++) {
          let pieceName = zone.pieces[p].name;

          if (zone.name == 'Upcoming') {
            // TODO: upcoming card
            // game.upcomingcard = {name: pieceName, num: parseInt(pieceName.substring(0, 2))};
            // if (game.upcomingcard.name.endsWith(' - Winter'))
            //   game.frost = true;
          }

          if (zone.name == 'Current') {
            // TODO: current card
            // game.currentcard = {name: pieceName, num: parseInt(pieceName.substring(0, 2))};
            // if (game.currentcard.name.endsWith(' - Winter'))
            //   game.winter = true;
          }

          if (zone.name == 'Senate - Uproar')
            if (pieceName == 'Roman Senate') {
              console.log('UPROAR');
              this.romans.setSenateApproval(SenateApprovalStates.UPROAR);
            }
          if (zone.name == 'Senate - Intrigue')
            if (pieceName == 'Roman Senate')
              this.romans.setSenateApproval(SenateApprovalStates.INTRIGUE);
          if (zone.name == 'Senate - Adulation')
            if (pieceName == 'Roman Senate')
              this.romans.setSenateApproval(SenateApprovalStates.ADULATION);
          if (zone.name == 'Legions')
            if (pieceName == 'Roman Legion')
              romanLegionsTrack++;
          if (zone.name == 'Fallen Legions')
            if (pieceName == 'Roman Legion')
              romanLegionsFallen++;
        }
    }
    console.log('legion track: ' + romanLegionsTrack);
    if (romanLegionsTrack > 0)
      this.romans.initializeLegionTrack(SenateApprovalStates.ADULATION, romanLegionsTrack > 4 ? 4 : romanLegionsTrack);
    romanLegionsTrack -= 4;
    if (romanLegionsTrack > 0)
      this.romans.initializeLegionTrack(SenateApprovalStates.INTRIGUE, romanLegionsTrack > 4 ? 4 : romanLegionsTrack);
    romanLegionsTrack -= 4;
    if (romanLegionsTrack > 0)
      this.romans.initializeLegionTrack(SenateApprovalStates.UPROAR, romanLegionsTrack);
    
    console.log('fallen: ' + romanLegionsFallen);
    this.romans.returnLegions(this.romans.availableLegions().splice(0, romanLegionsFallen));

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