import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import ActionHistory from '../../common/actionHistory';
import TurnHistory from '../../common/turnHistory';
import GameState from '../../common/gameState';
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
import {CapabilityStates} from '../config/capabilities';

class FallingSkyGameState extends GameState {
    constructor() {
        super();

        this.factions = Factions.generateFactions();
        this.factionsById = _.keyBy(this.factions, 'id');
        this.aedui = this.factionsById[FactionIDs.AEDUI];
        this.arverni = this.factionsById[FactionIDs.ARVERNI];
        this.belgae = this.factionsById[FactionIDs.BELGAE];
        this.germanic = this.factionsById[FactionIDs.GERMANIC_TRIBES];
        this.romans = this.factionsById[FactionIDs.ROMANS];


        this.tribes = Tribes.generateTribes();
        this.tribesById = _.keyBy(this.tribes, 'id');

        this.regions = Regions.generateRegions(this.tribesById);
        this.regionsById = _.keyBy(this.regions, 'id');

        this.playersByFaction = {
            [FactionIDs.ARVERNI]: new ArverniBot(),
            [FactionIDs.AEDUI]: new AeduiBot(),
            [FactionIDs.ROMANS]: new RomanBot(),
            [FactionIDs.BELGAE]: new BelgaeBot(),
            [FactionIDs.GERMANIC_TRIBES]: new GermanicBot()
        };

        this.sequenceOfPlay = new SequenceOfPlay(
            {
                factions: [FactionIDs.ROMANS,
                           FactionIDs.ARVERNI,
                           FactionIDs.AEDUI,
                           FactionIDs.BELGAE]
            });

        this.turnHistory = new TurnHistory();
        this.actionHistory = new ActionHistory();
        this.capabilitiesById = ko.observable({});

        this.deck = ko.observableArray();
        this.discard = ko.observableArray();
        this.currentCard = ko.observable();
        this.upcomingCard = ko.observable();
        this.frost = ko.observable();

        this.yearsRemaining = ko.observable();
        this.gameEnded = ko.observable();
        this.victor = ko.observable();
    }

    setDeck(deck) {
        this.deck(deck);
    }

    setYearsRemaining(years) {
        this.yearsRemaining(years);
    }

    cloneGameState(state) {

    }

    serializeGameState(state) {

    }

    loadGameState(state) {

    }

    addCapability(capability) {
        this.capabilitiesById()[capability.id] = capability;
    }

    hasShadedCapability(capabilityId, factionId) {
        const capability = this.capabilitiesById()[capabilityId];
        return capability &&
               capability.state === CapabilityStates.SHADED &&
               (!factionId || capability.factionId === factionId);
    }

    hasUnshadedCapability(capabilityId, factionId) {
        const capability = this.capabilitiesById()[capabilityId];
        return capability &&
               capability.state === CapabilityStates.UNSHADED &&
               (!factionId || capability.factionId === factionId);
    }

    getControlledRegionsForFaction(factionId) {
        return _(this.regions).filter(function(region) {
            return region.isControlledByFaction(factionId);
        }).value();
    }

    logState() {
        _.each(
            this.factions, (faction) => {
                faction.logState(this);
                console.log('');
            });
        _.each(
            this.regions, function (region) {
                region.logState();
            });
        this.sequenceOfPlay.logState();
        console.log('');
        console.log('Deck Remaining: ' + this.deck().length);
        console.log('Discarded: ' + this.discard().length);
        if (this.currentCard()) {
            console.log('Current Card: ');
            console.log('    ' + this.currentCard().toString());
        }
        if (this.upcomingCard()) {
            console.log('Upcoming Card: ');
            console.log('    ' + this.upcomingCard().toString());
        }
    }

}

export default FallingSkyGameState;