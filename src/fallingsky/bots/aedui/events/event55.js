import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';

class Event55 {
    static handleEvent(state) {
        const capability = new Capability(
            {
                id: CapabilityIDs.COMMIUS,
                state: CapabilityStates.UNSHADED,
                factionId: FactionIDs.ROMANS
            });
        state.addCapability(capability);
        return true;
    }
}

export default Event55
