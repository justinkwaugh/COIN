import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event15 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.LEGIO_X,
                state: CapabilityStates.SHADED
            });
        return true;
    }
}

export default Event15