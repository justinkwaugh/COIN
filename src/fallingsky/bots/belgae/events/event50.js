import _ from 'lib/lodash';
import FactionIDs from '../../../config/factionIds';
import {CapabilityStates, CapabilityIDs} from 'fallingsky/config/capabilities';
import RemoveCapability from 'fallingsky/actions/removeCapability';


class Event50 {
    static handleEvent(state) {
        const capability = _(state.capabilities()).shuffle().find(capability => {
            if(capability.state !== CapabilityStates.UNSHADED) {
                return;
            }

            let capabilityToRemove = null;

            if(state.playersByFaction[FactionIDs.ROMANS].isNonPlayer) {
                if(capability.factionId === FactionIDs.ROMANS) {
                    capabilityToRemove = capability;
                }
                else if(_.indexOf([CapabilityIDs.TITUS_LABIENUS,
                                   CapabilityIDs.BALEARIC_SLINGERS,
                                  CapabilityIDs.LEGIO_X,
                                  CapabilityIDs.DIVICIACUS,
                                  CapabilityIDs.COMMIUS,
                                  CapabilityIDs.GERMANIC_HORSE,
                                  CapabilityIDs.WINTER_CAMPAIGN], capability.id) >= 0) {
                    capabilityToRemove = capability;
                }
            }

            if(!capabilityToRemove && !state.playersByFaction[FactionIDs.AEDUI].isNonPlayer) {
            if(capability.factionId === FactionIDs.AEDUI) {
                    capabilityToRemove = capability;
                }
                else if(_.indexOf([CapabilityIDs.DIVICIACUS,
                                  CapabilityIDs.RIVER_COMMERCE,
                                  CapabilityIDs.CONVICTOLITAVIS], capability.id) >= 0) {
                    capabilityToRemove = capability;
                }
            }

            if(!capabilityToRemove) {

            }

            return capabilityToRemove;
        });

        if(capability) {
            RemoveCapability.execute(state, {
                    id: capability.id
                });
            return true;
        }

        return false;
    }
}

export default Event50;