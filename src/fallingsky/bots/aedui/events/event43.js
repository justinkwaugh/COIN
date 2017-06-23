import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';

class Event43 {
    static handleEvent(state) {
        const capability = new Capability(
            {
                id: CapabilityIDs.CONVICTOLITAVIS,
                state: CapabilityStates.UNSHADED,
                factionId: FactionIDs.AEDUI
            });
        state.addCapability(capability);
        return true;
    }
}

export default Event43
