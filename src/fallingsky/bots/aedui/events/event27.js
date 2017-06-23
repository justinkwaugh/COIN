import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';

class Event27 {
    static handleEvent(state) {
        const capability = new Capability(
            {
                id: CapabilityIDs.MASSED_GALLIC_ARCHERS,
                state: CapabilityStates.UNSHADED
            });
        state.addCapability(capability);
        return true;
    }
}

export default Event27
