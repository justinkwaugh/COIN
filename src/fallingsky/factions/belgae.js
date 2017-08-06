import _ from '../../lib/lodash';
import FallingSkyFaction from './fallingSkyFaction';
import RegionGroups from '../config/regionGroups';
import FactionIDs from '../config/factionIds';
import TribeIDs from '../config/tribeIds';

class Belgae extends FallingSkyFaction {
    constructor() {
        const definition = {
            id: FactionIDs.BELGAE,
            name: 'Belgae',
            numWarbands: 25,
            numAlliedTribes: 10,
            numCitadels: 1,
            hasLeader: true,
            leaderName: 'Ambiorix'
        };
        super(definition);
    }

    victoryMargin(state) {
        return _.reduce(state.getControlledRegionsForFaction(FactionIDs.BELGAE), function (sum, region) {
            let controlValue = region.controlValue;
            _.each(
                region.tribes(), function (tribe) {
                    if (tribe.isDispersed() && tribe.id !== TribeIDs.SUEBI_NORTH && tribe.id !== TribeIDs.SUEBI_SOUTH) {
                        controlValue -= 1;
                    }
                });

            return sum + controlValue;
        }, 0) + this.numAlliedTribesAndCitadelsPlaced() - 15;
    }

    isHomeRegion(region) {
        return region.group === RegionGroups.BELGICA;
    }
}

export default Belgae