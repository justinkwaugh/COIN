import FactionIDs from '../../../config/factionIds';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event8 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.BAGGAGE_TRAINS,
                state: CapabilityStates.SHADED,
                factionId: FactionIDs.BELGAE
            });
        return true;
    }
}

export default Event8
