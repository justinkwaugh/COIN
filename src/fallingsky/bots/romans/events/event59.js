import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event59 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.GERMANIC_HORSE,
                state: CapabilityStates.UNSHADED
            });
        return true;
    }
}

export default Event59
