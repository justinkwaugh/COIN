import _ from '../lib/lodash';

class ActionHistory {
    constructor(state) {
        this.state = state;
        this.actions = [];
    }

    toJSON() {
        return {
            actions: this.actions
        };
    }
    
    loadGameState(json) {
        const self = this;

        json.actions.forEach((value) => {
            self.actions.push(value);
        });
    }

    addAction(action) {
        this.actions.push(action);
    }

    undo() {
        const action = this.actions.pop();
        action.doUndo(this.state);
    }

    currentIndex() {
        return this.actions.length;
    }

    getActionRange(start, end) {
        return _.slice(this.actions, start, end);
    }

    undoRange(start, end) {
        const actualEnd = end || this.actions.length;

        if (actualEnd <= start) {
            return [];
        }

        _.each(_.range(start,actualEnd), () => {
            this.undo();
        });
    }
}

export default ActionHistory;