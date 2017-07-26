import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';
import FactionIDs from 'fallingsky/config/factionIds';

class Event27 {
    static handleEvent(state) {
        const arverni = state.playersByFaction[FactionIDs.ARVERNI];
        const romans = state.playersByFaction[FactionIDs.ROMANS];
        if(!arverni.isNonPlayer && romans.isNonPlayer) {
            AddCapability.execute(state,
                                  {
                                      id: CapabilityIDs.MASSED_GALLIC_ARCHERS,
                                      state: CapabilityStates.UNSHADED
                                  });
            return true;
        }
        return false;
    }
}

export default Event27
