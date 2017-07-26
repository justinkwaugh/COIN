
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event12 {
    static handleEvent(state) {

        AddCapability.execute(state,
            {
                id: CapabilityIDs.TITUS_LABIENUS,
                state: CapabilityStates.UNSHADED
            });
        return true;
    }
}

export default Event12
