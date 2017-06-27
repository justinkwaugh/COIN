import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event43 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.CONVICTOLITAVIS,
                state: CapabilityStates.UNSHADED,
                factionId: FactionIDs.AEDUI
            });
        return true;
    }
}

export default Event43
