
import ko from '../lib/knockout';
import _ from '../lib/lodash';
import FactionIDs from '../fallingsky/config/factionIds';
import FallingSkyGameState from '../fallingsky/state/fallingSkyGameState.js';
import Winter from './phases/winter';

const ActivePanelIDs = {
    BOARD: 'board',
    REGIONS: 'regions',
    FACTIONS: 'factions',
    CAPABILITIES: 'capabilities'
};

class Game {
    constructor(definition) {
        this.state = ko.observable(new FallingSkyGameState());
        this.scenario = definition.scenario;
        this.ended = ko.observable(false);
        this.lastTurn = ko.observable();
        this.activePanel = ko.observable(ActivePanelIDs.REGIONS);
        this.ActivePanelIDs = ActivePanelIDs;
        this.endOfCard = ko.pureComputed(() => {
            return this.state().sequenceOfPlay.secondFaction() || this.state().sequenceOfPlay.eligibleFactions().length === 0;
        });
        this.winterNext = ko.pureComputed(() => {
            return this.state().currentCard() && this.state().currentCard().type === 'winter';
        });
        this.canUndo = ko.pureComputed(() => {
            return (this.state().discard().length === 0 || _.last(this.state().discard()).type !== 'winter' || this.state().sequenceOfPlay.currentSequenceForCard().numActionsTaken() > 0) && this.state().sequenceOfPlay.canUndo();
        });
    }

    setActivePanel(newPanel) {
        this.activePanel(newPanel);
    }

    start() {
        this.state(new FallingSkyGameState());
        this.scenario.initializeGameState(this.state());
        this.lastTurn(null);
        this.state().startYear();
        this.drawCard();
        this.drawCard();
    }

    drawCard() {
        console.log('Drawing Card');
        if (!this.state().upcomingCard() && this.state().deck().length === 0) {
            this.ended(true);
            return;
        }
        if (this.state().currentCard()) {
            this.state().discard.push(this.state().currentCard());
        }
        this.state().currentCard(this.state().upcomingCard());

        if (this.state().deck().length > 0) {
            this.state().upcomingCard(this.state().deck.pop());
            if(this.state().upcomingCard().type === 'winter') {
                this.state().frost(true);
            }
        }
        else {
            this.state().upcomingCard(null);
        }

        console.log('Current card is ' + (this.state().currentCard() ? this.state().currentCard().title : 'empty'));
        console.log('Upcoming card is ' + (this.state().upcomingCard() ? this.state().upcomingCard().title : 'empty'));
    }

    nextTurn() {
        if (this.endOfCard()) {
            this.state().sequenceOfPlay.updateEligibility();
            this.drawCard();
            this.lastTurn(null);
            return;
        }

        if (this.state().currentCard().type === 'winter') {
            this.state().frost(false);
            Winter.executeWinter(this.state());
            this.lastTurn(this.state().turnHistory.lastTurn());
            this.state().startYear();
            this.drawCard();
            return;
        }

        const nextFaction = this.state().sequenceOfPlay.nextFaction(this.state().currentCard());
        console.log('Next Faction: ' + nextFaction);

        const player = this.state().playersByFaction[nextFaction];
        this.state().turnHistory.startTurn(nextFaction);
        player.takeTurn(this.state());
        this.lastTurn(this.state().turnHistory.lastTurn());

    }

    undo() {

        if(this.state().sequenceOfPlay.undo()) {
            console.log('*** Undoing the last Turn ***');
            this.state().turnHistory.undoLastTurn();
            this.lastTurn(this.state().turnHistory.lastTurn());
        }
        else if(this.state().discard().length > 0) {
            if(this.state().upcomingCard().type === 'winter') {
                this.state().frost(false);
            }
            this.state().deck.push(this.state().upcomingCard());
            this.state().upcomingCard(this.state().currentCard());
            this.state().currentCard(this.state().discard.pop());
            this.lastTurn(null);
        }
    }

    styleSuffixForFaction(factionId) {
        if(factionId === FactionIDs.ROMANS) {
            return 'danger';
        }
        else if(factionId === FactionIDs.BELGAE) {
            return 'warning';
        }
        else if(factionId === FactionIDs.AEDUI) {
            return 'info';
        }
        else if(factionId === FactionIDs.ARVERNI) {
            return 'success';
        }
        else if(factionId === FactionIDs.GERMANIC_TRIBES) {
            return 'default';
        }
        else {
            return 'default';
        }
    }
}

export default Game;