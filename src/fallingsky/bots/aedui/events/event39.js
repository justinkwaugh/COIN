import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event39 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.RIVER_COMMERCE,
                state: CapabilityStates.UNSHADED
            });
        return true;
    }
}

export default Event39
