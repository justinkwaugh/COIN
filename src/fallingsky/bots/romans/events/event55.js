import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event55 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.COMMIUS,
                state: CapabilityStates.UNSHADED
            });
        return true;
    }
}

export default Event55
