import Action from './action';
import {CapabilityTitles} from '../config/capabilities';

class RemoveCapability extends Action {

    constructor(args) {
        super(args);

        this.id = args.id;
        this.removedCapability = args.removedCapability;
    }

    doExecute(state) {
        this.removedCapability = state.capabilitiesById[this.id];
        state.removeCapability(this.id);
    }

    doUndo(state) {
        state.addCapability(this.removedCapability);
    }

    instructions(state) {
        return ['Remove ' + CapabilityTitles[this.id] + ' capability'];
    }

}

export default RemoveCapability
