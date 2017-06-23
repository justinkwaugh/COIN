import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';

class Event15 {
    static handleEvent(state) {
        const capability = new Capability(
            {
                id: CapabilityIDs.LEGIO_X,
                state: CapabilityStates.UNSHADED
            });
        state.addCapability(capability);
        return true;
    }
}

export default Event15