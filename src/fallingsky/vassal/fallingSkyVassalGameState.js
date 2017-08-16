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
import {CapabilityIDs} from '../config/capabilities';
import Card from '../../common/card';
import EventCardDefinitions from '../config/eventCards';
import CardTypes from '../config/cardTypes';

import PlaceWarbands from '../actions/placeWarbands';
import PlaceAlliedTribe from '../actions/placeAlliedTribe';
import PlaceCitadel from '../actions/placeCitadel';
import PlaceLeader from '../actions/placeLeader';
import PlaceAuxilia from '../actions/placeAuxilia';
import PlaceFort from '../actions/placeFort';
import PlaceLegions from '../actions/placeLegions';
import RevealPieces from '../actions/revealPieces';
import AddCapability from '../actions/addCapability';

import DisperseTribe from '../actions/disperseTribe';
import UndisperseTribe from '../actions/undisperseTribe';
import { SenateApprovalStates, SenateApprovalStateNames } from '../config/senateApprovalStates';
import ArverniDevastate from '../bots/arverni/arverniDevastate';
import Devastate from '../commands/arverni/devastate';

import FallingSkyVassal from './fallingSkyVassal';
import * as fs from 'fs';
import * as tempy from 'tempy';

class FallingSkyVassalGameState extends FallingSkyGameState {
  constructor() {
    super();

    this.vassal = new FallingSkyVassal();
    this.action = '';
    this.numberDiscards = 0;
    this.numberDeck = 0;
    this.numberDiscardedWinter = 0;
    this.totalCards = 0;
    this.totalWinters = 0;

    this.lastTurn = ko.observable();
  }

  loadVassalGameData(json) {
    // utility variables

    let startIndex;
    let endIndex;
    let pieceName;
    let zone;
    let p;
    let z;

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
          else if (zone.name.startsWith('1st Faction')) {
            this.sequenceOfPlay.firstFaction(FactionIDs.AEDUI);
            this.sequenceOfPlay.firstActionChosen(zone.name.substring(12));
          } else if (zone.name.startsWith('2nd Faction')) {
            this.sequenceOfPlay.secondFaction(FactionIDs.AEDUI);
            this.sequenceOfPlay.secondActionChosen(zone.name.substring(12));
          } else
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
          else if (zone.name.startsWith('1st Faction')) {
            this.sequenceOfPlay.firstFaction(FactionIDs.ARVERNI);
            this.sequenceOfPlay.firstActionChosen(zone.name.substring(12));
          } else if (zone.name.startsWith('2nd Faction')) {
            this.sequenceOfPlay.secondFaction(FactionIDs.ARVERNI);
            this.sequenceOfPlay.secondActionChosen(zone.name.substring(12));
          } else
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
          else if (zone.name.startsWith('1st Faction')) {
            this.sequenceOfPlay.firstFaction(FactionIDs.BELGAE);
            this.sequenceOfPlay.firstActionChosen(zone.name.substring(12));
          } else if (zone.name.startsWith('2nd Faction')) {
            this.sequenceOfPlay.secondFaction(FactionIDs.BELGAE);
            this.sequenceOfPlay.secondActionChosen(zone.name.substring(12));
          } else
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
          else if (zone.name.startsWith('1st Faction')) {
            this.sequenceOfPlay.firstFaction(FactionIDs.ROMANS);
            this.sequenceOfPlay.firstActionChosen(zone.name.substring(12));
          } else if (zone.name.startsWith('2nd Faction')) {
            this.sequenceOfPlay.secondFaction(FactionIDs.ROMANS);
            this.sequenceOfPlay.secondActionChosen(zone.name.substring(12));
          } else
            ineligible.push(FactionIDs.ROMANS);
        }
      }
    }

    this.sequenceOfPlay.eligibleFactions(eligible);
    this.sequenceOfPlay.ineligibleFactions(ineligible);
    this.sequenceOfPlay.passedFactions(passed);

    // look for colony added

    for (let key in this.vassal.regions) {
      let vassalregion = this.vassal.regions[key];
      for (z = 0; z < json.zones.length; z++) {
        zone = json.zones[z];
        if (zone.name === vassalregion.modname)
          for (p = 0; p < zone.pieces.length; p++)
            if (zone.pieces[p].name == 'Colony Added')
              this.regionsById[this.regionsById[vassalregion.id].id].addColony(this.tribesById[TribeIDs.COLONY]);
      }
    }

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
          
          // look through pieces

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
              PlaceAlliedTribe.execute(this, {factionId: this.aedui.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)});
  					if (pieceName == 'Aedui Citadel')
              PlaceCitadel.execute(this, {factionId: this.aedui.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)}, false);

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
              PlaceAlliedTribe.execute(this, {factionId: this.arverni.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)});
  					if (pieceName == 'Averni Citadel')
              PlaceCitadel.execute(this, {factionId: this.arverni.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)}, false);

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
              PlaceAlliedTribe.execute(this, {factionId: this.belgae.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)});
  					if (pieceName == 'Belgic Citadel')
              PlaceCitadel.execute(this, {factionId: this.belgae.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)}, false);

            // Germanic
            if (pieceName === 'Germanic Warband')
              germanicCount.warbands++;
            if (pieceName === 'Germanic Warband Revealed') {
              germanicCount.warbands++;
              germanicCount.revealedwarbands++;
            }
            if (pieceName === 'Germanic Ally')
              PlaceAlliedTribe.execute(this, {factionId: this.germanic.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)});

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
              PlaceAlliedTribe.execute(this, {factionId: this.romans.id, regionId: region.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)});
  					if (pieceName == 'Roman Fort')
              PlaceFort.execute(this, {factionId: this.romans.id, regionId: region.id});

            // NOTE: in VASSAL Dispersed and Gathering are reversed in error
            if (pieceName.endsWith(' (Dispersed)') || pieceName.endsWith(' (Gathering)')) {
              DisperseTribe.execute(this, {factionId: this.romans.id, tribeId : this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)});
              if (pieceName.endsWith(' (Dispersed)'))
                UndisperseTribe.execute(this, {factionId: this.romans.id, tribeId: this.vassal.tribeId(this, pieceName, region.id, pieceX, pieceY)});
            }

            // count Devastated
            if (pieceName == 'Devastated')
              region.devastated(true);
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

        for (p = 0; p < zone.pieces.length; p++) {
          let pieceName = zone.pieces[p].name;

          if (zone.name == 'Upcoming') {
            let nextcard = {name: pieceName, num: parseInt(pieceName.substring(0, 2))};
            if (nextcard.name.endsWith(' - Winter')) {
              this.frost(true);
              this.upcomingCard(new Card(
                    {
                        id: 'winter',
                        type: CardTypes.WINTER,
                        title: 'Winter'
                    }));
            } else {
              this.upcomingCard(EventCardDefinitions[nextcard.num - 1]);
            }
          }

          if (zone.name == 'Current') {
            let thiscard = {name: pieceName, num: parseInt(pieceName.substring(0, 2))};
            if (thiscard.name.endsWith(' - Winter')) {
              this.frost(true);
              this.upcomingCard(new Card(
                    {
                        id: 'winter',
                        type: CardTypes.WINTER,
                        title: 'Winter'
                    }));
            } else {
              this.currentCard(EventCardDefinitions[thiscard.num - 1]);
            }
          }

          if (zone.name == 'Senate - Uproar')
            if (pieceName == 'Roman Senate') {
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
    
    if (romanLegionsTrack > 0)
      this.romans.initializeLegionTrack(SenateApprovalStates.ADULATION, romanLegionsTrack > 4 ? 4 : romanLegionsTrack);
    romanLegionsTrack -= 4;
    if (romanLegionsTrack > 0)
      this.romans.initializeLegionTrack(SenateApprovalStates.INTRIGUE, romanLegionsTrack > 4 ? 4 : romanLegionsTrack);
    romanLegionsTrack -= 4;
    if (romanLegionsTrack > 0)
      this.romans.initializeLegionTrack(SenateApprovalStates.UPROAR, romanLegionsTrack);
    
    this.romans.returnLegions(this.romans.availableLegions().splice(0, romanLegionsFallen));

    // process offboard

    this.numberDiscards = 0;
    this.numberDeck = 0;
    this.numberDiscardedWinter = 0;

    for (p = 0; p < json.offboard.length; p++) {
      pieceName = json.offboard[p].name;

      if (pieceName.indexOf(' Capability ') > -1) {
        let cardName = pieceName.substring(0, pieceName.indexOf(' **'));
        let cardNumber = parseInt(pieceName.substring(0, 2));
        let shadedCapability = pieceName.indexOf('** Shaded ') > -1;
        let factionName = pieceName.substring(pieceName.indexOf('(') + 1, pieceName.indexOf(')'));
        
        let factionId = '';
        if (factionName === 'Roman')
          factionId = FactionIDs.ROMANS;
        if (factionName === 'Arverni')
          factionId = FactionIDs.ARVERNI;
        if (factionName === 'Aedui')
          factionId = FactionIDs.AEDUI;
        if (factionName === 'Belgic')
          factionId = FactionIDs.BELGAE;
        
        AddCapability.execute(this,
          {
            id: cardNumber,
            state: shadedCapability ? CapabilityStates.SHADED : CapabilityStates.UNSHADED,
            factionId: factionId
          });
      }

      // number of cards on the discard pile
      if (pieceName.indexOf(' Cards in Discard') > -1) {
        // record the number of cards in the discard pile
        startIndex = pieceName.indexOf('(') + 1;
        endIndex = pieceName.indexOf(' C');
        this.numberDiscards = parseInt(pieceName.substring(startIndex, endIndex));

        for (let d = 0; d < this.numberDiscards; d++)
          this.discard().push(new Card({
              id: 1,
              type: CardTypes.EVENT,
              initiativeOrder: [FactionIDs.ROMANS, FactionIDs.ARVERNI, FactionIDs.AEDUI, FactionIDs.BELGAE],
              title: 'Cicero'
          }));
      }

      // number of cards on the draw deck
      if (pieceName.indexOf(' Cards Remaining in Deck') > -1) {
        // record the number of cards in the discard pile
        startIndex = pieceName.indexOf('(') + 1;
        endIndex = pieceName.indexOf(' C');
        this.numberDeck = parseInt(pieceName.substring(startIndex, endIndex));

        for (let d = 0; d < this.numberDeck; d++)
          this.deck().push(new Card({
              id: 1,
              type: CardTypes.EVENT,
              initiativeOrder: [FactionIDs.ROMANS, FactionIDs.ARVERNI, FactionIDs.AEDUI, FactionIDs.BELGAE],
              title: 'Cicero'
          }));
      }

      // winter on discard
      if (pieceName.endsWith(' - Winter')) {
        this.numberDiscardedWinter++;
      }
    }

    // determine number of cards used (for scenario)
    
    this.totalCards = this.numberDiscards + this.numberDeck;
    if (this.upcomingCard()) this.totalCards++;
    if (this.currentCard()) this.totalCards++;
    this.totalCards += this.capabilities().length;

    if (this.totalCards == 48) {
      // The Great Revolt
      this.totalWinters = 3;
    } else if (this.totalCards == 64) {
      // Reconquest of Gaul
      this.totalWinters = 4;
    } else if (this.totalCards == 75) {
      // Pax Gallica
      this.totalWinters = 5;
    }

    this.setYearsRemaining(this.totalWinters - this.numberDiscardedWinter - 1);
  }

  toJSON() {
    return Object.assign(super.toJSON(), {
      action: this.action,
      numberDiscards: this.numberDiscards,
      numberDeck: this.numberDeck,
      numberDiscardedWinter: this.numberDiscardedWinter,
      totalCards: this.totalCards,
      totalWinters: this.totalWinters
    });
  }
  
  // USAGE: let gamestate = new FallingSkyVassalGameState().loadGameState(JSON.parse(jsonstring));
  loadGameState(json) {
    super.loadGameState(json);
    
    this.action = json.action;
    this.numberDiscards = json.numberDiscards;
    this.numberDeck = json.numberDeck;
    this.numberDiscardedWinter = json.numberDiscardedWinter;
    this.totalCards = json.totalCards;
    this.totalWinters = json.totalWinters;
  }
  
  // USAGE: let clonestate = gamestate.cloneGameState();
  cloneGameState(clonestate = null) {
    if (clonestate === null)
      clonestate = new FallingSkyVassalGameState();
    clonestate = super.cloneGameState(clonestate);
    // TODO: clone _this_ into clonestate
    return clonestate;
  }

  logState() {
    super.logState();
    //console.log('VASSAL:', this.action);
  }

  processPlayerInteractionNeeded(err) {
    console.log('* PlayerInteractionRequested');
    console.log(err);

    // save game state

    const savedgamestate = this.serializeGameState(this);
    
    const savefile = tempy.file({extension: 'json'});
    fs.writeFileSync(savefile, savedgamestate);
    console.log('M*DEBUG: Game state saved to ', savefile);

    //Events.emit('PlayerInteractionRequested', err.interaction);
    //game.resumeTurn(interaction);

    const interaction = err.interaction;
    if (interaction.type == 'SupplyLineAgreement') {
      console.log('Q*' + JSON.stringify({
        'type': 'agreerefuse',
        'q': 'SupplyLineAgreement',
        'requestingFactionId': interaction.requestingFactionId,
        'respondingFactionId': interaction.respondingFactionId,
        'category': 'Supply Line',
        'question': interaction.requestingFactionId + ' is requesting permission for Supply Line from ' + interaction.respondingFactionId,
        'interaction': JSON.stringify(interaction),
        'datafile': savefile
      }));
    } else if (interaction.type == 'RetreatDeclaration') {
      // TODO: to implement interaction
      console.log(interaction);
      console.log('Q*' + JSON.stringify({
        'type': 'agreerefuse',
        'q': 'RetreatDeclaration',
        'requestingFactionId': interaction.requestingFactionId,
        'respondingFactionId': interaction.respondingFactionId,
        'category': 'Retreat Permission',
        'question': interaction.requestingFactionId + ' is requesting permission to Retreat from ' + interaction.respondingFactionId,
        'interaction': JSON.stringify(interaction),
        'datafile': savefile
      }));
    } else {
      console.log('M*ERROR: Unknown PlayerInteraction type, not implemented');
    }

    // TODO: need to save gamestate
    // TODO: need a way to resume gamestate and input response
  }

  printLastTurnInstructions() {
    const instructions = this.turnHistory.lastTurn().getInstructions(this);
    instructions.forEach(function(element) {
      const types = {'command': 'COMMAND', 'sa': 'SPECIAL ABILITY', 'event': 'EVENT', 'action': '--> DO'};
      let prefix = ' ';
      if (element.type != 'action') {
        console.log('M=');
        prefix = '*';
      }
      console.log('M' + prefix + types[element.type] + ': ' + element.instruction);
    }, this);
    console.log('M=');

    let factions = _.join(this.sequenceOfPlay.eligibleFactions());
    if (factions.length > 0) console.log('M Eligible Factions: ' + factions);
    factions = _.join(this.sequenceOfPlay.passedFactions());
    if (factions.length > 0) console.log('M Passed Factions: ' + factions);
    factions = _.join(this.sequenceOfPlay.ineligibleFactions());
    if (factions.length > 0) console.log('M Ineligible Factions: ' + factions);
    if (this.sequenceOfPlay.firstFaction()) {
      console.log('M First Faction:  ' + this.sequenceOfPlay.firstFaction() + ' (' + this.sequenceOfPlay.firstActionChosen() + ')');
    }
    if (this.sequenceOfPlay.secondFaction()) {
      console.log('M Second Faction:  ' + this.sequenceOfPlay.secondFaction() + ' (' + this.sequenceOfPlay.secondActionChosen() + ')');
    }
  }

  playTurn() {
    console.log('M=');
    
    if (this.currentCard().type === 'winter') {
      console.log('M*Conduct Winter Round');
      Winter.executeWinter(this);

      //this.lastTurn(this.state().turnHistory.lastTurn());
      //this.state().startYear();
      //this.drawCard();
      return;
    }

    const nextFaction = this.sequenceOfPlay.nextFaction(this.currentCard());
    const player = this.playersByFaction[nextFaction];

    console.log('*** PLAYER');

    if (player === undefined) {
      console.log('M*There is no eligible faction to play.');
      console.log('M=');
      return;
    }

    console.log('M*Next Faction to Play: ' + nextFaction);

    console.log(player);
    if (player.isNonPlayer !== true) {
      console.log('M*The next faction to play is a human player.');
      console.log('M=');
      return;
    }

    this.turnHistory.startTurn(nextFaction);
    try {
      player.takeTurn(this, this.turnHistory.currentTurn);
      this.lastTurn(this.turnHistory.lastTurn());
      this.printLastTurnInstructions();
    } catch(err) {
      if (err.name === 'PlayerInteractionNeededError') {
        this.processPlayerInteractionNeeded(err);
      }
      else {
        throw err;
      }
    }
  }

  resumeTurn(interaction) {
    const nextFaction = this.sequenceOfPlay.nextFaction(this.currentCard());
    const player = this.playersByFaction[nextFaction];
    try {
      this.turnHistory.getCurrentTurn().addInteraction(interaction);
      player.resume(this);
      this.lastTurn(this.turnHistory.lastTurn());
      this.printLastTurnInstructions();
    }
    catch (err) {
      if (err.name === 'PlayerInteractionNeededError') {
          this.processPlayerInteractionNeeded(err);
      }
      else {
          throw err;
      }
    }
  }

}

export default FallingSkyVassalGameState;