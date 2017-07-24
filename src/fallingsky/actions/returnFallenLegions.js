import _ from 'lib/lodash';
import Action from './action';
import {SenateApprovalStateNames} from 'fallingsky/config/senateApprovalStates';

class ReturnFallenLegions extends Action {

    constructor(args) {
        super(args);
        this.count = args.count;
    }

    doExecute(state) {
        const count = this.count;
        const legions = state.romans.getLegionsFromFallen(count);
        state.romans.returnLegionsToTracks(legions);
        console.log('Returning ' + count + 'x ' + state.romans.name + ' Legions from Fallen to Tracks');
    }

    doUndo(state) {
        const faction = state.romans;
        const count = this.count;

        const legions = faction.removeLegions(count);
        faction.returnLegions(legions);
        console.log('Returning ' + count + 'x ' + state.romans.name + ' Legions from Tracks to Fallen');
    }

    instructions(state) {
        const faction = state.romans;
        const count = this.count;
        return ['Return  ' + count + 'x ' + faction.name + ' Legions from Fallen to Tracks'];
    }
}

export default ReturnFallenLegions;