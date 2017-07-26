import FactionIDs from '../../../config/factionIds';
import Capability from '../../../../common/capability';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event10 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.BALLISTAE,
                state: CapabilityStates.SHADED,
                factionId: FactionIDs.ROMANS
            });
        return true;
    }
}

export default Event10
