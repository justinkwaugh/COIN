import ko from '../lib/knockout';
import _ from '../lib/lodash';
import FallingSkyGameState from '../fallingsky/state/fallingSkyGameState.js';
import Winter from './phases/winter';
import Events from 'fallingsky/util/events';
import FactionIDs from 'fallingsky/config/factionIds';


class Game {
    constructor(definition) {
        this.state = ko.observable(new FallingSkyGameState());
        this.scenario = definition.scenario;
        this.lastTurn = ko.observable();

        this.endOfCard = ko.pureComputed(() => {
            return this.state().sequenceOfPlay.secondFaction() || this.state().sequenceOfPlay.eligibleFactions().length === 0;
        });
        this.winterNext = ko.pureComputed(() => {
            return this.state().currentCard() && this.state().currentCard().type === 'winter';
        });
        this.canUndo = ko.pureComputed(() => {
            return this.state().sequenceOfPlay.canUndo() || this.state().discard().length > 0;
        });

        this.running = ko.observable(false);
        this.timerId = null;

        Events.on('turnComplete', () => {
            if (!this.running()) {
                return;
            }

            const gameEnd = this.state().victor();
            if (gameEnd) {
                this.timerId = _.delay(() => {
                    this.start();
                    this.nextTurn();
                }, 2000);
                return;
            }
            this.timerId = _.delay(_.bind(this.nextTurn, this), 100);
        });
    }

    start() {
        this.state(new FallingSkyGameState());
        this.scenario.initializeGameState(this.state());
        this.lastTurn(null);
        this.state().startYear();
        this.drawCard();
        this.drawCard();
    }

    run() {
        this.running(true);
        if(!this.state().currentCard()) {
            this.start();
        }
        this.nextTurn();
    }

    stop() {
        this.running(false);
        if(this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }


    drawCard() {
        console.log('Drawing Card');
        if (!this.state().upcomingCard() && this.state().deck().length === 0) {
            return;
        }
        if (this.state().currentCard()) {
            this.state().discard.push(this.state().currentCard());
        }
        this.state().currentCard(this.state().upcomingCard());

        if (this.state().deck().length > 0) {
            this.state().upcomingCard(this.state().deck.pop());
            if (this.state().upcomingCard().type === 'winter') {
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
        try {
            if (this.endOfCard()) {
                this.state().sequenceOfPlay.updateEligibility();
                this.drawCard();
                this.lastTurn(null);
                return;
            }

            if (this.state().currentCard().type === 'winter') {
                this.state().frost(false);
                Winter.executeWinter(this.state());
                if (this.state().victor()) {
                    this.lastTurn(null);
                }
                else {
                    this.lastTurn(this.state().turnHistory.lastTurn());
                    this.state().startYear();
                    this.drawCard();
                }
                return;
            }

            const nextFaction = this.state().sequenceOfPlay.nextFaction(this.state().currentCard());
            console.log('Next Faction: ' + nextFaction);

            const player = this.state().playersByFaction[nextFaction];
            this.state().turnHistory.startTurn(nextFaction);
            try {
                player.takeTurn(this.state(), this.state().turnHistory.currentTurn);
                this.lastTurn(this.state().turnHistory.lastTurn());
            }
            catch (err) {
                if (err.name === 'PlayerInteractionNeededError') {
                    Events.emit('PlayerInteractionRequested', err.interaction);
                }
                else {
                    this.state().turnHistory.rollbackTurn();
                    this.stop();
                    throw err;
                }
            }
        }
        finally {
            Events.emit('turnComplete', {});
        }
    }


    resumeTurn(interaction) {
        const nextFaction = this.state().sequenceOfPlay.nextFaction(this.state().currentCard());
        const player = this.state().playersByFaction[nextFaction];
        try {
            this.state().turnHistory.getCurrentTurn().addInteraction(interaction);
            player.resume(this.state());
            this.lastTurn(this.state().turnHistory.lastTurn());
        }
        catch (err) {
            if (err.name === 'PlayerInteractionNeededError') {
                Events.emit('PlayerInteractionRequested', err.interaction);
            }
            else {
                this.state().turnHistory.rollbackTurn();
                throw err;
            }
        }
    }

    undo() {

        const startOfCard = this.state().sequenceOfPlay.isStartOfCard();
        const lastCard = _.last(this.state().discard());
        const lastWasWinter = lastCard && lastCard.type === 'winter';

        if (!this.state().victor()) {
            this.state().sequenceOfPlay.undo();
        }

        if (this.state().victor() || !startOfCard || lastWasWinter) {
            console.log('*** Undoing the last Turn ***');
            this.state().turnHistory.undoLastTurn();
        }

        const undoDraw = this.state().discard().length > 0 && startOfCard && !this.state().victor();
        if (undoDraw) {
            if (this.state().upcomingCard() && this.state().upcomingCard().type === 'winter') {
                this.state().frost(false);
            }
            else if (lastWasWinter) {
                this.state().frost(true);
                this.state().undoYear();
            }
            this.state().deck.push(this.state().upcomingCard());
            this.state().upcomingCard(this.state().currentCard());
            this.state().currentCard(this.state().discard.pop());
        }

        if (this.state().sequenceOfPlay.isStartOfCard()) {
            this.lastTurn(null);
        }
        else {
            this.lastTurn(this.state().turnHistory.lastTurn());
        }

        this.state().victor(null);
    }

    factionsByVictory() {
        return _(this.state().factions).reject(faction => faction.id === FactionIDs.GERMANIC_TRIBES).sortBy(
            (faction) => {
                let priority = '' + (50 - faction.victoryMargin(this.state()));
                if (this.state().playersByFaction[faction.id].isNonPlayer) {
                    priority += '-' + 'a';
                }
                else if (faction.id === FactionIDs.ROMANS) {
                    priority += '-' + 'b';
                }
                else if (faction.id === FactionIDs.ARVERNI) {
                    priority += '-' + 'c';
                }
                else if (faction.id === FactionIDs.AEDUI) {
                    priority += '-' + 'd';
                }
                else if (faction.id === FactionIDs.BELGAE) {
                    priority += '-' + 'd';
                }
                return priority;
            }).value();
    }
}

export default Game;