
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event13 {
    static handleEvent(state) {

        AddCapability.execute(state,
            {
                id: CapabilityIDs.BALEARIC_SLINGERS,
                state: CapabilityStates.SHADED
            });
        return true;
    }
}

export default Event13
