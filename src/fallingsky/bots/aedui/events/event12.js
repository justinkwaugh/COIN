import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';

class Event12 {
    static handleEvent(state) {
        const capability = new Capability(
            {
                id: CapabilityIDs.TITUS_LABIENUS,
                state: CapabilityStates.UNSHADED
            });
        state.addCapability(capability);
        return true;
    }
}

export default Event12
