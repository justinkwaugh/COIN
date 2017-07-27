import Action from './action';

class LostEagle extends Action {

    constructor(args) {
        super(args);
    }

    doExecute(state) {
        const legion = state.romans.fallenLegions.pop();
        state.romans.lostEagle(legion);
        state.romans.lostEagleYear(state.year());

        console.log('Removing one fallen legion from the game');
    }

    doUndo(state) {
        state.romans.fallenLegions.push(state.romans.lostEagle());
        state.romans.lostEagle(null);
        state.romans.lostEagleYear(-1);

        console.log('Bring lost eagle legion back to fallen');
    }

    instructions(state) {
        return ['Remove a fallen Legion from the game'];
    }
}

export default LostEagle
