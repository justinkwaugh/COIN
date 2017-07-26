import FactionIDs from '../../../config/factionIds';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event63 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.WINTER_CAMPAIGN,
                state: CapabilityStates.UNSHADED
            });
        return true;
    }
}

export default Event63
