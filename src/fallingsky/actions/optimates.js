import Action from './action';

class Optimates extends Action {

    constructor(args) {
        super(args);
    }

    doExecute(state) {
        state.optimates(true);
        console.log('Adding Optimates Effect');
    }

    doUndo(state) {
        state.optimates(false);

        console.log('Removing Optimates Effect');
    }

    instructions(state) {
        return ['Place Optimates into effect'];
    }
}

export default Optimates
