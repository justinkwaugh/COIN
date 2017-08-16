import Action from './action';
import Capability from '../../common/capability';
import {CapabilityTitles} from '../config/capabilities';

class AddCapability extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.id = args.id;
        this.state = args.state;
    }

    doExecute(state) {
        const capability = new Capability(
            {
                id: this.id,
                state: this.state,
                factionId: this.factionId
            });
        state.addCapability(capability);
    }

    doUndo(state) {
        state.removeCapability(this.id);
    }

    instructions(state) {
        return ['Added ' + CapabilityTitles[this.id] + ' capability' + (this.factionId ? ' to ' + this.factionId : '')];
    }

}

export default AddCapability;
