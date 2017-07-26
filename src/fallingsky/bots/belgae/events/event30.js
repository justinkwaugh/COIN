import FactionIDs from '../../../config/factionIds';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event30 {
    static handleEvent(state) {
        const arverni = state.playersByFaction[FactionIDs.ARVERNI];
        const romans = state.playersByFaction[FactionIDs.ROMANS];
        if (!arverni.isNonPlayer && romans.isNonPlayer) {
            AddCapability.execute(state,
                                  {
                                      id: CapabilityIDs.VERCINGETORIXS_ELITE,
                                      state: CapabilityStates.UNSHADED
                                  });
            return true;
        }
        return false;
    }
}

export default Event30
