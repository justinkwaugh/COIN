import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event38 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.DIVICIACUS,
                state: CapabilityStates.SHADED
            });
        return true;
    }
}

export default Event38
