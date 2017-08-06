import Action from './action';
import TribeIDs from 'fallingsky/config/tribeIds';

class AddColony extends Action {

    constructor(args) {
        super(args);

        this.regionId = args.regionId;
    }

    doExecute(state) {
        const region = state.regionsById[this.regionId];
        const colony = state.tribesById[TribeIDs.COLONY];
        region.addColony(colony);
        console.log('Adding colony to region ' + region.name);
    }

    doUndo(state) {
        const region = state.regionsById[this.regionId];
        region.removeColony();

        console.log('Removing colony from region ' + region.name);
    }

    instructions(state) {
        const region = state.regionsById[this.regionId];
        return ['Place the +1 marker and Colony marker in region ' + region.name];
    }
}

export default AddColony
