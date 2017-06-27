import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event15 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.LEGIO_X,
                state: CapabilityStates.UNSHADED
            });
        return true;
    }
}

export default Event15