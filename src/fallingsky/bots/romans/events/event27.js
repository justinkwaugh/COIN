import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event27 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.MASSED_GALLIC_ARCHERS,
                state: CapabilityStates.UNSHADED
            });
        return true;
    }
}

export default Event27
