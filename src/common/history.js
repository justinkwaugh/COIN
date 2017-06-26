class History {
    constructor() {
        this.actions = [];
    }

    addAction(action) {
        this.actions.push(action);
    }

    undo(state) {
        const action = this.actions.pop();
        action.doUndo(state);
    }
}

export default History;