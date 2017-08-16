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
import RomanBot from '../bots/romans/romanBot';
import BelgaeBot from '../bots/belgae/belgaeBot';
import GermanicBot from '../bots/germanic/germanicBot';
import {CapabilityStates, CapabilityTitles} from '../config/capabilities';
import FallingSkyPieces from '../pieces/fallingSkyPieces';
import Card from '../../common/card';
import FallingSkyInteractions from '../interactions/fallingSkyInteractions';

class FallingSkyGameState extends GameState {
    constructor() {
        super();

        FallingSkyPieces.registerWithFactory();
        FallingSkyInteractions.registerWithFactory();

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

        this.sequenceOfPlay = new SequenceOfPlay(this,
            {
                factions: [FactionIDs.ROMANS,
                           FactionIDs.ARVERNI,
                           FactionIDs.AEDUI,
                           FactionIDs.BELGAE]
            });

        this.turnHistory = new TurnHistory(this);
        this.actionHistory = new ActionHistory(this);
        this.capabilities = ko.observableArray([]);
        this.capabilitiesById = ko.pureComputed(()=> {
            return _.keyBy(this.capabilities(), 'id');
        });

        this.deck = ko.observableArray();
        this.discard = ko.observableArray();
        this.currentCard = ko.observable();
        this.upcomingCard = ko.observable();
        this.frost = ko.observable();

        this.year = ko.observable(0);
        this.yearsRemaining = ko.observable();
        this.gameEnded = ko.observable();
        this.victor = ko.observable();

        this.isLastYear = ko.pureComputed(() => {
            return this.yearsRemaining() === 0;
        });
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            factions: this.factions,
            regions: this.regions,
            playersByFaction: this.playersByFaction,
            sequenceOfPlay: this.sequenceOfPlay,
            turnHistory: this.turnHistory,
            actionHistory: this.actionHistory,
            capabilities: this.capabilities(),
            deck: this.deck(),
            discard: this.discard(),
            currentCard: this.currentCard(),
            upcomingCard: this.upcomingCard(),
            frost: this.frost(),
            year: this.year(),
            yearsRemaining: this.yearsRemaining,
            gameEnded: this.gameEnded(),
            victor: this.victor()
        });
    }
    
    // USAGE: let gamestate = new FallingSkyGameState().loadGameState(JSON.parse(jsonstring));
    loadGameState(json) {
        const self = this;

        super.loadGameState(json);

        json.factions.forEach(function(value) {
            self.factions.forEach(function(faction) {
                if (faction.id == value.id)
                    faction.loadGameState(value);
            });
        });

        json.regions.forEach(function(value) {
            self.regions.forEach(function(region) {
                if (region.id == value.id)
                    region.loadGameState(value);
            });
        });

        Object.entries(json.playersByFaction).forEach(([key, value]) => {
            Object.entries(self.playersByFaction).forEach(([playerid, player]) => {
                if (playerid == key)
                    player.loadGameState(value);
            });
        });

        self.sequenceOfPlay.loadGameState(json.sequenceOfPlay);
        self.turnHistory.loadGameState(json.turnHistory);
        self.actionHistory.loadGameState(json.actionHistory);
        self.capabilities(json.capabilities);

        json.deck.forEach((value) => {
            self.deck.push(new Card(value));
        });
        json.discard.forEach((value) => {
            self.discard.push(new Card(value));
        });

        if (!json.currentCard || json.currentCard === null)
            self.currentCard(null);
        else
            self.currentCard(new Card(json.currentCard));

        if (!json.upcomingCard || json.upcomingCard === null)
            self.upcomingCard(null);
        else
            self.upcomingCard(new Card(json.upcomingCard));

        self.frost(json.frost);

        self.year(json.year);
        self.yearsRemaining(json.yearsRemaining);
        self.gameEnded(json.gameEnded);
        self.victor(json.victor);
    }
    
    // USAGE: let clonestate = gamestate.cloneGameState();
    cloneGameState(clonestate = null) {
      if (clonestate === null)
        clonestate = new FallingSkyGameState();
      clonestate = super.cloneGameState(clonestate);
      // TODO: clone _this_ into clonestate; perhaps use serialize and deserialize to perform the clone?
      return clonestate;
    }

    setDeck(deck) {
        this.deck(deck);
    }

    setYearsRemaining(years) {
        this.yearsRemaining(years);
    }

    startYear() {
        this.year(this.year+1);
        this.yearsRemaining(this.yearsRemaining() - 1);
    }

    undoYear() {
        this.yearsRemaining(this.yearsRemaining() + 1);
        this.year(this.year-1);
    }

    addCapability(capability) {
        this.capabilities.push(capability);
    }

    removeCapability(capabilityId) {
        this.capabilities.remove( function(item) { return item.id === capabilityId; });
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
            console.log('    ' + this.currentCard().id + ' - ' + this.currentCard().title);
        }
        if (this.upcomingCard()) {
            console.log('Upcoming Card: ');
            console.log('    ' + this.upcomingCard().id + ' - ' + this.upcomingCard().title);
        }
        if (this.capabilities().length > 0) {
            console.log('Capabilities: ');
            _.each(
                this.capabilities(), (cap, index, col) => {
                    console.log('    #' + cap.id + ' - ' + CapabilityTitles[cap.id], '[' + cap.state + ']', '(' + cap.factionId + ')');
                });
        }
    }

}

export default FallingSkyGameState;