class TurnHistory {
    constructor() {
        this.turns = [];
    }

    addTurn(turn) {
        this.turns.push(turn);
    }

    undo(state) {
        const turn = this.turns.pop();
        // start action index to end action index
    }

    nextTurnNumber() {
        return this.turns.length + 1;
    }
}

export default TurnHistory;