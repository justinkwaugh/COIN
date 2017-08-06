import _ from 'lib/lodash';
import TribeIDs from 'fallingsky/config/tribeIds';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import AddColony from 'fallingsky/actions/addColony';

class CommonEvent71 {
    static handleEvent(state, factionId) {
        const faction = state.factionsById[factionId];
        if(!faction.hasAvailableAlliedTribe()) {
            return false;
        }

        const targetRegion = _(state.regions).filter(region=>(region.inPlay() && (region.controllingFactionId() === factionId || !region.controllingFactionId()))).sample();
        if(!targetRegion) {
            return false;
        }

        AddColony.execute(state, {
            regionId: targetRegion.id
        });

        PlaceAlliedTribe.execute(state, {
            factionId,
            regionId: targetRegion.id,
            tribeId: TribeIDs.COLONY
        });

        return true;
    }
}

export default CommonEvent71;
