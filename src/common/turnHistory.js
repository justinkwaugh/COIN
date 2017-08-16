import _ from '../lib/lodash';
import Turn from './turn';
import TurnContext from 'common/turnContext';


class TurnHistory {
    constructor(state) {
        this.state = state;
        this.turns = [];
        this.currentTurn = null;
    }

    toJSON() {
        return {
            turns: this.turns,
            currentTurn: this.currentTurn
        };
    }

    loadGameState(json) {
        const self = this;

        json.turns.forEach((value) => {
            self.turns.push(new Turn(self.state, value));
        });
        if (json.currentTurn === null)
            self.currentTurn = null;
        else {
            self.currentTurn = new Turn(self.state, json.currentTurn);
            self.currentTurn.loadGameState(json.currentTurn);
        }
    }

    startTurn(factionId) {
        this.currentTurn = new Turn(this.state, {
            number: this.nextTurnNumber(),
            factionId: factionId,
            actionStartIndex: this.state.actionHistory.currentIndex()
        });
        this.currentTurn.pushContext(new TurnContext({ currentFactionId: factionId }));
    }

    rollbackTurn() {
        if (this.currentTurn) {
            this.currentTurn.undo();
        }
    }

    rollbackCurrentAction() {
        this.currentTurn.rollbackActionGroup();
    }

    commitTurn(action) {
        this.currentTurn.commandAction = action;
        this.currentTurn.actionEndIndex = this.state.actionHistory.currentIndex();
        this.currentTurn.clearCheckpoints();
        this.turns.push(this.currentTurn);
        this.currentTurn = null;
    }

    undoLastTurn() {
        const turn = this.turns.pop();
        turn.undo();
    }

    getCurrentTurn() {
        return this.currentTurn;
    }

    lastTurn() {
        return _.last(this.turns);
    }

    nextTurnNumber() {
        return this.turns.length + 1;
    }

}

export default TurnHistory;