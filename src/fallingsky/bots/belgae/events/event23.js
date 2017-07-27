import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import RemovePieces from 'fallingsky/actions/removePieces';
class Event23 {
    static handleEvent(state) {
        const regionWithCitadelAndLegion = _.find(_.shuffle(state.regions), region=> {
            if(!region.getCitadelForFaction(FactionIDs.BELGAE)) {
                return false;
            }

            if(region.getLegions().length === 0) {
                return false;
            }
        });

        if(!regionWithCitadelAndLegion) {
            return false;
        }

        const legionsToRemove = _.take(regionWithCitadelAndLegion.getLegions(),1);
        RemovePieces.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: regionWithCitadelAndLegion.id,
            pieces: legionsToRemove
        });

        state.sequenceOfPlay.ineligibleThroughNext(FactionIDs.ROMANS);

        return true;
    }
}

export default Event23
