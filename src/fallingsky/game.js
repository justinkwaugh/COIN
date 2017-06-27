
import ko from '../lib/knockout';
import FactionIDs from '../fallingsky/config/factionIds';
import FallingSkyGameState from '../fallingsky/state/fallingSkyGameState.js';
import Winter from './phases/winter';
import Turn from '../common/turn.js';

const ActivePanelIDs = {
    BOARD: 'board',
    REGIONS: 'regions',
    FACTIONS: 'factions'
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
    }

    setActivePanel(newPanel) {
        this.activePanel(newPanel);
    }

    start() {
        this.state(new FallingSkyGameState());
        this.scenario.initializeGameState(this.state());
        this.lastTurn(null);
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
            const turn = new Turn({ number: this.state().turnHistory.nextTurnNumber(), factionId: 'Germanic', actionStartIndex: this.state().actionHistory.currentIndex()});
            Winter.executeWinter(this.state());
            turn.actionEndIndex = this.state().actionHistory.currentIndex();
            turn.commandAction = 'Winter';
            this.state().turnHistory.addTurn(turn);
            this.lastTurn(turn);
            this.drawCard();
            return;
        }

        const nextFaction = this.state().sequenceOfPlay.nextFaction(this.state().currentCard());
        console.log('Next Faction: ' + nextFaction);

        const player = this.state().playersByFaction[nextFaction];
        const turn = new Turn({ number: this.state().turnHistory.nextTurnNumber(), factionId: nextFaction, actionStartIndex: this.state().actionHistory.currentIndex()});
        const commandAction = player.takeTurn(this.state());
        turn.actionEndIndex = this.state().actionHistory.currentIndex();
        turn.commandAction = commandAction;
        this.state().turnHistory.addTurn(turn);
        this.lastTurn(turn);
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