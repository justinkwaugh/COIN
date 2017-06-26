import _ from '../../lib/lodash';

class Action {

    constructor(args) {

    }

    static execute(state, args) {
        const action = new this(args);
        action.doExecute(state);
        state.history.addAction(action);
    }

    doUndo() {

    }


    doExecute() {

    }

}

export default Action;