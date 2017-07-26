import FactionIDs from '../../../config/factionIds';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event30 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.VERCINGETORIXS_ELITE,
                state: CapabilityStates.SHADED
            });
        return true;
    }
}

export default Event30
