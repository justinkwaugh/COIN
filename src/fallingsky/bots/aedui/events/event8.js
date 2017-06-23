import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';

class Event8 {
    static handleEvent(state) {
        const capability = new Capability(
            {
                id: CapabilityIDs.BAGGAGE_TRAINS,
                state: CapabilityStates.SHADED,
                factionId: FactionIDs.AEDUI
            });
        state.addCapability(capability);
        return true;
    }
}

export default Event8
