
import FallingSkyGameState from '../fallingsky/state/fallingSkyGameState.js';
import Winter from './phases/winter';

class Game {
    constructor(definition) {
        this.state = null;
        this.scenario = definition.scenario;
        this.ended = false;
    }

    start() {
        this.state = new FallingSkyGameState();
        this.scenario.initializeGameState(this.state);
        this.drawCard();
        this.drawCard();
    }

    drawCard() {
        console.log('Drawing Card');
        if (!this.state.upcomingCard() && this.state.deck().length === 0) {
            this.ended = true;
            return;
        }
        if (this.state.currentCard()) {
            this.state.discard.push(this.state.currentCard());
        }
        this.state.currentCard(this.state.upcomingCard());

        if (this.state.deck().length > 0) {
            this.state.upcomingCard(this.state.deck.pop());
            if(this.state.upcomingCard().type === 'winter') {
                this.state.frost(true);
            }
        }
        else {
            this.state.upcomingCard(null);
        }

        console.log('Current card is ' + (this.state.currentCard() ? this.state.currentCard().title : 'empty'));
        console.log('Upcoming card is ' + (this.state.upcomingCard() ? this.state.upcomingCard().title : 'empty'));
    }

    nextTurn() {
        if (this.state.currentCard().type === 'winter') {
            this.state.frost(false);
            Winter.executeWinter(this.state);
            this.drawCard();
            return;
        }

        const nextFaction = this.state.sequenceOfPlay.nextFaction(this.state.currentCard());
        console.log('Next Faction: ' + nextFaction);
        const player = this.state.playersByFaction[nextFaction];
        player.takeTurn(this.state);
        if (this.state.sequenceOfPlay.secondFaction() || this.state.sequenceOfPlay.eligibleFactions().length === 0) {
            console.log('End of event: ' + nextFaction);
            this.state.sequenceOfPlay.updateEligibility();
            this.drawCard();
        }
    }
}

export default Game;