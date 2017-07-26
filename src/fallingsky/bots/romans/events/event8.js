import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event8 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.BAGGAGE_TRAINS,
                state: CapabilityStates.UNSHADED,
                factionId: FactionIDs.ROMANS
            });
        return true;
    }
}

export default Event8
