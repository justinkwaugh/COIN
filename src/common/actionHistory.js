import _ from '../lib/lodash';
class ActionHistory {
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

    currentIndex() {
        return this.actions.length;
    }

    getActionRange(start, end) {
        return _.slice(this.actions, start, end);
    }
}

export default ActionHistory;